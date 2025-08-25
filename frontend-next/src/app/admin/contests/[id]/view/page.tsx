"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, type Contest } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Clock,
  Edit,
  Prize,
  Rules,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ViewContestPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ViewContestPage({ params }: ViewContestPageProps) {
  const { isAuthenticated, user, token } = useAuth();
  const router = useRouter();
  const [contestId, setContestId] = useState<string>("");
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated, or to home if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user?.role, router]);

  // Get contest ID from params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setContestId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Load contest data
  useEffect(() => {
    const loadContestData = async () => {
      if (!contestId || !token) return;

      try {
        setLoading(true);
        const response = await apiService.getAdminContests(token);

        if (response.success && response.data?.data) {
          const foundContest = response.data.data.find(
            (c: Contest) => c.id.toString() === contestId
          );

          if (foundContest) {
            setContest(foundContest);
          } else {
            setError("Contest not found");
          }
        } else {
          setError(response.message || "Failed to load contest");
        }
      } catch (err) {
        console.error("Error loading contest:", err);
        setError("Failed to load contest data");
      } finally {
        setLoading(false);
      }
    };

    loadContestData();
  }, [contestId, token]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "upcoming":
        return "default";
      case "active":
        return "secondary";
      case "completed":
        return "destructive";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDurationText = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="text-muted-foreground">
            Loading contest details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            Error: {error || "Contest not found"}
          </div>
          <Button asChild>
            <Link href="/admin/contests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contests
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/contests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contests
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{contest.title}</h1>
            <p className="text-muted-foreground">Contest Details</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/contests/${contest.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Contest
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Title
                </Label>
                <p className="text-lg font-medium">{contest.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Status
                </Label>
                <div className="mt-1">
                  <Badge variant={getStatusColor(contest.status)}>
                    {contest.status.charAt(0).toUpperCase() +
                      contest.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Duration
                </Label>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {getDurationText(contest.duration)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Max Participants
                </Label>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {contest.max_participants}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Description
              </Label>
              <div className="mt-2 p-4 bg-muted rounded-lg">
                <div
                  dangerouslySetInnerHTML={{ __html: contest.description }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="font-medium">
                    {formatDate(contest.start_time)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p className="font-medium">{formatDate(contest.end_time)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Registration Deadline
                  </p>
                  <p className="font-medium">
                    {formatDate(contest.registration_deadline)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {getDurationText(contest.duration)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Participants
                  </p>
                  <p className="text-2xl font-bold">
                    {contest.participants_count}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Max Participants
                  </p>
                  <p className="text-2xl font-bold">
                    {contest.max_participants}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rules className="h-5 w-5" />
              Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: contest.rules }} />
            </div>
          </CardContent>
        </Card>

        {/* Prizes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Prize className="h-5 w-5" />
              Prizes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: contest.prizes }} />
            </div>
          </CardContent>
        </Card>

        {/* Challenges */}
        <Card>
          <CardHeader>
            <CardTitle>Contest Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Contest challenges will be loaded here when backend support is
                available.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
