"use client";

import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  mockChallenges,
  mockContestParticipants,
  mockContests,
} from "@/lib/mock-data";
import {
  Award,
  Calendar,
  Clock,
  Edit,
  Play,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect } from "react";

interface ContestPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ContestPage({ params }: ContestPageProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { id } = use(params);
  const contest = mockContests.find((c) => c.id === id);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!contest) {
    notFound();
  }

  // Show loading if not authenticated
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

  const contestChallenges = mockChallenges.filter((c) =>
    contest.challenges.includes(c.id)
  );
  const leaderboard = mockContestParticipants.filter((p) => p.contestId === id);

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
                        {contest.title}
                      </CardTitle>
                      <Badge variant={getStatusColor(contest.status)}>
                        {contest.status.charAt(0).toUpperCase() +
                          contest.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {contest.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {/* Only show Edit button for admin users */}
                    {user?.role === "admin" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/contests/${contest.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                    )}
                    {contest.status === "upcoming" && <Button>Register</Button>}
                    {contest.status === "active" && (
                      <Button asChild>
                        <Link href={`/contests/${contest.id}/participate`}>
                          <Play className="h-4 w-4 mr-2" />
                          Join Contest
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">Start Time</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(contest.startTime)}
                    </div>
                  </div>
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <div className="text-sm font-medium">Duration</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.floor(contest.duration / 60)}h{" "}
                      {contest.duration % 60}m
                    </div>
                  </div>
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-chart-4" />
                    <div className="text-sm font-medium">Participants</div>
                    <div className="text-xs text-muted-foreground">
                      {contest.participants}
                      {contest.maxParticipants
                        ? `/${contest.maxParticipants}`
                        : ""}
                    </div>
                  </div>
                  <div className="text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <div className="text-sm font-medium">Challenges</div>
                    <div className="text-xs text-muted-foreground">
                      {contestChallenges.length} problems
                    </div>
                  </div>
                </div>

                {/* Prizes */}
                {contest.prizes.length > 0 && (
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold mb-4">Prizes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {contest.prizes.map((prize, index) => (
                        <div
                          key={index}
                          className="text-center p-4 border border-border rounded-lg"
                        >
                          <Award className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                          <div className="font-medium">{prize}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Challenges */}
            <Card>
              <CardHeader>
                <CardTitle>Contest Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contestChallenges.map((challenge, index) => (
                    <div
                      key={challenge.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div>
                          <div className="font-medium">{challenge.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {challenge.difficulty}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{challenge.timeLimit}min</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href={`/contests/${id}/leaderboard`}>
                    <Trophy className="h-4 w-4 mr-2" />
                    View Leaderboard
                  </Link>
                </Button>
                {contest.status === "upcoming" && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/contests/${id}/timer`}>
                      <Clock className="h-4 w-4 mr-2" />
                      Countdown Timer
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Top Participants */}
            <Card>
              <CardHeader>
                <CardTitle>Top Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((participant, index) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {participant.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {participant.score} points
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {participant.submissions} submissions
                      </Badge>
                    </div>
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
