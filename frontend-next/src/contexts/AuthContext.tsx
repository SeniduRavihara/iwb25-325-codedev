"use client";

import { apiService } from "@/lib/api";
import { navigationUtils } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Set client flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for existing token on mount (only on client)
  useEffect(() => {
    if (!isClient) return;

    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      // Verify token and get user data
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, [isClient]);

  // Handle browser back button behavior
  useEffect(() => {
    if (!isClient) return;

    const handleBeforeUnload = () => {
      // Clear any stored redirect path when user manually navigates
      navigationUtils.clearRedirectPath();
    };

    const handlePopState = () => {
      // If user is authenticated and tries to go back to login page, redirect to home
      if (user && token && window.location.pathname === "/login") {
        router.replace("/");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isClient, user, token, router]);

  const verifyToken = async (token: string) => {
    try {
      const response = await apiService.getProfile(token);

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.login({ username, password });

      if (response.success && response.data) {
        setToken(response.data.token);
        setUser({
          id: 0, // Will be updated from profile call
          username: response.data.username,
          email: response.data.email,
          is_admin: response.data.is_admin,
          role: response.data.role,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem("auth_token", response.data.token);

        // Get the stored redirect path and redirect back
        const redirectPath = navigationUtils.getAndClearRedirectPath();
        if (redirectPath) {
          window.location.href = redirectPath;
        }

        return { success: true, message: "Login successful" };
      } else {
        return { success: false, message: response.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error occurred" };
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.register({ username, email, password });

      if (response.success) {
        return { success: true, message: "Registration successful" };
      } else {
        return {
          success: false,
          message: response.message || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Network error occurred" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
