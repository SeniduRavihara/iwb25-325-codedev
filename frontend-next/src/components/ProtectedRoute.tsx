"use client";

import { useAuth } from "@/contexts/AuthContext";
import { navigationUtils } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = false,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set client flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isClient && !hasRedirected) {
      // Clear any existing timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      // Add a small delay to prevent rapid redirects
      redirectTimeoutRef.current = setTimeout(() => {
        // If user is authenticated and trying to access auth pages, redirect to home
        if (isAuthenticated && requireAuth === false) {
          setHasRedirected(true);
          router.replace(redirectTo);
        }
        // If user is not authenticated and trying to access protected pages, redirect to login
        else if (!isAuthenticated && requireAuth === true) {
          setHasRedirected(true);
          // Store the current path to redirect back after login
          navigationUtils.storeRedirectPath(pathname);
          router.replace("/login");
        }
      }, 100); // Small delay to prevent rapid redirects
    }

    // Cleanup timeout on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [
    isAuthenticated,
    isLoading,
    requireAuth,
    redirectTo,
    router,
    isClient,
    hasRedirected,
    pathname,
  ]);

  // Reset redirect flag when authentication state changes
  useEffect(() => {
    setHasRedirected(false);
  }, [isAuthenticated]);

  // Show loading state while checking authentication or during SSR
  if (isLoading || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated and trying to access auth pages, don't render children
  if (isAuthenticated && requireAuth === false) {
    return null;
  }

  // If user is not authenticated and trying to access protected pages, don't render children
  if (!isAuthenticated && requireAuth === true) {
    return null;
  }

  return <>{children}</>;
}
