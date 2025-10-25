import React, { useState, useRef, useEffect } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import mammoth from 'mammoth';

const MOCK_DATA = {
    businessPlan: `PayQatar Business Plan
    
    1. Executive Summary
    PayQatar is a mobile payment solution aiming to revolutionize the fintech landscape in Doha. We will offer peer-to-peer transfers and merchant payment services. Our initial funding is QAR 500,000.
    
    2. Team
    Our team is composed of experienced developers and business strategists. We are currently searching for a Head of Compliance.
    
    3. Technology
    Our platform will be built on a secure cloud infrastructure using AWS servers located in their Bahrain region to ensure low latency for our users in the Middle East.`,
    
    legalDocs: `Legal Structure of PayQatar
    
    PayQatar is registered as a Limited Liability Company (LLC) in Qatar. The company's organizational chart is currently under development but will feature a flat hierarchy to promote agility. Key roles will be defined in Q3.`,

    policyDocs: `PayQatar Draft Policies
    
    Data Privacy: We are committed to user privacy and will develop a policy in line with international best practices.
    
    AML Policy: PayQatar acknowledges the importance of AML/CTF regulations. We will implement a basic transaction flagging system for unusually large transfers.`
};

interface DocumentInputProps {
  onAnalyze: (docs: { [key: string]: string }) => void;
}

type Tab = 'businessPlan' | 'legalDocs' | 'policyDocs';

export const DocumentInput: React.FC<DocumentInputProps> = ({ onAnalyze }) => {
  const [activeTab, setActiveTab] = useState<Tab>('businessPlan');
  const [docs, setDocs] = useState({
    businessPlan: '',
    legalDocs: '',
    policyDocs: '',
  });
  const [parsingStates, setParsingStates] = useState({
    businessPlan: false,
    legalDocs: false,
    policyDocs: false,
  });

  const fileInputRefs = {
    businessPlan: useRef<HTMLInputElement>(null),
    legalDocs: useRef<HTMLInputElement>(null),
    policyDocs: useRef<HTMLInputElement>(null),
  };
  
  useEffect(() => {
    // Configure the PDF.js worker from a CDN. This is necessary for the library to work correctly.
    // This is done in an effect to ensure it runs only on the client after the component mounts.
    GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocs(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyzeClick = () => {
    onAnalyze(docs);
  };
  
  const handleLoadMockData = () => {
    setDocs(MOCK_DATA);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, docType: Tab) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingStates(prev => ({ ...prev, [docType]: true }));

    try {
        const arrayBuffer = await file.arrayBuffer();
        let fullText = '';

        if (file.type === "application/pdf") {
            const pdf = await getDocument(arrayBuffer).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                // FIX: Type error on `textContent.items.map`. Not all items have a `str` property.
                // Using a type guard (`'str' in item`) to safely access the property.
                const pageText = textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ');
                fullText += pageText + '\n\n';
            }
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ arrayBuffer });
            fullText = result.value;
        } else {
             throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
        }

        setDocs(prev => ({ ...prev, [docType]: fullText.trim() }));
    } catch (error) {
        console.error("Error parsing file:", error);
        alert(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
        setParsingStates(prev => ({ ...prev, [docType]: false }));
        if (e.target) {
            e.target.value = ''; // Reset file input to allow re-uploading the same file
        }
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'businessPlan', label: 'Business Plan' },
    { id: 'legalDocs', label: 'Legal Docs' },
    { id: 'policyDocs', label: 'Policy Docs' },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Provide Startup Documents</h2>
        <p className="text-gray-400 mb-6">
          Paste content directly or upload PDF/DOCX files for each document type.
        </p>

        <div className="border-b border-gray-600 mb-4">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-brand-accent text-brand-accent'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div>
          {tabs.map(tab => (
            <div key={tab.id} className={activeTab === tab.id ? '' : 'hidden'}>
              <textarea
                name={tab.id}
                value={docs[tab.id]}
                onChange={handleInputChange}
                placeholder={`Paste your ${tab.label} content here...`}
                className="w-full h-48 bg-gray-900 text-gray-300 border border-gray-600 rounded-md p-4 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-shadow duration-200 resize-none"
              />
               <div className="mt-3 flex items-center justify-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-xs">OR</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>
                <div className="mt-3">
                    <input
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => handleFileChange(e, tab.id)}
                        ref={fileInputRefs[tab.id]}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRefs[tab.id].current?.click()}
                        disabled={parsingStates[tab.id]}
                        className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2.5 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {parsingStates[tab.id] ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Parsing File...
                            </>
                        ) : (
                           `Upload ${tab.label} (PDF, DOCX)`
                        )}
                    </button>
                </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button 
            onClick={handleLoadMockData}
            className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 2a.5.5 0 01.5.5V4h5V2.5a.5.5 0 011 0V4h.25a1.75 1.75 0 011.75 1.75v8.5a3.75 3.75 0 01-3.75 3.75h-3.5A3.75 3.75 0 015 14.25v-8.5A1.75 1.75 0 016.75 4H7V2.5a.5.5 0 01.5-.5zM6.5 5A.25.25 0 006.25 5.25v8.5c0 1.517 1.233 2.75 2.75 2.75h3.5c1.517 0 2.75-1.233 2.75-2.75v-8.5A.25.25 0 0013.75 5h-7.5z" clipRule="evenodd" />
              <path d="M8.5 6.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
            </svg>
            Load Mock Data
          </button>
          <button
            onClick={handleAnalyzeClick}
            className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg"
          >
            Analyze Readiness
          </button>
        </div>
      </div>
    </div>
  );
};