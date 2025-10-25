
import React from 'react';

export const LoadingSpinner: React.FC = () => {
    const messages = [
        "Analyzing regulatory compliance...",
        "Mapping documents to QCB framework...",
        "Detecting potential compliance gaps...",
        "Calculating readiness score...",
        "Generating expert recommendations...",
    ];
    const [message, setMessage] = React.useState(messages[0]);
    
    React.useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <svg
        className="animate-spin h-12 w-12 text-brand-accent"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p className="mt-4 text-lg text-gray-300 font-semibold transition-opacity duration-500">{message}</p>
    </div>
  );
};
