"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ChevronDown,
  Code,
  LogOut,
  Settings,
  Shield,
  Trophy,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Navigation items for authenticated users (regular users)
const userNavigation = [{ name: "Contests", href: "/contests", icon: Trophy }];

// Navigation items for admin users
const adminNavigation = [
  { name: "Contests", href: "/admin/contests", icon: Trophy },
  { name: "Challenges", href: "/admin/challenges", icon: Code },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  // Determine which navigation to show
  const navigation =
    isAuthenticated && user?.role === "admin"
      ? adminNavigation
      : userNavigation;

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground font-orbitron">
                <span className="text-primary">Hackathon</span>
                <span className="text-accent">Plus</span>
              </span>
            </Link>

            {/* Show navigation only for authenticated users */}
            {isClient && isAuthenticated && (
              <div className="hidden md:flex space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors font-jetbrains-mono",
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
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isClient && isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 font-jetbrains-mono"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <User className="h-4 w-4" />
                  <span>{user?.username}</span>
                  {user?.role === "admin" && (
                    <Shield className="h-4 w-4 text-yellow-500" />
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border font-jetbrains-mono">
                        <div className="font-medium">{user?.username}</div>
                        <div className="text-xs">{user?.email}</div>
                        <div className="text-xs capitalize">{user?.role}</div>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent font-jetbrains-mono"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent font-jetbrains-mono"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent font-jetbrains-mono"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isClient && !isAuthenticated ? (
              <>
                <Button variant="ghost" asChild className="font-jetbrains-mono">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="font-jetbrains-mono">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            ) : (
              // Show loading state during SSR
              <div className="w-20 h-8 bg-muted animate-pulse rounded"></div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
