import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { DocumentInput } from './components/DocumentInput';
import { Scorecard } from './components/Scorecard';
import { GapsTable } from './components/GapsTable';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ExpertReviewBanner } from './components/ExpertReviewBanner';
import { analyzeDocuments } from './services/geminiService';
import type { AnalysisResult } from './types';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (docs: { [key: string]: string }) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      if (!docs.businessPlan && !docs.legalDocs && !docs.policyDocs) {
        throw new Error("Please provide content for at least one document to analyze.");
      }
      const result = await analyzeDocuments(docs);
      setAnalysisResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Analysis Failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {!analysisResult && !isLoading && (
          <DocumentInput onAnalyze={handleAnalyze} />
        )}
        
        {isLoading && <LoadingSpinner />}

        {error && (
          <div className="text-center p-8">
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg shadow-lg max-w-2xl mx-auto" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
            <button
              onClick={handleReset}
              className="mt-6 bg-brand-secondary hover:bg-brand-accent text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        )}

        {analysisResult && (
          <div className="fade-in">
             {analysisResult.overallScore < 60 && <ExpertReviewBanner />}
            <div className="flex justify-center mb-8">
              <button
                onClick={handleReset}
                className="bg-brand-secondary hover:bg-brand-accent text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                Start New Analysis
              </button>
            </div>
            <Scorecard result={analysisResult} />
            <GapsTable gaps={analysisResult.gaps} />
          </div>
        )}
      </main>
      <style>{`
        .fade-in {
          animation: fadeIn 1s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
