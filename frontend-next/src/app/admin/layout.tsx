"use client";

import { Navigation } from "@/components/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { BarChart3, Code, Settings, Shield, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: Shield },
  { name: "Contests", href: "/admin/contests", icon: Trophy },
  { name: "Challenges", href: "/admin/challenges", icon: Code },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user?.role, router]);

  // Show loading if not authenticated or not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {!isAuthenticated
              ? "Redirecting to login..."
              : "Access denied. Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-card border-r border-border min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="h-6 w-6 text-yellow-500" />
              <h2 className="text-lg font-semibold text-foreground">
                Admin Panel
              </h2>
            </div>

            <nav className="space-y-2">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
