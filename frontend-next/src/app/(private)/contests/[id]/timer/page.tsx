"use client";

import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { mockContests } from "@/lib/mock-data";
import { ArrowLeft, Calendar, Play, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface ContestTimerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ContestTimerPage({ params }: ContestTimerPageProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = use(params);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Find the contest
  const contest = mockContests.find((c) => c.id === id);
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

  // Calculate countdown
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const contestStart = new Date(contest.startTime).getTime();
      const difference = contestStart - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // Contest has started, redirect to participate page
        router.push(`/contests/${id}/participate`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [contest.startTime, id, router]);

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

  const formatDate = (dateString: string) => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/contests/${id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contest
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {contest.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {contest.description}
            </p>
            <Badge
              variant={getStatusColor(contest.status)}
              className="text-lg px-4 py-2"
            >
              {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Contest Starts In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                    {timeLeft.days}
                  </div>
                  <div className="text-sm text-muted-foreground">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                    {timeLeft.hours}
                  </div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                    {timeLeft.minutes}
                  </div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                    {timeLeft.seconds}
                  </div>
                  <div className="text-sm text-muted-foreground">Seconds</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contest Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Contest Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Contest Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Start Time:</span>
                <span className="font-medium">
                  {formatDate(contest.startTime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">
                  {Math.floor(contest.duration / 60)}h {contest.duration % 60}m
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Challenges:</span>
                <span className="font-medium">
                  {contest.challenges.length} problems
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Participants:</span>
                <span className="font-medium">
                  {contest.participants}
                  {contest.maxParticipants ? `/${contest.maxParticipants}` : ""}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Prizes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Prizes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contest.prizes.length > 0 ? (
                <div className="space-y-3">
                  {contest.prizes.map((prize, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <span className="font-medium">{prize}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No prizes announced yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-4 text-lg" asChild>
              <Link href={`/contests/${id}/leaderboard`}>
                <Trophy className="h-5 w-5 mr-2" />
                View Leaderboard
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg"
              asChild
            >
              <Link href={`/contests/${id}`}>
                <Play className="h-5 w-5 mr-2" />
                Contest Details
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            The contest will automatically start when the countdown reaches zero
            and redirect you to the participation page.
          </p>
        </div>
      </div>
    </div>
  );
}
