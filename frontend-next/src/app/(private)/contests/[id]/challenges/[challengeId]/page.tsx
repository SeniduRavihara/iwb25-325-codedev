"use client";

import { CodeEditor } from "@/components/code-editor";
import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, type Challenge, type Contest } from "@/lib/api";
import { type TestCase } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function ContestChallengePage({
  params,
}: {
  params: Promise<{ id: string; challengeId: string }>;
}) {
  const { isAuthenticated, user, token } = useAuth();
  const router = useRouter();
  const [contest, setContest] = useState<Contest | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  const resolvedParams = use(params);
  const contestId = parseInt(resolvedParams.id);
  const challengeId = parseInt(resolvedParams.challengeId);

  useEffect(() => {
    const fetchData = async () => {
      console.log(
        "🔄 Starting fetchData for contest:",
        contestId,
        "challenge:",
        challengeId
      );

      if (!isAuthenticated) {
        console.log("❌ User not authenticated, redirecting to login");
        router.push("/login");
        return;
      }

      try {
        console.log("📡 Fetching contest details...");
        // Fetch contest details
        const contestResponse = await apiService.getContests();
        console.log("📊 Contest response:", contestResponse);

        if (
          contestResponse.success &&
          contestResponse.data &&
          contestResponse.data.data
        ) {
          const foundContest = contestResponse.data.data.find(
            (c: Contest) => c.id === contestId
          );
          console.log("🎯 Found contest:", foundContest);

          if (foundContest) {
            setContest(foundContest);
            console.log(
              "✅ Contest set:",
              foundContest.title,
              "Status:",
              foundContest.status
            );

            // Check if contest is active
            if (foundContest.status !== "active") {
              console.log(
                "⚠️ Contest not active, attempting to update status..."
              );
              // Try to update contest status first
              try {
                await apiService.updateContestStatus(contestId);
                console.log("🔄 Contest status updated, refreshing data...");

                // Refresh contest data after status update
                const refreshResponse = await apiService.getContests();
                console.log("📊 Refresh response:", refreshResponse);

                if (
                  refreshResponse.success &&
                  refreshResponse.data &&
                  refreshResponse.data.data
                ) {
                  const refreshedContest = refreshResponse.data.data.find(
                    (c: Contest) => c.id === contestId
                  );
                  console.log("🔄 Refreshed contest:", refreshedContest);

                  if (
                    refreshedContest &&
                    refreshedContest.status === "active"
                  ) {
                    setContest(refreshedContest);
                    console.log("✅ Contest now active, continuing...");
                    return; // Continue with the active contest
                  }
                }
              } catch (error) {
                console.error("❌ Failed to update contest status:", error);
              }

              console.log("❌ Contest still not active, showing error");
              setError("This contest is not active yet");
              return;
            } else {
              console.log("✅ Contest is already active");
            }
          } else {
            console.log("❌ Contest not found");
            setError("Contest not found");
          }
        } else {
          console.log("❌ Failed to fetch contests:", contestResponse);
        }

        console.log("📡 Fetching challenge details...");
        // Fetch challenge details
        const challengesResponse = await apiService.getChallenges();
        console.log("📊 Challenges response:", challengesResponse);

        if (
          challengesResponse.success &&
          challengesResponse.data &&
          challengesResponse.data.data
        ) {
          const foundChallenge = challengesResponse.data.data.find(
            (c: Challenge) => c.id === challengeId
          );
          console.log("🎯 Found challenge:", foundChallenge);

          if (foundChallenge) {
            setChallenge(foundChallenge);
            console.log("✅ Challenge set:", foundChallenge.title);

            // Fetch test cases for this challenge
            console.log("📡 Fetching test cases for challenge:", challengeId);
            try {
              const testCasesResponse = await apiService.getTestCases(
                challengeId
              );
              console.log("📊 Test cases response:", testCasesResponse);

              if (
                testCasesResponse.success &&
                testCasesResponse.data &&
                testCasesResponse.data.data
              ) {
                console.log(
                  "✅ Test cases loaded:",
                  testCasesResponse.data.data.length,
                  "test cases"
                );

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

                console.log("🔄 Mapped test cases:", mappedTestCases);
                setTestCases(mappedTestCases);

                // Log each test case
                mappedTestCases.forEach((testCase: any, index: number) => {
                  console.log(`🧪 Test Case ${index + 1}:`, {
                    id: testCase.id,
                    input: testCase.input,
                    expected: testCase.expectedOutput,
                    hidden: testCase.isHidden,
                    points: testCase.points,
                  });
                });
              } else {
                console.log("❌ Failed to get test cases:", testCasesResponse);
              }
            } catch (err) {
              console.error("❌ Error fetching test cases:", err);
            }
          } else {
            console.log("❌ Challenge not found");
            setError("Challenge not found");
          }
        } else {
          console.log("❌ Failed to fetch challenges:", challengesResponse);
        }
      } catch (err) {
        console.error("❌ Network error occurred:", err);
        setError("Network error occurred");
      } finally {
        console.log("🏁 fetchData completed, setting loading to false");
        setLoading(false);
      }
    };

    fetchData();
  }, [contestId, challengeId, isAuthenticated, router]);

  // Timer effect for contest duration
  useEffect(() => {
    if (!contest) {
      console.log("⏰ Timer effect: No contest available");
      return;
    }

    console.log("⏰ Starting timer for contest:", contest.title);
    console.log("⏰ Contest end time:", contest.end_time);

    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(contest.end_time).getTime();
      const timeLeft = endTime - now;

      if (timeLeft <= 0) {
        console.log("⏰ Contest has ended, redirecting to results");
        // Contest has ended
        router.push(`/contests/${contestId}/results`);
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      console.log("⏰ Cleaning up timer interval");
      clearInterval(interval);
    };
  }, [contest, contestId, router]);

  const handleSubmit = (code: string, language: string) => {
    console.log("🚀 handleSubmit called with:");
    console.log(
      "📝 Code:",
      code.substring(0, 100) + (code.length > 100 ? "..." : "")
    );
    console.log("🔤 Language:", language);
    console.log("🏆 Contest ID:", contestId);
    console.log("🧩 Challenge ID:", challengeId);
    console.log("📊 Current contest:", contest);
    console.log("🧪 Available test cases:", testCases.length);

    // TODO: Implement contest submission logic
    console.log("📤 Contest submission data:", {
      contestId,
      challengeId,
      code: code.substring(0, 200) + (code.length > 200 ? "..." : ""),
      language,
      testCasesCount: testCases.length,
      contestTitle: contest?.title,
      challengeTitle: challenge?.title,
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

  if (error || !contest || !challenge) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="text-red-500">
              Error: {error || "Challenge not found"}
            </div>
            <Button asChild className="mt-4">
              <Link href={`/contests/${contestId}/participate`}>
                Back to Contest
              </Link>
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
        {/* Contest Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/contests/${contestId}/participate`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contest
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{contest.title}</h1>
              <div className="text-sm text-muted-foreground">
                Problem: {challenge.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-primary">
                {timeRemaining
                  ? `${timeRemaining.hours
                      .toString()
                      .padStart(2, "0")}:${timeRemaining.minutes
                      .toString()
                      .padStart(2, "0")}:${timeRemaining.seconds
                      .toString()
                      .padStart(2, "0")}`
                  : "00:00:00"}
              </div>
              <div className="text-xs text-muted-foreground">
                Time Remaining
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Problem Description */}
          <div className="lg:col-span-2">
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
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
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: challenge.description,
                  }}
                />

                {/* Tags */}
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Tags:</div>
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      try {
                        const tagsArray = JSON.parse(challenge.tags);
                        return tagsArray.map((tag: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ));
                      } catch (error) {
                        return null;
                      }
                    })()}
                  </div>
                </div>

                {/* Challenge Info */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Limit:</span>
                    <span>{Math.floor(challenge.time_limit / 60)} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Memory Limit:</span>
                    <span>{challenge.memory_limit} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span>{Math.round(challenge.success_rate * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-4">
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
