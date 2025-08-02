import React, { useState } from "react";
import { copyToClipboard } from "../utils/clipboard";
import { Clipboard, Check } from "lucide-react";

interface ResponseDisplayProps {
  inboundMessage: string;
  outboundMessage: string;
  referenceInfo: string;
  sessionId?: string;
  onReset: () => void;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  inboundMessage,
  outboundMessage,
  referenceInfo,
  sessionId,
  onReset,
}) => {
  const [copySuccess, setCopySuccess] = useState<
    "inbound" | "outbound" | "reference" | null
  >(null);

  const handleCopyToClipboard = async (
    message: string,
    type: "inbound" | "outbound" | "reference"
  ) => {
    const success = await copyToClipboard(message);
    if (success) {
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Message Exchange
          </h1>
          {sessionId && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
              Session: {sessionId.slice(0, 8)}...
            </span>
          )}
        </div>
      </div>
      <div className="mb-8">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Review the inbound message and copy the AI-generated response below.
        </p>
      </div>

      <div className="space-y-6">
        {/* Inbound Message Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-md font-medium text-gray-700 dark:text-gray-300">
              Inbound Message
            </label>
            <button
              onClick={() => handleCopyToClipboard(inboundMessage, "inbound")}
              className="p-1.5 rounded-md shadow-sm border bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 border-gray-200 dark:border-zinc-600 transition-colors duration-200"
              title="Copy Inbound Message"
            >
              {copySuccess === "inbound" ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Clipboard className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>
          <div className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-sm min-h-[120px] overflow-y-auto">
            <div className="whitespace-pre-wrap leading-relaxed">
              {inboundMessage}
            </div>
          </div>
        </div>

        {/* Outbound Message Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-md font-medium text-gray-700 dark:text-gray-300">
              Outbound Message
            </label>
            <button
              onClick={() => handleCopyToClipboard(outboundMessage, "outbound")}
              className="p-1.5 rounded-md shadow-sm border bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 border-gray-200 dark:border-zinc-600 transition-colors duration-200"
              title="Copy Outbound Message"
            >
              {copySuccess === "outbound" ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Clipboard className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>
          <div className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-sm min-h-[200px] overflow-y-auto">
            <div
              className="leading-relaxed prose prose-gray dark:prose-invert max-w-none prose-sm"
              dangerouslySetInnerHTML={{ __html: outboundMessage }}
            />
          </div>
        </div>

        {/* Reference Info Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-md font-medium text-gray-700 dark:text-gray-300">
              Reference Info
            </label>
            <button
              onClick={() => handleCopyToClipboard(referenceInfo, "reference")}
              className="p-1.5 rounded-md shadow-sm border bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 border-gray-200 dark:border-zinc-600 transition-colors duration-200"
              title="Copy Reference Info"
            >
              {copySuccess === "reference" ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Clipboard className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>
          <div className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-sm min-h-[120px] overflow-y-auto">
            <div
              className="leading-relaxed prose prose-gray dark:prose-invert max-w-none prose-sm"
              dangerouslySetInnerHTML={{ __html: referenceInfo }}
            />
          </div>
        </div>

        {/* Button Row: Copy Response and Reset */}
        <div className="flex gap-4">
          <button
            onClick={() => handleCopyToClipboard(outboundMessage, "outbound")}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-6 py-4 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-500"
          >
            {copySuccess === "outbound" ? (
              <div className="flex items-center justify-center">
                <Check className="w-5 h-5 mr-2" />
                Copied to Clipboard!
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Clipboard className="w-5 h-5 mr-2" />
                Copy Response to Clipboard
              </div>
            )}
          </button>

          <button
            onClick={onReset}
            className="flex-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
          >
            Generate Another Response
          </button>
        </div>
      </div>
    </div>
  );
};
