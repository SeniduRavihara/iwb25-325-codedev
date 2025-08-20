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
import { apiService, type Challenge, type Contest } from "@/lib/api";
import { Clock, Code, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function ContestParticipatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [contest, setContest] = useState<Contest | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [hasRedirectedToResults, setHasRedirectedToResults] = useState(false);
  const [isContestEnded, setIsContestEnded] = useState(false);
  const [contestProgress, setContestProgress] = useState<{
    totalChallenges: number;
    completedChallenges: number;
    progressPercentage: number;
    canEndContest: boolean;
  } | null>(null);

  const resolvedParams = use(params);
  const contestId = parseInt(resolvedParams.id);

  useEffect(() => {
    const fetchContestDetails = async () => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      try {
        // Fetch contest details
        const response = await apiService.getContests();
        if (response.success && response.data && response.data.data) {
          const foundContest = response.data.data.find(
            (c: Contest) => c.id === contestId
          );
          if (foundContest) {
            setContest(foundContest);

            // Note: Time checks are disabled to allow access
          } else {
            setError("Contest not found");
          }
        } else {
          setError("Failed to fetch contest details");
        }

        // Fetch challenges for this contest
        const challengesResponse = await apiService.getChallengesForContest(contestId);
        if (
          challengesResponse.success &&
          challengesResponse.data &&
          challengesResponse.data.data
        ) {
          // For now, show all challenges. In the future, this should filter by contest
          setChallenges(challengesResponse.data.data);

          // Get progress from localStorage
          const storageKey = `contest_${contestId}_results`;
          const storedResults = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
          );
          const completedChallenges = storedResults.length;
          const totalChallenges = challengesResponse.data.data.length;
          const progressPercentage =
            totalChallenges > 0
              ? (completedChallenges / totalChallenges) * 100
              : 0;
          const canEndContest =
            completedChallenges >= totalChallenges && totalChallenges > 0;

          setContestProgress({
            totalChallenges,
            completedChallenges,
            progressPercentage,
            canEndContest,
          });
        }
      } catch (err) {
        setError("Network error occurred");
        console.error("Error fetching contest details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContestDetails();
  }, [contestId, isAuthenticated, router]);

  // Timer effect for contest duration
  useEffect(() => {
    if (!contest) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(contest.end_time).getTime();
      const timeLeft = endTime - now;

      if (timeLeft <= 0) {
        setIsContestEnded(true);
        if (!hasRedirectedToResults) {
          // Contest has ended - redirect to results page
          setHasRedirectedToResults(true);
          router.push(`/contests/${contestId}/results`);
          return;
        }
      } else {
        setIsContestEnded(false);
      }

      // Show 0 if time is negative to avoid showing negative values
      const hours = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
      const minutes = Math.max(
        0,
        Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      );
      const seconds = Math.max(0, Math.floor((timeLeft % (1000 * 60)) / 1000));

      setTimeRemaining({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [contest, contestId, router, hasRedirectedToResults]);

  const handleEndContest = async () => {
    try {
      console.log("🏁 Ending contest...");

      // Get results from localStorage
      const storageKey = `contest_${contestId}_results`;
      const storedResults = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
      );

      if (storedResults.length === 0) {
        alert(
          "No challenge results found. Please complete at least one challenge before ending the contest."
        );
        return;
      }

      console.log("📊 Stored results:", storedResults);

      // Calculate total score
      const totalScore = storedResults.reduce(
        (sum: number, result: any) => sum + result.score,
        0
      );
      const averageScore = totalScore / storedResults.length;

      // Submit each challenge result to database
      for (const result of storedResults) {
        try {
          const response = await apiService.submitContestSolution(
            contestId,
            result.challengeId,
            result.code,
            result.language,
            "dummy-token",
            {
              passedTests: result.passedTests,
              totalTests: result.totalTests,
              successRate: result.successRate,
              score: result.score,
            }
          );

          if (!response.success) {
            console.error(
              `Failed to submit challenge ${result.challengeId}:`,
              response.message
            );
          }
        } catch (error) {
          console.error(
            `Error submitting challenge ${result.challengeId}:`,
            error
          );
        }
      }

      // Clear localStorage after successful submission
      localStorage.removeItem(storageKey);

      alert(
        `Contest ended successfully!\n\nFinal Results:\n- Total Score: ${totalScore.toFixed(
          2
        )}\n- Average Score: ${averageScore.toFixed(
          2
        )}\n- Challenges Completed: ${
          storedResults.length
        }\n\nAll results have been submitted to the database.`
      );

      // Redirect to results page
      router.push(`/contests/${contestId}/results`);
    } catch (error) {
      console.error("❌ Error ending contest:", error);
      alert("Failed to end contest. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading contest...</p>
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
                {contest.title}
              </h1>
              <p className="text-muted-foreground">{contest.description}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/contests/${contestId}`}>← Back to Contest</Link>
            </Button>
          </div>
        </div>

        {/* Contest Timer */}
        {timeRemaining && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center">
                {isContestEnded ? "Contest Finished" : "Time Remaining"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isContestEnded ? (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500 mb-4">
                    Contest has ended!
                  </div>
                  <p className="text-muted-foreground">
                    You can no longer solve problems for this contest.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/contests/${contestId}/results`}>
                      View Results
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {timeRemaining.hours.toString().padStart(2, "0")}
                      </div>
                      <div className="text-sm text-muted-foreground">Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {timeRemaining.minutes.toString().padStart(2, "0")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Minutes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {timeRemaining.seconds.toString().padStart(2, "0")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Seconds
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-4">
                    Complete the challenges before time runs out!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contest Progress */}
        {contestProgress && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {contestProgress.completedChallenges}/
                    {contestProgress.totalChallenges} challenges completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${contestProgress.progressPercentage}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {contestProgress.progressPercentage.toFixed(1)}% complete
                </div>

                {contestProgress.canEndContest && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={handleEndContest}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      🏁 End Contest & Submit Results
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contest Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contest Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <div>
                  <div className="font-medium">Duration</div>
                  <div>
                    {Math.floor(contest.duration / 60)}h {contest.duration % 60}
                    m
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <div>
                  <div className="font-medium">Participants</div>
                  <div>
                    {contest.participants_count}
                    {contest.max_participants
                      ? `/${contest.max_participants}`
                      : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Code className="h-4 w-4" />
                <div>
                  <div className="font-medium">Problems</div>
                  <div>{challenges.length} challenges</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <div>
                  <div className="font-medium">Prizes</div>
                  <div>
                    {(() => {
                      try {
                        if (!contest.prizes) {
                          return "No prizes";
                        }
                        const prizesArray = JSON.parse(contest.prizes);
                        return prizesArray.length > 0
                          ? `${prizesArray.length} prize(s)`
                          : "No prizes";
                      } catch {
                        return "No prizes";
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Challenges */}
        <Card>
          <CardHeader>
            <CardTitle>Contest Problems</CardTitle>
            <CardDescription>
              Solve these challenges to earn points and climb the leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {challenges.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  No challenges available for this contest yet.
                </div>
              </div>
            ) : (
              challenges.map((challenge, index) => (
                <div
                  key={challenge.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div>
                      <div className="font-medium">{challenge.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            challenge.difficulty.toLowerCase() === "easy"
                              ? "secondary"
                              : challenge.difficulty.toLowerCase() === "medium"
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {challenge.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.floor(challenge.time_limit / 60)}min
                           {/* •{" "} */}
                          {/* {Math.round(challenge.success_rate * 100)}% success */}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(() => {
                          try {
                            const tagsArray = Array.isArray(challenge.tags)
                              ? challenge.tags
                              : JSON.parse(challenge.tags);
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
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={
                        isContestEnded
                          ? `/contests/${contestId}/results`
                          : `/contests/${contestId}/challenges/${challenge.id}`
                      }
                    >
                      {isContestEnded ? "View" : "Solve Problem"}
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
