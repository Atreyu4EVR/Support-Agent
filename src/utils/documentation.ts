/**
 * Documentation URL utilities for BSC Support Agent
 * Handles development vs production documentation links
 */

// Base documentation URL based on environment
const getDocumentationBaseUrl = (): string => {
  if (import.meta.env.PROD) {
    // Production: integrated docs at /docs/
    return "/docs";
  }
  // Development: docs running on separate port
  return "http://localhost:3000/docs";
};

/**
 * Get URL for documentation homepage
 */
export const getDocumentationUrl = (): string => {
  return `${getDocumentationBaseUrl()}/`;
};

/**
 * Get URL for specific documentation page
 * @param page - Page path (e.g., "getting-started/account-setup")
 */
export const getDocumentationPageUrl = (page: string): string => {
  return `${getDocumentationBaseUrl()}/${page}`;
};

/**
 * Documentation page shortcuts
 */
export const DocumentationPages = {
  // Getting Started
  accountSetup: () => getDocumentationPageUrl("getting-started/account-setup"),
  loginProcess: () => getDocumentationPageUrl("getting-started/login-process"),
  firstSteps: () => getDocumentationPageUrl("getting-started/first-steps"),

  // User Guides
  chatInterface: () => getDocumentationPageUrl("user-guide/chat-interface"),
  emailInterface: () => getDocumentationPageUrl("user-guide/email-interface"),
  settings: () => getDocumentationPageUrl("user-guide/settings"),

  // Support
  gettingHelp: () => getDocumentationPageUrl("support/getting-help"),
  commonIssues: () => getDocumentationPageUrl("support/common-issues"),
  feedback: () => getDocumentationPageUrl("support/feedback"),

  // Legal
  privacyPolicy: () => getDocumentationPageUrl("legal/privacy-policy"),
  termsOfService: () => getDocumentationPageUrl("legal/terms-of-service"),
  contact: () => getDocumentationPageUrl("legal/contact"),

  // About
  bscAgent: () => getDocumentationPageUrl("about/bsc-agent"),
  team: () => getDocumentationPageUrl("about/team"),
  university: () => getDocumentationPageUrl("about/university"),
} as const;

/**
 * Open documentation in new tab (useful for external links in development)
 * @param url - Documentation URL
 */
export const openDocumentation = (url: string): void => {
  if (import.meta.env.PROD) {
    // Production: navigate within same app
    window.location.href = url;
  } else {
    // Development: open in new tab
    window.open(url, "_blank", "noopener,noreferrer");
  }
};
