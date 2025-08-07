import React from "react";
import { X, Shield } from "lucide-react";

interface FeaturesPrivacyProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeaturesPrivacy: React.FC<FeaturesPrivacyProps> = ({
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
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mr-6 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                Private & Secure
              </h3>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  We use{" "}
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    privately hosted OpenAI models in Microsoft Azure's cloud
                  </span>{" "}
                  to power the BYUI Support Agent. This ensures that your data
                  is not exposed to OpenAI's servers, other third-party systems,
                  or any unauthorized users.
                </p>

                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Security Features:
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <strong>Data Persistence:</strong> Messages stored in
                      memory for session duration, conversations stored in
                      BYU-Idaho's private database
                    </li>
                    <li>
                      <strong>Focused AI:</strong> Constrained to the BYU-Idaho
                      knowledge base only
                    </li>
                    <li>
                      <strong>FERPA Protection:</strong> Built-in safeguards
                      against sharing protected student information
                    </li>
                    <li>
                      <strong>Secure Communication:</strong> All data in transit
                      is encrypted end-to-end via HTTPS
                    </li>
                    <li>
                      <strong>Enterprise Security:</strong> Leverages
                      Microsoft's enterprise-grade infrastructure
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 sm:mt-6 sm:flex sm:flex-row-reverse">
            <div className="flex items-center space-x-3">
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
