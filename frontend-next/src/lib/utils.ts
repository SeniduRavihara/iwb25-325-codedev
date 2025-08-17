import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Navigation utilities
export const navigationUtils = {
  // Store the current path for redirect after login
  storeRedirectPath: (path: string) => {
    if (path !== "/login" && path !== "/signup") {
      sessionStorage.setItem("redirectAfterLogin", path);
    }
  },

  // Get and clear the stored redirect path
  getAndClearRedirectPath: (): string | null => {
    const path = sessionStorage.getItem("redirectAfterLogin");
    if (path) {
      sessionStorage.removeItem("redirectAfterLogin");
    }
    return path;
  },

  // Clear any stored redirect path
  clearRedirectPath: () => {
    sessionStorage.removeItem("redirectAfterLogin");
  },

  // Check if user should be redirected to login
  shouldRedirectToLogin: (
    isAuthenticated: boolean,
    currentPath: string
  ): boolean => {
    return (
      !isAuthenticated &&
      currentPath !== "/login" &&
      currentPath !== "/signup" &&
      !currentPath.startsWith("/api")
    );
  },
};
