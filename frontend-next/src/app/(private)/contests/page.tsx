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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, type Contest } from "@/lib/api";
import { Calendar, Clock, Plus, Search, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ContestsPage() {
  const { isAuthenticated, user, token } = useAuth();
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<
    Record<number, boolean>
  >({});
  const [registeringContest, setRegisteringContest] = useState<number | null>(
    null
  );

  // Fetch contests from API and check registration status
  useEffect(() => {
    const fetchContests = async () => {
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await apiService.getContests();
        if (response.success && response.data && response.data.data) {
          setContests(response.data.data);

          // Check registration status for each contest
          if (token) {
            const statusPromises = response.data.data.map(
              async (contest: Contest) => {
                try {
                  const statusResponse =
                    await apiService.checkContestRegistration(
                      contest.id,
                      token
                    );
                  return {
                    contestId: contest.id,
                    isRegistered:
                      statusResponse.success &&
                      statusResponse.data?.data?.isRegistered,
                  };
                } catch (err) {
                  console.error(
                    `Error checking registration for contest ${contest.id}:`,
                    err
                  );
                  return { contestId: contest.id, isRegistered: false };
                }
              }
            );

            const statusResults = await Promise.all(statusPromises);
            const statusMap: Record<number, boolean> = {};
            statusResults.forEach((result) => {
              if (result) {
                statusMap[result.contestId] = result.isRegistered || false;
              }
            });
            setRegistrationStatus(statusMap);
          }
        } else {
          setError(response.message || "Failed to fetch contests");
        }
      } catch (err) {
        setError("Network error occurred");
        console.error("Error fetching contests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [isAuthenticated, router, token]);

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading contests...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isContestFinished = (contest: Contest) => {
    const now = new Date().getTime();
    const endTime = new Date(contest.end_time).getTime();
    return now > endTime;
  };

  const handleRegisterForContest = async (contestId: number) => {
    if (!token) {
      alert("Authentication required");
      return;
    }

    setRegisteringContest(contestId);
    try {
      const response = await apiService.registerForContest(contestId, token);
      if (response.success) {
        setRegistrationStatus((prev) => ({ ...prev, [contestId]: true }));
        alert("Successfully registered for contest!");

        // Update the contest's participant count
        setContests((prev) =>
          prev.map((contest) =>
            contest.id === contestId
              ? {
                  ...contest,
                  participants_count: contest.participants_count + 1,
                }
              : contest
          )
        );
      } else {
        alert(response.message || "Failed to register for contest");
      }
    } catch (err) {
      console.error("Error registering for contest:", err);
      alert("Network error occurred");
    } finally {
      setRegisteringContest(null);
    }
  };

  const handleUnregisterFromContest = async (contestId: number) => {
    if (!token) {
      alert("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to unregister from this contest?")) {
      return;
    }

    setRegisteringContest(contestId);
    try {
      const response = await apiService.unregisterFromContest(contestId, token);
      if (response.success) {
        setRegistrationStatus((prev) => ({ ...prev, [contestId]: false }));
        alert("Successfully unregistered from contest");

        // Update the contest's participant count
        setContests((prev) =>
          prev.map((contest) =>
            contest.id === contestId
              ? {
                  ...contest,
                  participants_count: Math.max(
                    0,
                    contest.participants_count - 1
                  ),
                }
              : contest
          )
        );
      } else {
        alert(response.message || "Failed to unregister from contest");
      }
    } catch (err) {
      console.error("Error unregistering from contest:", err);
      alert("Network error occurred");
    } finally {
      setRegisteringContest(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contests</h1>
            <p className="text-muted-foreground mt-2">
              Participate in coding contests and compete with developers
              worldwide
            </p>
          </div>
          {/* Only show Create Contest button for admin users */}
          {user?.role === "admin" && (
            <Button asChild>
              <Link href="/admin/contests/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Contest
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search contests..." className="pl-10" />
          </div>
          <Select>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Durations</SelectItem>
              <SelectItem value="short">Short (&lt;=2h)</SelectItem>
              <SelectItem value="medium">Medium (2-4h)</SelectItem>
              <SelectItem value="long">Long (&gt;4h)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contests Grid */}
        <div className="grid gap-6">
          {contests.map((contest) => (
            <Card
              key={contest.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">
                        {/* <Link
                          href={`/contests/${contest.id}`}
                          className="hover:text-primary transition-colors"
                        > */}
                        {contest.title}
                        {/* </Link> */}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={getStatusColor(contest.status)}>
                          {contest.status.charAt(0).toUpperCase() +
                            contest.status.slice(1)}
                        </Badge>
                        {isContestFinished(contest) &&
                          contest.status !== "completed" && (
                            <Badge
                              variant="secondary"
                              className="bg-red-100 text-red-800"
                            >
                              Finished
                            </Badge>
                          )}
                      </div>
                    </div>
                    <CardDescription className="mb-3">
                      {contest.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {/* Only show Edit button for admin users */}
                    {user?.role === "admin" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/contests/${contest.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    )}
                    {/* Show "View Results" button if contest is finished (time expired) */}
                    {isContestFinished(contest) ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/contests/${contest.id}/results`}>
                          View Results
                        </Link>
                      </Button>
                    ) : (
                      <>
                        {/* Show registration/join buttons only if contest is not finished */}
                        {contest.status === "upcoming" &&
                          (registrationStatus[contest.id] ? (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleUnregisterFromContest(contest.id)
                                }
                                disabled={registeringContest === contest.id}
                              >
                                {registeringContest === contest.id ? (
                                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  "Unregister"
                                )}
                              </Button>
                              <Button size="sm" asChild>
                                <Link href={`/contests/${contest.id}`}>
                                  Join
                                </Link>
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleRegisterForContest(contest.id)
                              }
                              disabled={registeringContest === contest.id}
                            >
                              {registeringContest === contest.id ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                "Register"
                              )}
                            </Button>
                          ))}
                        {contest.status === "active" && (
                          <Button size="sm" asChild>
                            <Link href={`/contests/${contest.id}/participate`}>
                              Join Now
                            </Link>
                          </Button>
                        )}
                        {contest.status === "completed" && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/contests/${contest.id}/results`}>
                              View Results
                            </Link>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
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
                        {Math.floor(contest.duration / 60)}h{" "}
                        {contest.duration % 60}m
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
                      <div className="font-medium">Problems</div>
                      <div>
                        {/* TODO: Get challenge count from contest_challenges table */}
                        <span className="text-muted-foreground">N/A</span>
                      </div>
                    </div>
                  </div>
                </div>

                {contest.prizes && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Prizes:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          const prizesArray = JSON.parse(contest.prizes);
                          return prizesArray.map(
                            (prize: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {prize}
                              </Badge>
                            )
                          );
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        } catch (error) {
                          return (
                            <span className="text-muted-foreground text-xs">
                              No prizes
                            </span>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
