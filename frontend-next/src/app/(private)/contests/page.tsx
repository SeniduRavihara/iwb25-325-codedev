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
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch contests from API
  useEffect(() => {
    const fetchContests = async () => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      try {
        const response = await apiService.getContests();
        if (response.success && response.data && response.data.data) {
          setContests(response.data.data);
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
  }, [isAuthenticated, router]);

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
                        <Link
                          href={`/contests/${contest.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {contest.title}
                        </Link>
                      </CardTitle>
                      <Badge variant={getStatusColor(contest.status)}>
                        {contest.status.charAt(0).toUpperCase() +
                          contest.status.slice(1)}
                      </Badge>
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
                    {contest.status === "upcoming" && (
                      <Button size="sm">Register</Button>
                    )}
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
