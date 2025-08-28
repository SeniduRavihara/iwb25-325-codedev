"use client";

import type React from "react";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Lock, Mail, Home, Code } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Handle redirect parameter from middleware
  useEffect(() => {
    const redirect = searchParams.get("redirect");
    if (redirect) {
      // Store the redirect path for after login
      sessionStorage.setItem("redirectAfterLogin", redirect);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await login(username, password);

    if (result.success) {
      // Redirect is handled by AuthContext
      // router.push("/"); // Removed - AuthContext handles redirect
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <ProtectedRoute requireAuth={false} redirectTo="/">
      <div className="min-h-screen bg-gradient-to-br from-background via-card/20 to-primary/5 flex items-center justify-center px-4 py-8 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        {/* Home Button */}
        <div className="absolute top-6 left-6">
          <Button
            variant="ghost"
            size="sm"
            className="font-jetbrains-mono bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card"
            asChild
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>

        <Card className="w-full max-w-md border-2 border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm relative z-10">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Code className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold font-orbitron">
              <span className="text-primary">Welcome</span> Back
            </CardTitle>
            <CardDescription className="text-base font-jetbrains-mono">
              Sign in to your HackathonPlus account to continue your coding journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="font-jetbrains-mono">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-sm font-semibold font-jetbrains-mono">
                  Username
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-12 pr-4 py-3 border-2 border-border/50 focus:border-primary bg-background/50 font-jetbrains-mono transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold font-jetbrains-mono">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 py-3 border-2 border-border/50 focus:border-primary bg-background/50 font-jetbrains-mono transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-3 text-base font-semibold font-jetbrains-mono bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center text-sm font-jetbrains-mono">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                href="/signup"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
