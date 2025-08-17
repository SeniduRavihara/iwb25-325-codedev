"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Code, 
  Trophy, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const adminNavigation = [
  { 
    name: "Dashboard", 
    href: "/admin", 
    icon: BarChart3,
    description: "Overview and statistics"
  },
  { 
    name: "Analytics", 
    href: "/admin/analytics", 
    icon: BarChart3,
    description: "Detailed analytics and insights"
  },
  { 
    name: "Challenges", 
    href: "/admin/challenges", 
    icon: Code,
    description: "Manage coding challenges"
  },
  { 
    name: "Contests", 
    href: "/admin/contests", 
    icon: Trophy,
    description: "Manage competitions"
  },
  { 
    name: "Users", 
    href: "/admin/users", 
    icon: Users,
    description: "User management"
  },
  { 
    name: "Settings", 
    href: "/admin/settings", 
    icon: Settings,
    description: "System configuration"
  },
];

export function AdminNavigation() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-card border-border"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-sidebar-border">
            <Link href="/admin" className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-sidebar-primary" />
              <span className="text-xl font-bold text-sidebar-foreground">Admin Panel</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
                  )} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className={cn(
                      "text-xs transition-colors",
                      isActive ? "text-sidebar-primary-foreground/80" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground/80"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
} 