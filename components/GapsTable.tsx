import React from 'react';
import type { Gap } from '../types';
import { Severity } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { expertResources } from '../constants';

interface GapsTableProps {
  gaps: Gap[];
}

const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
    const baseClasses = 'inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium';
    if (severity === Severity.High) {
        return <span className={`${baseClasses} bg-red-500/20 text-red-300`}><XCircleIcon /> High</span>;
    }
    if (severity === Severity.Medium) {
        return <span className={`${baseClasses} bg-yellow-500/20 text-yellow-300`}><ExclamationTriangleIcon /> Medium</span>;
    }
    return <span className={`${baseClasses} bg-blue-500/20 text-blue-300`}>Low</span>;
};

export const GapsTable: React.FC<GapsTableProps> = ({ gaps }) => {
  if (gaps.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-800 rounded-xl border border-gray-700">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
        <h3 className="mt-4 text-2xl font-semibold text-white">No Compliance Gaps Found!</h3>
        <p className="mt-2 text-gray-400">Congratulations, your documents appear to meet all key regulatory requirements.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white">Compliance Gap Analysis</h2>
            <p className="text-gray-400 mt-1">Review the identified gaps and follow the recommendations to improve your readiness score.</p>
        </div>
        <div className="overflow-x-auto">
            <div className="min-w-full">
                {gaps.map((gap, index) => {
                    const resource = expertResources[gap.expertId];
                    return (
                        <div key={gap.gapId} className={`border-t border-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700/50'}`}>
                            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-3">
                                    <p className="text-sm font-semibold text-gray-400 mb-1">Rule Violated</p>
                                    <p className="text-white font-mono">{gap.rule}</p>
                                </div>
                                <div className="md:col-span-1">
                                    <p className="text-sm font-semibold text-gray-400 mb-1">Severity</p>
                                    <SeverityBadge severity={gap.severity} />
                                </div>
                                <div className="md:col-span-4">
                                    <p className="text-sm font-semibold text-gray-400 mb-1">Description</p>
                                    <p className="text-gray-300">{gap.description}</p>
                                </div>
                                <div className="md:col-span-4">
                                    <p className="text-sm font-semibold text-gray-400 mb-1">Recommendation</p>
                                    <p className="text-gray-300">{gap.recommendation}</p>
                                    {resource && (
                                        <div className="mt-3 border-l-2 border-brand-accent pl-3">
                                            <p className="text-xs font-semibold text-gray-400">Recommended Support Service:</p>
                                            <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-brand-accent hover:underline">
                                                {resource.name}
                                            </a>
                                            <p className="text-xs text-gray-400">{resource.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};
