import React from "react";
import { Link } from "react-router-dom";
import { Bot, MessageCircle } from "lucide-react";

const Home: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Main content area that takes up remaining space */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <div className="max-w-6xl mx-auto py-8 px-4 w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8 stagger-item">
              <Bot className="w-16 h-16 text-primary-600 dark:text-primary-400 mr-4" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Support Agent
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  AI-Powered Assistant for BYU-Idaho
                </p>
              </div>
            </div>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed stagger-item">
              The Support Agent is an AI-powered assistant that helps you get
              answers to your questions about BYU-Idaho. Ask the agent anything
              from how to apply for financial aid, finding student housing,
              getting a parking pass, and more.
            </p>

            {/* Chat Button */}
            <div className="mt-12 stagger-item">
              <Link
                to="/chat"
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <MessageCircle className="w-6 h-6" />
                Start Chatting
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0 py-6 text-center bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700">
        <p className="text-sm text-gray-700 dark:text-gray-400">
          © 2025 Brigham Young University - Idaho
        </p>
      </div>
    </div>
  );
};

export default Home;
