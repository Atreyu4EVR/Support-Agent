import React from "react";
import { X, Bot, Github, ExternalLink } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-zinc-800 px-6 py-6 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-700 dark:hover:text-gray-200"
            aria-label="Close modal"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal content */}
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 sm:mx-0 sm:h-10 sm:w-10">
              <Bot className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                About Support Agent
              </h3>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  The Support Agent is an AI-powered assistant designed to help
                  BYU-Idaho students, faculty, and staff find answers to common
                  questions and navigate university resources.
                </p>

                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      What can I help with?
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Financial aid and scholarship information</li>
                      <li>Registration and academic planning</li>
                      <li>Student housing and campus life</li>
                      <li>Parking and transportation</li>
                      <li>Campus resources and services</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Technology
                    </h4>
                    <p>
                      Powered by Azure OpenAI and enhanced with
                      Retrieval-Augmented Generation (RAG) to provide accurate,
                      up-to-date information from BYU-Idaho's knowledge base.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with links */}
          <div className="mt-6 sm:mt-6 sm:flex sm:flex-row-reverse">
            <div className="flex space-x-3">
              <a
                href="https://github.com/BYUI-Information-Technology/BSC-Agent"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
              <button
                type="button"
                className="inline-flex justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
