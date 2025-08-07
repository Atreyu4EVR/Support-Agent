import React from "react";
import { X, Brain, ExternalLink } from "lucide-react";

interface FeaturesKnowledgeableProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeaturesKnowledgeable: React.FC<FeaturesKnowledgeableProps> = ({
  isOpen,
  onClose,
}) => {
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
              <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mr-6 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                Super Intelligent
              </h3>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  The BYUI Support Agent is powered by{" "}
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    GPT 4.1
                  </span>
                  , one of the latest large language models (LLMs) from OpenAI,
                  and is designed to be super intelligent.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  We've added an additional layer of intelligence to GPT 4.1 by
                  leveraging{" "}
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    Retrieval Augmented Generation (RAG)
                  </span>{" "}
                  to provide the most up-to-date and relevant information to
                  you.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  In practice, this means that the Support Agent intelligently
                  performs a "tool call" to retrieve information from its
                  knowledge base, and then uses that information to generate a
                  response.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  This is a significant improvement over off-the-shelf AI tools
                  like ChatGPT, which are not able to provide{" "}
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    verified, curated BYU-Idaho information
                  </span>{" "}
                  to the user.
                </p>
              </div>
            </div>
          </div>

          {/* Footer with link */}
          <div className="mt-6 sm:mt-6 sm:flex sm:flex-row-reverse">
            <div className="flex items-center space-x-3">
              <a
                href="https://en.wikipedia.org/wiki/Retrieval-augmented_generation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors"
              >
                Learn about RAG
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
