"use client";

import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { mockChallenges } from "@/lib/mock-data";
import { Clock, Edit, Play, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect } from "react";

interface ChallengePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ChallengePage({ params }: ChallengePageProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { id } = use(params);
  const challenge = mockChallenges.find((c) => c.id === id);

  // Redirect to login if not authenticated, or to home if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user?.role, router]);

  if (!challenge) {
    notFound();
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">
                        {challenge.title}
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
                    <div className="flex flex-wrap gap-2">
                      {challenge.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Only show Edit button for admin users */}
                    {user?.role === "admin" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/challenges/${challenge.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                    )}
                    <Button asChild>
                      <Link href={`/challenges/${challenge.id}/solve`}>
                        <Play className="h-4 w-4 mr-2" />
                        Solve
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: challenge.description }}
                />
              </CardContent>
            </Card>

            {/* Test Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Test Cases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {challenge.testCases
                  .filter((tc) => !tc.isHidden)
                  .map((testCase, index) => (
                    <div key={testCase.id} className="space-y-2">
                      <h4 className="font-medium">Example {index + 1}:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Input:
                          </Label>
                          <pre className="bg-muted p-3 rounded-md text-sm mt-1">
                            {testCase.input}
                          </pre>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Output:
                          </Label>
                          <pre className="bg-muted p-3 rounded-md text-sm mt-1">
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Challenge Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Challenge Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Time Limit</span>
                  </div>
                  <span className="font-medium">
                    {challenge.timeLimit} minutes
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Submissions</span>
                  </div>
                  <span className="font-medium">{challenge.submissions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Success Rate</span>
                  </div>
                  <span className="font-medium">{challenge.successRate}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Related Challenges */}
            <Card>
              <CardHeader>
                <CardTitle>Related Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockChallenges
                    .filter(
                      (c) =>
                        c.id !== challenge.id &&
                        c.difficulty === challenge.difficulty
                    )
                    .slice(0, 3)
                    .map((relatedChallenge) => (
                      <Link
                        key={relatedChallenge.id}
                        href={`/challenges/${relatedChallenge.id}`}
                        className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                      >
                        <div className="font-medium text-sm">
                          {relatedChallenge.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {relatedChallenge.difficulty} •{" "}
                          {relatedChallenge.timeLimit}min
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
