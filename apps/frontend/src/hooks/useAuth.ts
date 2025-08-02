import { useContext } from "react";
import { AuthContext } from "../context/auth";

/**
 * Custom hook to access authentication context
 * This provides a convenient way to access auth state and functions
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
