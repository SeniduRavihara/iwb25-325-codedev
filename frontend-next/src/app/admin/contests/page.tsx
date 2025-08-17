"use client";

import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Clock, 
  Users, 
  Trophy,
  Calendar,
  Play,
  Pause,
  Edit,
  Trash2
} from "lucide-react";
import Link from "next/link";

export default function ContestsPage() {
  // Mock contest data
  const contests = [
    {
      id: 1,
      title: "Spring Coding Challenge 2024",
      description: "A comprehensive coding challenge covering algorithms and data structures",
      status: "active",
      startDate: "2024-03-20T10:00:00Z",
      endDate: "2024-03-20T18:00:00Z",
      participants: 156,
      maxParticipants: 200,
      challenges: 8,
      prize: "$1000",
      difficulty: "Medium"
    },
    {
      id: 2,
      title: "Beginner's Algorithm Contest",
      description: "Perfect for newcomers to competitive programming",
      status: "upcoming",
      startDate: "2024-03-25T14:00:00Z",
      endDate: "2024-03-25T16:00:00Z",
      participants: 89,
      maxParticipants: 150,
      challenges: 5,
      prize: "$500",
      difficulty: "Easy"
    },
    {
      id: 3,
      title: "Advanced Dynamic Programming",
      description: "Advanced contest focusing on DP problems",
      status: "ended",
      startDate: "2024-03-15T09:00:00Z",
      endDate: "2024-03-15T12:00:00Z",
      participants: 67,
      maxParticipants: 100,
      challenges: 6,
      prize: "$750",
      difficulty: "Hard"
    },
    {
      id: 4,
      title: "Weekly Practice Contest",
      description: "Weekly practice session for regular users",
      status: "draft",
      startDate: "2024-03-30T15:00:00Z",
      endDate: "2024-03-30T17:00:00Z",
      participants: 0,
      maxParticipants: 100,
      challenges: 4,
      prize: "$200",
      difficulty: "Easy"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case "ended":
        return <Badge variant="secondary">Ended</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return <Badge variant="secondary">Easy</Badge>;
      case "Medium":
        return <Badge variant="default">Medium</Badge>;
      case "Hard":
        return <Badge variant="destructive">Hard</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contest Management</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage coding contests and competitions
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/contests/add">
              <Plus className="h-4 w-4 mr-2" />
              Create Contest
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contests</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-400">+3</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contests</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-400">Running</span> now
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-400">+15%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Prize Pool</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$612</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-400">+8%</span> increase
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contests Grid */}
        <div className="grid gap-6">
          {contests.map((contest) => (
            <Card key={contest.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">
                        <Link href={`/admin/contests/${contest.id}`} className="hover:text-primary transition-colors">
                          {contest.title}
                        </Link>
                      </CardTitle>
                      {getStatusBadge(contest.status)}
                      {getDifficultyBadge(contest.difficulty)}
                    </div>
                    <p className="text-muted-foreground mb-3">{contest.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Start: {formatDate(contest.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>End: {formatDate(contest.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{contest.participants}/{contest.maxParticipants} participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span>{contest.challenges} challenges</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {contest.status === "draft" && (
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {contest.status === "active" && (
                      <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/contests/${contest.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Prize Pool: </span>
                      <span className="font-medium text-green-500">{contest.prize}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Registration: </span>
                      <span className={`font-medium ${contest.participants >= contest.maxParticipants ? 'text-red-500' : 'text-green-500'}`}>
                        {contest.participants >= contest.maxParticipants ? 'Closed' : 'Open'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{contest.prize}</div>
                    <div className="text-xs text-muted-foreground">Prize Pool</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
} 