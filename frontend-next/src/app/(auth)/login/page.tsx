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
import { Chrome, Eye, EyeOff, Github, Lock, Mail, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await login(username, password);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <ProtectedRoute requireAuth={false} redirectTo="/">
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-8">
        {/* Enhanced Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Animated Gradient Orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/3 rounded-full blur-3xl animate-pulse delay-1500"></div>
          
          {/* Matrix-style Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
          
          {/* Animated Circuit Lines */}
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M10,20 Q30,10 50,20 T90,20"
                stroke="url(#lineGradient)"
                strokeWidth="0.1"
                fill="none"
                className="animate-pulse"
              />
              <path
                d="M10,40 Q30,30 50,40 T90,40"
                stroke="url(#lineGradient)"
                strokeWidth="0.1"
                fill="none"
                className="animate-pulse delay-1000"
              />
              <path
                d="M10,60 Q30,50 50,60 T90,60"
                stroke="url(#lineGradient)"
                strokeWidth="0.1"
                fill="none"
                className="animate-pulse delay-2000"
              />
              <path
                d="M10,80 Q30,70 50,80 T90,80"
                stroke="url(#lineGradient)"
                strokeWidth="0.1"
                fill="none"
                className="animate-pulse delay-1500"
              />
            </svg>
          </div>

          {/* Floating Particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent/40 rounded-full animate-bounce delay-500"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-accent/30 rounded-full animate-bounce delay-1500"></div>
          <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-primary/25 rounded-full animate-bounce delay-2000"></div>
          <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-accent/35 rounded-full animate-bounce delay-2500"></div>

          {/* Moving Data Streams */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute text-xs text-primary/20 font-mono whitespace-nowrap animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                {['01', '10', '11', '00', 'FF', 'AA', 'BB', 'CC'].join(' ')}
              </div>
            ))}
          </div>

          {/* Animated Hexagons */}
          <div className="absolute top-10 right-10 w-16 h-16 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,10 90,30 90,70 50,90 10,70 10,30"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                className="animate-spin"
                style={{ animationDuration: '20s' }}
              />
            </svg>
          </div>
          <div className="absolute bottom-20 left-20 w-12 h-12 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,10 90,30 90,70 50,90 10,70 10,30"
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth="1"
                className="animate-spin"
                style={{ animationDuration: '15s', animationDirection: 'reverse' }}
              />
            </svg>
          </div>

          {/* Scanning Lines */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse delay-2000"></div>
          </div>

          {/* Glowing Corners */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-accent/10 to-transparent"></div>

          {/* Animated Rings */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 border border-primary/10 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-accent/10 rounded-full animate-ping" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-primary/5 rounded-full animate-ping" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
          </div>

          {/* Floating Code Symbols */}
          <div className="absolute top-1/4 right-1/4 text-primary/10 text-2xl animate-bounce" style={{ animationDuration: '3s' }}>&lt;/&gt;</div>
          <div className="absolute bottom-1/4 left-1/4 text-accent/10 text-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>{'{}'}</div>
          <div className="absolute top-3/4 right-1/3 text-primary/10 text-lg animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}>()</div>
        </div>

        <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl bg-card/50 backdrop-blur-sm relative overflow-hidden group hover:shadow-primary/25 transition-all duration-500">
          {/* Card Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <CardHeader className="space-y-1 text-center relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your <span className="text-primary font-medium">HackathonPlus</span> account to continue your coding journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {error && (
              <Alert variant="destructive" className="border-red-500/20 bg-red-500/10 backdrop-blur-sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-foreground/80">
                  Username
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 border-2 border-primary/20 focus:border-primary bg-background/50 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-2 border-primary/20 focus:border-primary bg-background/50 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full relative overflow-hidden group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-primary/25" 
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-primary/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/50 backdrop-blur-sm px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full bg-transparent border-2 border-primary/20 hover:border-primary hover:bg-primary/5 backdrop-blur-sm transition-all duration-300 group"
              >
                <Github className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                GitHub
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent border-2 border-primary/20 hover:border-primary hover:bg-primary/5 backdrop-blur-sm transition-all duration-300 group"
              >
                <Chrome className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Google
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/signup"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Sign up
              </Link>
            </div>

            <div className="text-xs text-muted-foreground text-center space-y-1 bg-card/30 backdrop-blur-sm p-3 rounded-lg border border-primary/10">
              <p className="font-medium text-primary/80">Demo credentials:</p>
              <p>Admin: admin / password</p>
              <p>User: john / password</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
