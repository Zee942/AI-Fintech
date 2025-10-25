import React, { useState } from 'react';

export const ExpertReviewBanner: React.FC = () => {
    const [flagged, setFlagged] = useState(false);

    const handleFlag = () => {
        setFlagged(true);
    };

    if (flagged) {
        return (
            <div className="mb-8 p-4 bg-green-900/50 border border-green-700 text-green-300 rounded-lg shadow-lg text-center transition-all duration-300">
                <p className="font-semibold">✅ This assessment has been successfully flagged for manual expert review.</p>
            </div>
        )
    }

    return (
        <div className="mb-8 p-4 bg-yellow-900/50 border border-yellow-700 text-yellow-300 rounded-lg shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
                <div className="text-yellow-400 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mr-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold">Expert Review Recommended</h3>
                    <p className="text-sm">Due to the number of critical gaps identified, a manual review by a compliance expert is highly recommended.</p>
                </div>
            </div>
            <button
                onClick={handleFlag}
                className="w-full sm:w-auto flex-shrink-0 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
                Flag for Review
            </button>
        </div>
    );
};
