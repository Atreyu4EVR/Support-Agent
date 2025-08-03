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
              <Bot className="w-12 h-12 text-primary-600 dark:text-primary-400 mr-4" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  BSC Support Agent
                </h1>
              </div>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed stagger-item">
              The BSC Support Agent is an AI agent developed in-house by
              BYU-Idaho AI Engineers to help students quickly find answers to
              common support questions. Whether you're wondering "How do I get
              financial aid?", "Where do I go to get a parking permit?", or "How
              do I change my major?", this agent is here to help.
            </p>

            {/* Chat Button */}
            <div className="mt-12 stagger-item">
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
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
