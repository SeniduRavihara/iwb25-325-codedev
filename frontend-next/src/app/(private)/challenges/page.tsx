"use client";

import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { mockChallenges } from "@/lib/mock-data";
import { Clock, Plus, Search, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChallengesPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated, or to home if not admin
  useEffect(() => {
    // Wait for AuthContext to finish loading
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user?.role, router, isLoading]);

  // Show loading if AuthContext is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-orbitron">
              Challenges
            </h1>
            <p className="text-muted-foreground mt-2 font-jetbrains-mono">
              Test your coding skills with our collection of programming
              challenges
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/challenges/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Challenge
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search challenges..."
              className="pl-10 border-2 border-border/50 focus:border-primary bg-background/50 font-jetbrains-mono"
            />
          </div>
          <Select>
            <SelectTrigger className="w-full sm:w-[180px] border-2 border-border/50 focus:border-primary bg-background/50 font-jetbrains-mono">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full sm:w-[180px] border-2 border-border/50 focus:border-primary bg-background/50 font-jetbrains-mono">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="array">Array</SelectItem>
              <SelectItem value="tree">Tree</SelectItem>
              <SelectItem value="dynamic-programming">
                Dynamic Programming
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Challenges Grid */}
        <div className="grid gap-6">
          {mockChallenges.map((challenge) => (
            <Card
              key={challenge.id}
              className="hover:shadow-lg transition-shadow border-2 border-border/50 bg-card/80 backdrop-blur-sm"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl font-orbitron">
                        <Link
                          href={`/admin/challenges/${challenge.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {challenge.title}
                        </Link>
                      </CardTitle>
                      <Badge
                        variant={
                          challenge.difficulty === "Easy"
                            ? "secondary"
                            : challenge.difficulty === "Medium"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(() => {
                        try {
                          const tagsArray = JSON.parse(challenge.tags);
                          return tagsArray.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ));
                        } catch (error) {
                          return (
                            <span className="text-muted-foreground text-xs">
                              No tags
                            </span>
                          );
                        }
                      })()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/challenges/${challenge.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground font-jetbrains-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {challenge.timeLimit}min
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {challenge.submissions} submissions
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {challenge.successRate}% success rate
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
