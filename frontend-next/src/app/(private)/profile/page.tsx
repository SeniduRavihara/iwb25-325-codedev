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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, type Contest, type Submission } from "@/lib/api";
import {
  Award,
  Calendar,
  Code,
  Crown,
  Medal,
  Star,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface UserStats {
  totalContests: number;
  contestsWon: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  averageScore: number;
  bestRank: number;
  totalPoints: number;
  languagesUsed: string[];
  recentActivity: {
    date: string;
    submissions: number;
    contests: number;
  }[];
}

export default function ProfilePage() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !isAuthenticated || isLoading) return;

      try {
        setLoading(true);

        // Fetch user's contests and submissions
        const [contestsResponse, submissionsResponse] = await Promise.all([
          apiService.getContests(),
          apiService.getUserSubmissions(token),
        ]);

        if (contestsResponse.success && contestsResponse.data?.data) {
          setContests(contestsResponse.data.data);
        }

        if (submissionsResponse.success && submissionsResponse.data?.data) {
          setSubmissions(submissionsResponse.data.data);
        }

        // Calculate user stats from the data
        const stats = calculateUserStats(
          contestsResponse.data?.data || [],
          submissionsResponse.data?.data || []
        );
        setUserStats(stats);
      } catch (err) {
        setError("Failed to load profile data");
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, isAuthenticated, isLoading]);

  const calculateUserStats = (
    contests: Contest[],
    submissions: Submission[]
  ): UserStats => {
    const totalContests = contests.length;
    const contestsWon = Math.floor(totalContests * 0.3); // Mock: 30% win rate - would come from contest results

    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(
      (s) => s.result === "accepted"
    ).length;
    const averageScore =
      totalSubmissions > 0
        ? Math.round(
            submissions.reduce((sum, s) => sum + s.score, 0) / totalSubmissions
          )
        : 0;

    const bestRank = 3; // Mock best rank - would come from contest results
    const totalPoints = contestsWon * 100 + acceptedSubmissions * 10;

    // Get unique languages used
    const languagesUsed = [...new Set(submissions.map((s) => s.language))];

    // Calculate recent activity (last 5 days)
    const recentActivity = [];
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const daySubmissions = submissions.filter((s) =>
        s.submitted_at.startsWith(dateStr)
      ).length;

      const dayContests = contests.filter((c) =>
        c.start_time.startsWith(dateStr)
      ).length;

      recentActivity.push({
        date: dateStr,
        submissions: daySubmissions,
        contests: dayContests,
      });
    }

    return {
      totalContests,
      contestsWon,
      totalSubmissions,
      acceptedSubmissions,
      averageScore,
      bestRank,
      totalPoints,
      languagesUsed,
      recentActivity,
    };
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <Star className="h-5 w-5 text-blue-500" />;
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "wrong_answer":
        return "bg-red-100 text-red-800";
      case "time_limit_exceeded":
        return "bg-orange-100 text-orange-800";
      case "memory_limit_exceeded":
        return "bg-purple-100 text-purple-800";
      case "runtime_error":
        return "bg-red-100 text-red-800";
      case "compilation_error":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              Loading profile data...
            </p>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-orbitron">
                {user?.username}
              </h1>
              <p className="text-muted-foreground font-jetbrains-mono">
                {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={user?.role === "admin" ? "destructive" : "default"}
                >
                  {user?.role === "admin" ? "Administrator" : "User"}
                </Badge>
                <Badge variant="outline">
                  Member since{" "}
                  {new Date(user?.created_at || "").toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-jetbrains-mono">
                  Total Contests
                </CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-orbitron">
                  {userStats.totalContests}
                </div>
                <p className="text-xs text-muted-foreground font-jetbrains-mono">
                  {userStats.contestsWon} contests won
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-jetbrains-mono">
                  Total Submissions
                </CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-orbitron">
                  {userStats.totalSubmissions}
                </div>
                <p className="text-xs text-muted-foreground font-jetbrains-mono">
                  {userStats.acceptedSubmissions} accepted
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-jetbrains-mono">
                  Average Score
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-orbitron">
                  {userStats.averageScore}%
                </div>
                <p className="text-xs text-muted-foreground font-jetbrains-mono">
                  Best rank: #{userStats.bestRank}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-jetbrains-mono">
                  Total Points
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-orbitron">
                  {userStats.totalPoints}
                </div>
                <p className="text-xs text-muted-foreground font-jetbrains-mono">
                  {userStats.languagesUsed.length} languages used
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 border-2 border-border/50 bg-background/50 font-jetbrains-mono">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contests">Contests</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your coding activity over the last 5 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userStats?.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{activity.submissions} submissions</span>
                          <span>{activity.contests} contests</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Languages Used */}
              <Card>
                <CardHeader>
                  <CardTitle>Programming Languages</CardTitle>
                  <CardDescription>
                    Languages you've used in contests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userStats?.languagesUsed.map((language, index) => (
                      <Badge key={index} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contest History</CardTitle>
                <CardDescription>
                  Your participation in coding contests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contests.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No contests participated yet
                    </p>
                    <Button className="mt-4" asChild>
                      <a href="/contests">Browse Contests</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contests.slice(0, 10).map((contest) => (
                      <div
                        key={contest.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getRankBadge(Math.floor(Math.random() * 5) + 1)}
                            <span className="font-medium">{contest.title}</span>
                          </div>
                          <Badge variant="outline">{contest.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(contest.start_time).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>
                  Your latest code submissions and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No submissions yet</p>
                    <Button className="mt-4" asChild>
                      <a href="/challenges">Start Coding</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.slice(0, 10).map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">
                              Challenge #{submission.challenge_id}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {submission.language} •{" "}
                              {submission.test_cases_passed}/
                              {submission.total_test_cases} test cases
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getResultColor(submission.result)}>
                            {submission.result.replace("_", " ")}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {new Date(
                              submission.submitted_at
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Achievement Cards */}
              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Crown className="h-6 w-6 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg">First Victory</CardTitle>
                  <CardDescription>Win your first contest</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary">Completed</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Code className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Code Master</CardTitle>
                  <CardDescription>Submit 100 solutions</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="outline">In Progress</Badge>
                  <div className="text-sm text-muted-foreground mt-2">
                    {userStats?.totalSubmissions || 0}/100
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Contest Champion</CardTitle>
                  <CardDescription>Win 10 contests</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="outline">In Progress</Badge>
                  <div className="text-sm text-muted-foreground mt-2">
                    {userStats?.contestsWon || 0}/10
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Speed Demon</CardTitle>
                  <CardDescription>
                    Complete a contest in under 1 hour
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="outline">Not Started</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">Perfect Score</CardTitle>
                  <CardDescription>Get 100% on a contest</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="outline">Not Started</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">Polyglot</CardTitle>
                  <CardDescription>
                    Use 5 different programming languages
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="outline">In Progress</Badge>
                  <div className="text-sm text-muted-foreground mt-2">
                    {userStats?.languagesUsed.length || 0}/5
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
