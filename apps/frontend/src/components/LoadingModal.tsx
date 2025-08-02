import React from "react";
import { Bot } from "lucide-react";

const LoadingModal: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="mx-auto max-w-sm rounded-lg bg-white p-8 text-center shadow-xl dark:bg-zinc-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
          Generating AI Response
        </h2>
        <div className="mb-6 flex items-center justify-center">
          <Bot className="h-12 w-12 animate-spin text-primary-500" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait, this can take up to 10-12 seconds.
        </p>
      </div>
    </div>
  );
};

export default LoadingModal;
