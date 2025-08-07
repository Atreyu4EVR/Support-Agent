import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Bot } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { MemoryDropdown } from "./components/MemoryDropdown";
import { setTheme, getInitialTheme } from "./utils/theme";
import Chat from "./pages/Chat";
import Home from "./pages/Home";

// Page transition wrapper component
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition-enter h-full">
      {children}
    </div>
  );
};

// Layout wrapper
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  // Check if we're on the homepage
  const isHomePage = location.pathname === "/";

  const handleSessionChange = () => {
    // Force refresh of child components when session changes
    setRefreshKey((prev) => prev + 1);
  };

  const handleMemoryCleared = () => {
    // Force refresh of child components when memory is cleared
    setRefreshKey((prev) => prev + 1);
  };

  // Full-screen layout for homepage
  if (isHomePage) {
    return (
      <div className="h-full w-full">
        <PageTransition key={refreshKey}>{children}</PageTransition>
      </div>
    );
  }

  // Standard layout with sidebar and header for other pages
  return (
    <div className="h-full w-full flex flex-row bg-gray-50 dark:bg-zinc-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 w-full md:w-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-gray-200 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-900">
          {/* Left space for mobile hamburger (invisible on desktop) */}
          <div className="w-14 md:w-0 flex-shrink-0"></div>

          {/* Center: Logo and title */}
          <div className="flex items-center justify-center flex-1 md:flex-none md:justify-start">
            <Bot className="w-6 h-6 text-primary-500 mr-2" />
            <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
              BYUI Support Agent
            </h1>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
            {/* Theme toggle icon */}
            <button
              className="p-1.5 md:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors duration-200"
              aria-label="Toggle theme"
              title="Toggle theme"
              onClick={() => {
                const isDark =
                  document.documentElement.classList.contains("dark");
                setTheme(isDark ? "light" : "dark");
              }}
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5 text-gray-900 dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </button>
            {/* Memory Dropdown */}
            <MemoryDropdown
              onSessionChange={handleSessionChange}
              onMemoryCleared={handleMemoryCleared}
            />
          </div>
        </div>
        {/* Main Content Area with Transitions */}
        <div className="flex-1 overflow-y-auto">
          <PageTransition key={refreshKey}>{children}</PageTransition>
        </div>
      </div>
    </div>
  );
};

// Main content wrapper with transitions
const MainContent = () => {
  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route
        path="/"
        element={
          <ProtectedLayout>
            <Home />
          </ProtectedLayout>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedLayout>
            <Chat />
          </ProtectedLayout>
        }
      />
    </Routes>
  );
};

function App() {
  // Theme initialization
  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  return (
    <Router>
      <MainContent />
    </Router>
  );
}

export default App;
