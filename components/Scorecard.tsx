import React from 'react';
import type { AnalysisResult } from '../types';
import { Category } from '../types';

interface ScorecardProps {
  result: AnalysisResult;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-400';
};

const getBackgroundColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 50) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
};

const ScoreInfoTooltip: React.FC = () => (
    <div className="relative group">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 border border-gray-600 text-gray-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            The overall score is a weighted average of the categories (Capital: 30%, AML: 30%, Governance: 20%, Data Residency: 20%). Scores are impacted by the number and severity of identified compliance gaps.
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-600"></div>
        </div>
    </div>
);

const CircularProgress: React.FC<{ score: number }> = ({ score }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colorClass = score >= 80 ? 'stroke-green-400' : score >= 50 ? 'stroke-yellow-400' : 'stroke-red-400';

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="stroke-gray-700"
          strokeWidth="10"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-sm text-gray-400">Readiness</span>
      </div>
    </div>
  );
};

const CategoryScoreBar: React.FC<{ category: string; score: number }> = ({ category, score }) => {
    return (
      <div className={`p-4 rounded-lg ${getBackgroundColor(score)}`}>
        <div className="flex justify-between items-baseline mb-1">
          <h4 className="font-semibold text-gray-200">{category}</h4>
          <span className={`font-bold text-lg ${getScoreColor(score)}`}>{score}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className={`${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'} h-2.5 rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
    );
  };

export const Scorecard: React.FC<ScorecardProps> = ({ result }) => {
  const { overallScore, categoryScores } = result;

  return (
    <div className="mb-8 p-6 md:p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
      <div className="flex justify-center items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold text-white">Readiness Scorecard</h2>
        <ScoreInfoTooltip />
      </div>
      <div className="flex flex-col md:flex-row items-center justify-around gap-8">
        <div className="flex-shrink-0">
          <CircularProgress score={overallScore} />
        </div>
        <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CategoryScoreBar category="AML / CTF" score={categoryScores[Category.AML]} />
          <CategoryScoreBar category="Governance" score={categoryScores[Category.Governance]} />
          <CategoryScoreBar category="Capital" score={categoryScores[Category.Capital]} />
          <CategoryScoreBar category="Data Residency" score={categoryScores[Category.DataResidency]} />
        </div>
      </div>
    </div>
  );
};
