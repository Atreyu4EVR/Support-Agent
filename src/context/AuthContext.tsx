import React, { useState, useEffect, useCallback } from "react";
import type { User, AuthContextType } from "../types/auth";
import { AuthContext } from "./auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [sessionId, setSessionId] = useState<string | null>(
    sessionStorage.getItem("sessionId")
  );
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // API base URL - use localhost for development, environment variable or Static Web Apps for production
  const API_BASE_URL = import.meta.env.DEV
    ? "http://localhost:7071/api"
    : import.meta.env.VITE_API_URL || "/api";

  // TEMPORARY: Bypass authentication for local development only
  const BYPASS_AUTH = import.meta.env.DEV;

  const login = async (email: string, password: string) => {
    if (BYPASS_AUTH) {
      setUser({
        id: "dev-user",
        email,
        firstName: "Dev",
        lastName: "User",
        role: "admin",
        isActive: true,
      });
      setToken("dev-token");
      setSessionId("dev-session");
      localStorage.setItem("authToken", "dev-token");
      sessionStorage.setItem("sessionId", "dev-session");
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();

      setUser(data.user);
      setToken(data.token);
      setSessionId(data.sessionId);
      localStorage.setItem("authToken", data.token);
      sessionStorage.setItem("sessionId", data.sessionId);

      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (logoutAll = false) => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ logoutAll }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      setToken(null);
      setSessionId(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("sessionId");
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    inviteCode: string
  ) => {
    if (BYPASS_AUTH) {
      setUser({
        id: "dev-user",
        email,
        firstName,
        lastName,
        role: "admin",
        isActive: true,
      });
      setToken("dev-token");
      setSessionId("dev-session");
      localStorage.setItem("authToken", "dev-token");
      sessionStorage.setItem("sessionId", "dev-session");
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, firstName, lastName, inviteCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await response.json();

      setUser(data.user);
      setToken(data.token);
      setSessionId(data.sessionId);
      localStorage.setItem("authToken", data.token);
      sessionStorage.setItem("sessionId", data.sessionId);

      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = useCallback(async () => {
    if (BYPASS_AUTH) {
      setUser({
        id: "dev-user",
        email: "dev@byui.edu",
        firstName: "Dev",
        lastName: "User",
        role: "admin",
        isActive: true,
      });
      setToken("dev-token");
      setSessionId("dev-session");
      localStorage.setItem("authToken", "dev-token");
      sessionStorage.setItem("sessionId", "dev-session");
      setIsLoading(false);
      return;
    }
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        setUser(null);
        setToken(null);
        setSessionId(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("sessionId");
        return;
      }
      const data = await response.json();
      if (data.valid && data.user) {
        setUser(data.user);
        if (data.sessionId) {
          setSessionId(data.sessionId);
          sessionStorage.setItem("sessionId", data.sessionId);
        }
      }
    } catch (error) {
      console.error("Token verification error:", error);
      setUser(null);
      setToken(null);
      setSessionId(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("sessionId");
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, BYPASS_AUTH, token]);

  // Verify token on mount
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const value: AuthContextType = {
    user,
    token,
    sessionId,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    verifyToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
