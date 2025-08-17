"use client";

import { Navigation } from "@/components/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { mockContestParticipants, mockContests } from "@/lib/mock-data";
import {
  ArrowLeft,
  Award,
  Calendar,
  Clock,
  Code,
  Medal,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ContestLeaderboardPage() {
  const params = useParams();
  const contestId = params.id as string;
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

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

  // Find the contest
  const contest = mockContests.find((c) => c.id === contestId);
  if (!contest) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">
              Contest Not Found
            </h1>
            <p className="text-muted-foreground mt-2">
              The contest you're looking for doesn't exist.
            </p>
            <Button asChild className="mt-4">
              <Link href="/contests">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contests
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get participants for this contest
  const participants = mockContestParticipants.filter(
    (p) => p.contestId === contestId
  );
  const sortedParticipants = [...participants].sort((a, b) => a.rank - b.rank);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-muted-foreground font-medium">#{rank}</span>
        );
    }
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/contests/${contestId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contest
              </Link>
            </Button>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {contest.title} - Leaderboard
              </h1>
              <p className="text-muted-foreground mt-2">
                See how participants rank in this contest
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={getStatusColor(contest.status)}>
                {contest.status.charAt(0).toUpperCase() +
                  contest.status.slice(1)}
              </Badge>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                {participants.length} participants
              </div>
            </div>
          </div>

          {/* Contest Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Started: {formatDate(contest.startTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Duration: {Math.floor(contest.duration / 60)}h{" "}
                {contest.duration % 60}m
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code className="h-4 w-4" />
              <span>{contest.challenges.length} challenges</span>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {sortedParticipants.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {sortedParticipants.slice(0, 3).map((participant, index) => (
              <Card
                key={participant.id}
                className={`relative ${
                  index === 0
                    ? "md:order-2 ring-2 ring-primary"
                    : index === 1
                    ? "md:order-1"
                    : "md:order-3"
                }`}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-3">
                    {getRankIcon(participant.rank)}
                  </div>
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarFallback className="text-lg font-bold">
                      {getInitials(participant.username)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">
                    {participant.username}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    {participant.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Score</div>
                  <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                    <div>{participant.submissions} submissions</div>
                    <div>{participant.solvedProblems} solved</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Full Rankings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contest Rankings</CardTitle>
            <p className="text-sm text-muted-foreground">
              {participants.length} participants • Last updated:{" "}
              {new Date().toLocaleString()}
            </p>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No participants yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to join this contest!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 flex justify-center">
                        {getRankIcon(participant.rank)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(participant.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {participant.username}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Code className="h-3 w-3" />
                          {participant.preferredLanguage}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-primary">
                          {participant.score}
                        </div>
                        <div className="text-muted-foreground">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {participant.solvedProblems}
                        </div>
                        <div className="text-muted-foreground">Solved</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {participant.submissions}
                        </div>
                        <div className="text-muted-foreground">Submissions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {participant.accuracy}%
                        </div>
                        <div className="text-muted-foreground">Accuracy</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
