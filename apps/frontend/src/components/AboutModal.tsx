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
            <div className="mt-3 text-center sm:ml-4 sm:mr-6 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                About
              </h3>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  The BSC Support Agent is an AI agent developed in-house by
                  BYU-Idaho AI Engineers to help students quickly find answers
                  to common support questions.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Powered by retrieval augmented generation (RAG) technology,
                  the BSC Support Agent draws from a comprehensive knowledge
                  base to provide accurate, grounded responses based on official
                  knowledge sources.
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  To learn more about how BYU-Idaho is leveraging AI technology
                  across campus, visit the{" "}
                  <a
                    href="https://www.byui.edu/genai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400"
                  >
                    BYU-Idaho GenAI page.
                  </a>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Built with ❤️ by BYU-Idaho AI Engineering
                </p>
              </div>
            </div>
          </div>

          {/* Footer with links */}
          <div className="mt-6 sm:mt-6 sm:flex sm:flex-row-reverse">
            <div className="flex items-center space-x-3">
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
                className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
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
