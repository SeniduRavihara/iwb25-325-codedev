"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

  useEffect(() => {
    if (!isLoading) {
      // If user is authenticated and trying to access auth pages, redirect to home
      if (isAuthenticated && requireAuth === false) {
        router.push(redirectTo);
      }
      // If user is not authenticated and trying to access protected pages, redirect to login
      else if (!isAuthenticated && requireAuth === true) {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  // Show loading state while checking authentication
  if (isLoading) {
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
