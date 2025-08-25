"use client";

import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  apiService,
  Submission,
  SubmissionResult,
  type Challenge,
  type Contest,
} from "@/lib/api";
import { CheckCircle, Clock, Trophy, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function ContestResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isAuthenticated, user, token } = useAuth();
  const router = useRouter();
  const [contest, setContest] = useState<Contest | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [results, setResults] = useState<SubmissionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallStats, setOverallStats] = useState({
    totalScore: 0,
    maxPossibleScore: 0,
    problemsAttempted: 0,
    problemsSolved: 0,
    totalTimeSpent: 0,
    rank: 0,
    totalParticipants: 0,
  });

  const resolvedParams = use(params);
  const contestId = parseInt(resolvedParams.id);

  useEffect(() => {
    const fetchResultsData = async () => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      try {
        // Fetch contest details
        const contestResponse = await apiService.getContests();
        if (
          contestResponse.success &&
          contestResponse.data &&
          contestResponse.data.data
        ) {
          const foundContest = contestResponse.data.data.find(
            (c: Contest) => c.id === contestId
          );
          if (foundContest) {
            setContest(foundContest);
          } else {
            setError("Contest not found");
            return;
          }
        } else {
          setError("Failed to fetch contest details");
          return;
        }

        // Fetch challenges for this contest
        const challengesResponse = await apiService.getChallengesForContest(
          contestId
        );
        if (
          challengesResponse.success &&
          challengesResponse.data &&
          challengesResponse.data.data
        ) {
          const challengeData = challengesResponse.data.data;
          setChallenges(challengeData);

          // Fetch submissions for each challenge and build results
          const resultsPromises = challengeData.map(
            async (challenge: Challenge) => {
              try {
                const submissionsResponse =
                  await apiService.getSubmissionsForChallenge(challenge.id);

                console.log("challenge", challenge.id);
                console.log("submissionsResponse", submissionsResponse);

                if (submissionsResponse.success && submissionsResponse.data) {
                  const submissions = submissionsResponse.data.data;

                  // Find user's submission for this challenge
                  const userSubmission = submissions.find(
                    (s: Submission) => s.user_id === user?.id
                  );

                  if (userSubmission) {
                    // User has attempted this challenge
                    return {
                      challengeId: challenge.id,
                      challengeTitle: challenge.title,
                      difficulty: challenge.difficulty,
                      attempted: true,
                      completed: userSubmission.result === "accepted",
                      score: userSubmission.score,
                      maxScore: 100, // Assuming max score is 100
                      timeSpent: userSubmission.execution_time
                        ? Math.floor(userSubmission.execution_time / 1000 / 60)
                        : 0, // Convert ms to minutes
                      submissionTime: userSubmission.submitted_at,
                      tags: (() => {
                        try {
                          return Array.isArray(challenge.tags)
                            ? challenge.tags
                            : JSON.parse(challenge.tags);
                        } catch {
                          return [];
                        }
                      })(),
                      result: userSubmission.result,
                      testCasesPassed: userSubmission.test_cases_passed,
                      totalTestCases: userSubmission.total_test_cases,
                    };
                  } else {
                    // User hasn't attempted this challenge
                    return {
                      challengeId: challenge.id,
                      challengeTitle: challenge.title,
                      difficulty: challenge.difficulty,
                      attempted: false,
                      completed: false,
                      score: 0,
                      maxScore: 100,
                      timeSpent: 0,
                      submissionTime: undefined,
                      tags: (() => {
                        try {
                          return Array.isArray(challenge.tags)
                            ? challenge.tags
                            : JSON.parse(challenge.tags);
                        } catch {
                          return [];
                        }
                      })(),
                      result: "not_attempted",
                      testCasesPassed: 0,
                      totalTestCases: 0,
                    };
                  }
                } else {
                  // No submissions data available, treat as not attempted
                  return {
                    challengeId: challenge.id,
                    challengeTitle: challenge.title,
                    difficulty: challenge.difficulty,
                    attempted: false,
                    completed: false,
                    score: 0,
                    maxScore: 100,
                    timeSpent: 0,
                    submissionTime: undefined,
                    tags: (() => {
                      try {
                        return Array.isArray(challenge.tags)
                          ? challenge.tags
                          : JSON.parse(challenge.tags);
                      } catch {
                        return [];
                      }
                    })(),
                    result: "not_attempted",
                    testCasesPassed: 0,
                    totalTestCases: 0,
                  };
                }
              } catch (error) {
                console.error(
                  `Error fetching submissions for challenge ${challenge.id}:`,
                  error
                );
                // Return not attempted if there's an error
                return {
                  challengeId: challenge.id,
                  challengeTitle: challenge.title,
                  difficulty: challenge.difficulty,
                  attempted: false,
                  completed: false,
                  score: 0,
                  maxScore: 100,
                  timeSpent: 0,
                  submissionTime: undefined,
                  tags: (() => {
                    try {
                      return Array.isArray(challenge.tags)
                        ? challenge.tags
                        : JSON.parse(challenge.tags);
                    } catch {
                      return [];
                    }
                  })(),
                  result: "not_attempted",
                  testCasesPassed: 0,
                  totalTestCases: 0,
                };
              }
            }
          );

          // Wait for all submission queries to complete
          const resultsData = await Promise.all(resultsPromises);
          setResults(resultsData);

          // Calculate overall stats
          const totalScore = resultsData.reduce(
            (sum, result) => sum + result.score,
            0
          );
          const maxPossibleScore = resultsData.length * 100;
          const problemsAttempted = resultsData.filter(
            (r) => r.attempted
          ).length;
          const problemsSolved = resultsData.filter((r) => r.completed).length;
          const totalTimeSpent = resultsData.reduce(
            (sum, result) => sum + result.timeSpent,
            0
          );

          setOverallStats({
            totalScore,
            maxPossibleScore,
            problemsAttempted,
            problemsSolved,
            totalTimeSpent,
            rank: Math.floor(Math.random() * 50) + 1, // Mock rank - TODO: implement real ranking
            totalParticipants: 147, // Mock total participants - TODO: implement real count
          });
        }
      } catch (err) {
        setError("Network error occurred");
        console.error("Error fetching results data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResultsData();
  }, [contestId, isAuthenticated, router]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPerformanceColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="text-red-500">
              Error: {error || "Contest not found"}
            </div>
            <Button asChild className="mt-4">
              <Link href="/contests">Back to Contests</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Contest Results: {contest.title}
              </h1>
              <p className="text-muted-foreground">{contest.description}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/contests/`}>← Back to Contests</Link>
            </Button>
          </div>
        </div>

        {/* Overall Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {overallStats.totalScore}
                </div>
                <div className="text-sm text-muted-foreground">Total Score</div>
                <div className="text-xs text-muted-foreground">
                  out of {overallStats.maxPossibleScore}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  #{overallStats.rank}
                </div>
                <div className="text-sm text-muted-foreground">Your Rank</div>
                <div className="text-xs text-muted-foreground">
                  of {overallStats.totalParticipants} participants
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {overallStats.problemsSolved}/{overallStats.problemsAttempted}
                </div>
                <div className="text-sm text-muted-foreground">
                  Problems Solved
                </div>
                <div className="text-xs text-muted-foreground">
                  attempted {overallStats.problemsAttempted}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {formatTime(overallStats.totalTimeSpent)}
                </div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
                <div className="text-xs text-muted-foreground">
                  total active time
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>Problem Results</CardTitle>
            <CardDescription>
              Detailed breakdown of your performance on each problem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  No submission data available for this contest.
                </div>
              </div>
            ) : (
              results.map((result, index) => (
                <div
                  key={result.challengeId}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div>
                      <div className="font-medium">{result.challengeTitle}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            result.difficulty.toLowerCase() === "easy"
                              ? "secondary"
                              : result.difficulty.toLowerCase() === "medium"
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {result.difficulty}
                        </Badge>
                        {result.attempted ? (
                          result.completed ? (
                            <Badge
                              variant="default"
                              className="text-xs bg-green-100 text-green-800"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Solved
                            </Badge>
                          ) : (
                            <Badge
                              variant="default"
                              className="text-xs bg-yellow-100 text-yellow-800"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Attempted
                            </Badge>
                          )
                        ) : (
                          <Badge
                            variant="default"
                            className="text-xs bg-gray-100 text-gray-800"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Attempted
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(() => {
                          try {
                            const tagsArray = Array.isArray(result.tags)
                              ? result.tags
                              : JSON.parse(result.tags);
                            return tagsArray.map(
                              (tag: string, tagIndex: number) => (
                                <Badge
                                  key={tagIndex}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              )
                            );
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${getPerformanceColor(
                        result.score,
                        result.maxScore
                      )}`}
                    >
                      {result.score}/{result.maxScore}
                    </div>
                    {result.attempted && (
                      <div className="text-sm text-muted-foreground">
                        {result.testCasesPassed}/{result.totalTestCases} test
                        cases passed
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {result.attempted ? formatTime(result.timeSpent) : "-"}
                    </div>
                    {result.submissionTime && (
                      <div className="text-xs text-muted-foreground">
                        Submitted: {formatDateTime(result.submissionTime)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <Button variant="outline" asChild>
            <Link href="/contests">Back to Contests</Link>
          </Button>
          <Button asChild>
            <Link href={`/contests/${contestId}/participate`}>
              Review Problems
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
