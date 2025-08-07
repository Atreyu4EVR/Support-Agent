import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  MessageCircle,
  Zap,
  Clock,
  Shield,
  Brain,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  HelpCircle,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import { AboutModal } from "../components/AboutModal";
import { FeaturesLightning } from "../components/FeaturesLightning";
import { FeaturesAvailability } from "../components/FeaturesAvailability";
import { FeaturesPrivacy } from "../components/FeaturesPrivacy";
import { FeaturesKnowledgeable } from "../components/FeaturesKnowledgeable";
import { setTheme } from "../utils/theme";

const Home: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isLightningModalOpen, setIsLightningModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isKnowledgeableModalOpen, setIsKnowledgeableModalOpen] =
    useState(false);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    setIsDark(!isDark);
  };

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Skip the lines. Get answers streamed to you in seconds.",
      onClick: () => setIsLightningModalOpen(true),
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Available",
      description:
        "Get help whenever you need it, day or night. No waiting. No phone queues.",
      onClick: () => setIsAvailabilityModalOpen(true),
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Private & Secure",
      description:
        "State of the art AI coupled with absolute privacy and security.",
      onClick: () => setIsPrivacyModalOpen(true),
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Knowledgeable",
      description:
        "Trained on official BYU-Idaho policies and procedures for trusted information.",
      onClick: () => setIsKnowledgeableModalOpen(true),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/10 to-purple-100/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Navigation Menu */}
      <div className="fixed top-4 right-4 z-50">
        {/* Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          )}
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 right-0 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl py-2 animate-in slide-in-from-top-2 duration-200">
            <Link
              to="/chat"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200 font-headline"
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageCircle className="w-5 h-5" />
              Chat
            </Link>
            <button
              onClick={() => {
                setIsAboutModalOpen(true);
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200 w-full text-left font-headline"
            >
              <HelpCircle className="w-5 h-5" />
              About
            </button>
            <button
              onClick={() => {
                toggleTheme();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200 w-full text-left font-headline"
            >
              {isDark ? (
                <>
                  <Sun className="w-5 h-5" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" />
                  Dark Mode
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 md:px-6">
          <div className="max-w-7xl mx-auto text-center">
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-sm font-headline font-medium text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 mb-8">
              <Sparkles className="w-4 h-4 text-[#006EB6] dark:text-blue-400" />
              Powered by Advanced AI Technology
            </div>

            {/* Main Hero Content */}
            <div className="mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <Bot className="w-20 h-20 md:w-24 md:h-24 text-[#006EB6] dark:text-blue-400" />
                </div>
              </div>

              <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold text-[#006EB6] dark:bg-gradient-to-r dark:from-white dark:via-blue-300 dark:to-purple-300 dark:bg-clip-text dark:text-transparent mb-6 leading-tight">
                BYUI Support Agent
              </h1>

              <p className="font-body text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
                Your agentic companion for{" "}
                <span className="font-semibold text-[#006EB6] dark:text-blue-400">
                  instant answers
                </span>{" "}
                to BYU-Idaho questions. From financial aid to course
                registration, get the help you need in seconds.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link
                  to="/chat"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-[#006EB6] hover:bg-[#005a9a] dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 text-white font-headline font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Start Chat
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  onClick={() => setIsAboutModalOpen(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-headline font-semibold rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 text-lg"
                >
                  <HelpCircle className="w-6 h-6" />
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex flex-col items-center">
                <p className="font-body text-lg text-gray-600 dark:text-gray-400 mb-4">
                  Discover the capabilities
                </p>
                <div className="animate-bounce">
                  <ChevronDown className="w-8 h-8 text-[#006EB6] dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <button
                    onClick={feature.onClick}
                    className="h-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 w-full text-left cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-[#006EB6] dark:bg-gradient-to-br dark:from-blue-500 dark:to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="font-headline text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="font-body text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 md:px-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto text-center">
            <p className="font-body text-gray-600 dark:text-gray-400">
              © 2025 Brigham Young University - Idaho.
            </p>
          </div>
        </footer>
      </div>

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Feature Modals */}
      <FeaturesLightning
        isOpen={isLightningModalOpen}
        onClose={() => setIsLightningModalOpen(false)}
      />
      <FeaturesAvailability
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
      />
      <FeaturesPrivacy
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <FeaturesKnowledgeable
        isOpen={isKnowledgeableModalOpen}
        onClose={() => setIsKnowledgeableModalOpen(false)}
      />
    </div>
  );
};

export default Home;
