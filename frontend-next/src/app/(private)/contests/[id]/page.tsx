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
import { apiService, type Contest } from "@/lib/api";
import { Calendar, Clock, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function ContestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [hasRedirectedToResults, setHasRedirectedToResults] = useState(false);

  const resolvedParams = use(params);
  const contestId = parseInt(resolvedParams.id);

  useEffect(() => {
    const fetchContestDetails = async () => {
      if (!token) {
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

            // Check if contest has already ended and redirect to results
            const now = new Date().getTime();
            const endTime = new Date(foundContest.end_time).getTime();

            if (now > endTime && !hasRedirectedToResults) {
              setHasRedirectedToResults(true);
              router.push(`/contests/${contestId}/results`);
              return;
            }
          } else {
            setError("Contest not found");
          }
        } else {
          setError("Failed to fetch contest details");
        }

        // Check registration status
        if (token) {
          try {
            const statusResponse = await apiService.checkContestRegistration(
              contestId,
              token
            );
            setIsRegistered(
              (statusResponse.success &&
                statusResponse.data?.data?.isRegistered) ||
                false
            );
          } catch (err) {
            console.error("Error checking registration status:", err);
          }
        }
      } catch (err) {
        setError("Network error occurred");
        console.error("Error fetching contest details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContestDetails();
  }, [contestId, isAuthenticated, token, router, hasRedirectedToResults]);

  // Timer effect
  useEffect(() => {
    if (!contest) return;

    const updateTimer = async () => {
      const now = new Date().getTime();
      const startTime = new Date(contest.start_time).getTime();
      const timeLeft = startTime - now;

      if (timeLeft <= 0 && !hasRedirected && contest.status === "upcoming") {
        // Contest has started, update status from "upcoming" to "active" and redirect to participate page
        setHasRedirected(true);
        setIsUpdatingStatus(true);

        console.log(
          `Contest ${contestId} timer expired. Updating status from "upcoming" to "active"...`
        );

        // Update contest status to active
        try {
          // Check current status before updating
          const currentStatus = await apiService.getContestStatus(contestId);
          console.log(
            "Current contest status:",
            currentStatus.data?.data?.status
          );

          // Only update if status is still "upcoming"
          if (currentStatus.data?.data?.status === "upcoming") {
            await apiService.updateContestStatus(contestId);
            console.log(
              "Contest status update request sent - changing from 'upcoming' to 'active'"
            );

            // Verify the status was updated
            const updatedStatus = await apiService.getContestStatus(contestId);
            console.log(
              "Updated contest status:",
              updatedStatus.data?.data?.status
            );

            // Refresh contest data to get updated status
            const refreshResponse = await apiService.getContests();
            if (
              refreshResponse.success &&
              refreshResponse.data &&
              refreshResponse.data.data
            ) {
              const refreshedContest = refreshResponse.data.data.find(
                (c: Contest) => c.id === contestId
              );
              if (refreshedContest) {
                setContest(refreshedContest);
                console.log(
                  `Contest ${contestId} status updated successfully to: ${refreshedContest.status}`
                );
              }
            }
          } else {
            console.log(
              `Contest ${contestId} status already updated by another user to: ${currentStatus.data?.data?.status}`
            );
          }
        } catch (error) {
          console.error("Failed to update contest status:", error);
        } finally {
          setIsUpdatingStatus(false);
        }

        // Small delay to ensure status update is processed, then redirect to participate page
        setTimeout(() => {
          router.push(`/contests/${contestId}/participate`);
        }, 1000);
        return;
      }

      // Handle negative time (contest has already started)
      if (timeLeft <= 0) {
        setTimeUntilStart({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setTimeUntilStart({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [contest, contestId, router, hasRedirected]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "default";
      case "active":
        return "destructive";
      case "completed":
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
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
        <div className="max-w-4xl mx-auto px-4 py-8">
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

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="text-red-500">
              You need to register for this contest first.
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link href="/contests">← Back to Contests</Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="text-4xl mb-4">{contest.title}</CardTitle>
              <CardDescription className="text-xl mb-4">
                {contest.description}
              </CardDescription>
              <Badge
                variant={getStatusColor(contest.status)}
                className="text-lg px-4 py-2"
              >
                {contest.status.charAt(0).toUpperCase() +
                  contest.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <div>
                  <div className="font-medium">Start Time</div>
                  <div>{formatDateTime(contest.start_time)}</div>
                </div>
              </div>
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

        {/* Timer Section */}
        {contest.status === "upcoming" && timeUntilStart && (
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {timeUntilStart.days === 0 &&
                  timeUntilStart.hours === 0 &&
                  timeUntilStart.minutes === 0 &&
                  timeUntilStart.seconds === 0
                    ? "Contest Should Start Now"
                    : "Contest Starts In"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                      {Math.max(0, timeUntilStart.days)}
                    </div>
                    <div className="text-sm text-muted-foreground">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                      {Math.max(0, timeUntilStart.hours)
                        .toString()
                        .padStart(2, "0")}
                    </div>
                    <div className="text-sm text-muted-foreground">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                      {Math.max(0, timeUntilStart.minutes)
                        .toString()
                        .padStart(2, "0")}
                    </div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                      {Math.max(0, timeUntilStart.seconds)
                        .toString()
                        .padStart(2, "0")}
                    </div>
                    <div className="text-sm text-muted-foreground">Seconds</div>
                  </div>
                </div>
                <p className="text-muted-foreground mt-6 text-center">
                  {timeUntilStart.days === 0 &&
                  timeUntilStart.hours === 0 &&
                  timeUntilStart.minutes === 0 &&
                  timeUntilStart.seconds === 0
                    ? isUpdatingStatus
                      ? "🚀 Activating contest... You'll be redirected to participate!"
                      : "Contest should start now. Activating contest..."
                    : "The contest will automatically start when the timer reaches zero."}
                </p>
                {isUpdatingStatus && (
                  <div className="flex justify-center mt-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary border-t-transparent"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contest Rules */}
        {contest.rules && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Contest Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: contest.rules }} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {contest.status === "active" && (
            <Button size="lg" asChild>
              <Link href={`/contests/${contestId}/participate`}>
                Start Contest
              </Link>
            </Button>
          )}
          {contest.status === "completed" && (
            <Button size="lg" asChild>
              <Link href={`/contests/${contestId}/results`}>View Results</Link>
            </Button>
          )}
          {contest.status === "upcoming" && (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Contest will start automatically when the timer reaches zero.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
