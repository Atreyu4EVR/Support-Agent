import { Link, useLocation } from "react-router-dom";
import { MessageCircle, HelpCircle, Home } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

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

  // Use static bottom icons without auth, but replace About with modal trigger
  const dynamicBottomIcons: NavItem[] = [
    {
      name: "About",
      icon: HelpCircle,
      onClick: () => setIsAboutModalOpen(true),
    },
  ];

  const renderNavItem = (iconObj: NavItem) => {
    const LucideIcon = iconObj.icon;
    const isActive = iconObj.to && location.pathname === iconObj.to;
    const baseClassName = `nav-item flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all duration-200 group focus:outline-none justify-center w-auto`;
    const activeClassName = isActive
      ? "bg-primary-100 dark:bg-primary-900"
      : "";
    const className = `${baseClassName} ${activeClassName}`;

    const iconClassName = `w-6 h-6 transition-colors duration-200 ${
      isActive
        ? "text-primary-600 dark:text-primary-400"
        : "text-white dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400"
    }`;

    const content = <LucideIcon className={iconClassName} />;

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
      <aside className="h-full bg-primary-500 dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 flex flex-col items-center pt-2 pb-4 w-16">
        {/* Top Icons */}
        <nav className="flex flex-col gap-4 w-full items-center mt-0">
          {topIcons.map(renderNavItem)}
        </nav>
        <div className="flex-1" />
        {/* Bottom Icons */}
        <nav className="flex flex-col gap-4 w-full items-center mb-2">
          {dynamicBottomIcons.map(renderNavItem)}
        </nav>
      </aside>

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </>
  );
}
