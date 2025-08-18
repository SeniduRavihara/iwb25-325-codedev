"use client";

import { CodeEditor } from "@/components/code-editor";
import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, type Challenge } from "@/lib/api";
import { type TestCase } from "@/lib/mock-data";
import { ArrowLeft, Clock, Database } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface SolveChallengePage {
  params: Promise<{
    id: string;
  }>;
}

export default function SolveChallengePage({ params }: SolveChallengePage) {
  const { isAuthenticated } = useAuth();
  const resolvedParams = use(params);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setError("Please log in to access this page");
        setLoading(false);
        return;
      }

      try {
        // Fetch challenge details
        const challengesResponse = await apiService.getChallenges();
        if (challengesResponse.success && challengesResponse.data?.data) {
          const foundChallenge = challengesResponse.data.data.find(
            (c: Challenge) => c.id === parseInt(resolvedParams.id)
          );

          if (foundChallenge) {
            setChallenge(foundChallenge);

            // Fetch test cases for this challenge
            const testCasesResponse = await apiService.getTestCases(
              parseInt(resolvedParams.id)
            );
            if (testCasesResponse.success && testCasesResponse.data?.data) {
              // Map API response to expected format
              const mappedTestCases = testCasesResponse.data.data.map(
                (apiTestCase: any) => ({
                  id: apiTestCase.id.toString(),
                  input: apiTestCase.input_data,
                  expectedOutput: apiTestCase.expected_output,
                  isHidden: apiTestCase.is_hidden,
                  points: apiTestCase.points,
                })
              );
              setTestCases(mappedTestCases);
            }
          } else {
            setError("Challenge not found");
          }
        } else {
          setError("Failed to fetch challenge data");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, isAuthenticated]);

  const handleSubmit = (code: string, language: string) => {
    // TODO: Implement submission logic
    console.log("Submitting solution:", {
      challengeId: resolvedParams.id,
      code,
      language,
    });
    alert("Solution submitted successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading challenge...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="text-red-500">
              Error: {error || "Challenge not found"}
            </div>
            <Button asChild className="mt-4">
              <Link href="/challenges">Back to Challenges</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/challenges/${resolvedParams.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Problem
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{challenge.title}</h1>
            <Badge
              variant={
                challenge.difficulty.toLowerCase() === "easy"
                  ? "secondary"
                  : challenge.difficulty.toLowerCase() === "medium"
                  ? "default"
                  : "destructive"
              }
            >
              {challenge.difficulty}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Problem Description */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Problem Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-invert max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: challenge.description }}
                />
              </CardContent>
            </Card>

            {/* Sample Test Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Test Cases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {testCases
                  .filter((tc) => !tc.isHidden)
                  .map((testCase, index) => (
                    <div key={testCase.id} className="space-y-2">
                      <h4 className="font-medium text-sm">
                        Example {index + 1}:
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Input:
                          </div>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                            {testCase.input}
                          </pre>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Output:
                          </div>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                      </div>
                      {index <
                        testCases.filter((tc) => !tc.isHidden).length - 1 && (
                        <hr className="border-border my-3" />
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Constraints */}
            <Card>
              <CardHeader>
                <CardTitle>Constraints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Time Limit: {Math.floor(challenge.time_limit / 60)} minutes
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span>Memory Limit: {challenge.memory_limit} MB</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>• All test cases must pass to get full points</div>
                  <div>• Partial scoring may be available</div>
                  <div>• Multiple submissions allowed</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-3">
            <CodeEditor
              testCases={testCases}
              onSubmit={handleSubmit}
              initialLanguage="python"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
