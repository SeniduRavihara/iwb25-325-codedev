import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  mockChallenges,
  mockContestParticipants,
  mockContests,
} from "@/lib/mock-data";
import { Award, Calendar, Clock, Play, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ContestPageProps {
  params: {
    id: string;
  };
}

export default function ContestPage({ params }: ContestPageProps) {
  const contest = mockContests.find((c) => c.id === params.id);

  if (!contest) {
    notFound();
  }

  const contestChallenges = mockChallenges.filter((c) =>
    contest.challenges.includes(c.id)
  );
  const leaderboard = mockContestParticipants.filter(
    (p) => p.contestId === params.id
  );

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
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-chart-3" />
                    <div className="text-sm font-medium">Problems</div>
                    <div className="text-xs text-muted-foreground">
                      {contestChallenges.length} challenges
                    </div>
                  </div>
                </div>

                {contest.prizes.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Prizes
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {contest.prizes.map((prize, index) => (
                          <Badge key={index} variant="outline">
                            {prize}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contest Challenges */}
            <Card>
              <CardHeader>
                <CardTitle>Contest Problems</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              challenge.difficulty === "Easy"
                                ? "secondary"
                                : challenge.difficulty === "Medium"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {challenge.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {challenge.timeLimit}min • {challenge.successRate}%
                            success
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/challenges/${challenge.id}`}>
                        View Problem
                      </Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Contest Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: contest.rules }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contest Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contest Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created by:</span>
                  <span>{contest.createdBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Registration ends:
                  </span>
                  <span>{formatDateTime(contest.registrationDeadline)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End time:</span>
                  <span>{formatDateTime(contest.endTime)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              participant.rank === 1
                                ? "bg-chart-3 text-black"
                                : participant.rank === 2
                                ? "bg-muted text-foreground"
                                : participant.rank === 3
                                ? "bg-chart-5 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {participant.rank}
                          </div>
                          <span className="text-sm font-medium">
                            {participant.username}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {participant.score}
                        </span>
                      </div>
                    ))}
                  </div>
                  {leaderboard.length > 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 bg-transparent"
                      asChild
                    >
                      <Link href={`/contests/${contest.id}/leaderboard`}>
                        View Full Leaderboard
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
