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

// Helper function to set cookie
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// Helper function to get cookie
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

// Helper function to remove cookie
const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Set client flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for existing token on mount (only on client)
  useEffect(() => {
    if (!isClient) return;

    const initializeAuth = async () => {
      try {
        // Check both localStorage and cookies for token
        const storedToken =
          localStorage.getItem("auth_token") || getCookie("auth_token");

        if (storedToken) {
          setToken(storedToken);
          // Ensure token is in both localStorage and cookie
          localStorage.setItem("auth_token", storedToken);
          setCookie("auth_token", storedToken, 7);
          // Verify token and get user data
          await verifyToken(storedToken);
        } else {
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        localStorage.removeItem("auth_token");
        removeCookie("auth_token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [isClient]);

  // Remove the problematic popstate event handler that was causing redirect loops
  // The ProtectedRoute component should handle all navigation logic

  const verifyToken = async (token: string) => {
    try {
      const response = await apiService.getProfile(token);

      if (response.success && response.data) {
        setUser(response.data);
        return true;
      } else {
        // Token is invalid, remove it
        localStorage.removeItem("auth_token");
        removeCookie("auth_token");
        setToken(null);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("auth_token");
      removeCookie("auth_token");
      setToken(null);
      setUser(null);
      return false;
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.login({ username, password });

      if (response.success && response.data) {
        const newToken = response.data.token;
        setToken(newToken);
        setUser({
          id: 0, // Will be updated from profile call
          username: response.data.username,
          email: response.data.email,
          is_admin: response.data.is_admin,
          role: response.data.role,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem("auth_token", newToken);
        setCookie("auth_token", newToken, 7); // Store in cookie for middleware

        // Verify the token immediately to get complete user data
        await verifyToken(newToken);

        // Get the stored redirect path and redirect back
        const redirectPath = navigationUtils.getAndClearRedirectPath();
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          router.push("/");
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
    removeCookie("auth_token");
    navigationUtils.clearRedirectPath();
    router.push("/login");
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading: isLoading || !isInitialized,
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
