"use client";

import { useAuth } from "@/contexts/AuthContext";
import { navigationUtils } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  // Set client flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isClient && !hasRedirected) {
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
    }
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
