import { Link, useLocation } from "react-router-dom";
import { MessageCircle, HelpCircle, Home, Menu, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";

import { AboutModal } from "./AboutModal";

interface NavItem {
  name: string;
  icon: LucideIcon;
  to?: string;
  external?: boolean;
  onClick?: () => void;
}

const topIcons: NavItem[] = [
  {
    name: "Home",
    icon: Home,
    to: "/",
    external: false,
  },
  {
    name: "Chat",
    icon: MessageCircle,
    to: "/chat",
    external: false,
  },
];

export function Sidebar() {
  const location = useLocation();
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on window resize if it becomes desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Use static bottom icons without auth, but replace About with modal trigger
  const dynamicBottomIcons: NavItem[] = [
    {
      name: "About",
      icon: HelpCircle,
      onClick: () => setIsAboutModalOpen(true),
    },
  ];

  const renderNavItem = (iconObj: NavItem, isMobile = false) => {
    const LucideIcon = iconObj.icon;
    const isActive = iconObj.to && location.pathname === iconObj.to;

    // Different styling for mobile vs desktop
    const baseClassName = isMobile
      ? `nav-item flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all duration-200 group focus:outline-none w-full text-left`
      : `nav-item flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all duration-200 group focus:outline-none justify-center w-auto`;

    const activeClassName = isActive
      ? "bg-primary-100 dark:bg-primary-900"
      : "";
    const className = `${baseClassName} ${activeClassName}`;

    const iconClassName = `w-6 h-6 transition-colors duration-200 ${
      isActive
        ? "text-primary-600 dark:text-primary-400"
        : isMobile
        ? "text-gray-700 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400"
        : "text-white dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400"
    }`;

    const content = (
      <>
        <LucideIcon className={iconClassName} />
        {isMobile && (
          <span
            className={`text-sm font-medium transition-colors duration-200 ${
              isActive
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-700 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400"
            }`}
          >
            {iconObj.name}
          </span>
        )}
      </>
    );

    // Handle onClick actions (like logout)
    if (iconObj.onClick) {
      return (
        <button
          key={iconObj.name}
          onClick={iconObj.onClick}
          className={className}
          aria-label={iconObj.name}
          title={iconObj.name}
        >
          {content}
        </button>
      );
    }

    // Handle external links
    if (iconObj.external && iconObj.to) {
      return (
        <a
          key={iconObj.name}
          href={iconObj.to}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          aria-label={iconObj.name}
          title={iconObj.name}
        >
          {content}
        </a>
      );
    }

    // Handle internal navigation
    if (iconObj.to) {
      return (
        <Link
          key={iconObj.name}
          to={iconObj.to}
          className={className}
          aria-label={iconObj.name}
          title={iconObj.name}
        >
          {content}
        </Link>
      );
    }

    return null;
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-2 left-2 z-50 p-2.5 text-gray-700 dark:text-gray-200 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex h-full bg-primary-500 dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 flex-col items-center pt-2 pb-4 w-16">
        {/* Top Icons */}
        <nav className="flex flex-col gap-4 w-full items-center mt-0">
          {topIcons.map((icon) => renderNavItem(icon, false))}
        </nav>
        <div className="flex-1" />
        {/* Bottom Icons */}
        <nav className="flex flex-col gap-4 w-full items-center mb-2">
          {dynamicBottomIcons.map((icon) => renderNavItem(icon, false))}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Sidebar */}
          <aside className="md:hidden fixed top-0 left-0 h-full w-64 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 z-50 flex flex-col pt-16 pb-4 px-4 shadow-xl">
            {/* Top Icons */}
            <nav className="flex flex-col gap-2 w-full">
              {topIcons.map((icon) => renderNavItem(icon, true))}
            </nav>

            <div className="flex-1" />

            {/* Bottom Icons */}
            <nav className="flex flex-col gap-2 w-full">
              {dynamicBottomIcons.map((icon) => renderNavItem(icon, true))}
            </nav>
          </aside>
        </>
      )}

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </>
  );
}
