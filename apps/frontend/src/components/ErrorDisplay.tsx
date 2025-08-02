import React from "react";

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onReset: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onReset,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="ml-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Request Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">
            Something went wrong while processing your request.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-700 dark:text-red-300 text-base leading-relaxed">
            {error}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onRetry}
          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-6 py-4 rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Try Again
        </button>
        <button
          onClick={onReset}
          className="px-6 py-4 rounded-lg text-base font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};
