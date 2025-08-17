"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  Code,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12%",
      changeType: "increase",
      description: "vs last month",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Active Contests",
      value: "3",
      change: "+1",
      changeType: "increase",
      description: "vs last week",
      icon: Trophy,
      color: "text-green-500",
    },
    {
      title: "Total Submissions",
      value: "5,678",
      change: "+23%",
      changeType: "increase",
      description: "vs last month",
      icon: Code,
      color: "text-purple-500",
    },
    {
      title: "Success Rate",
      value: "78%",
      change: "+5%",
      changeType: "increase",
      description: "vs last month",
      icon: BarChart3,
      color: "text-orange-500",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "user_registration",
      title: "New user registered",
      description: "john.doe@example.com",
      time: "2 minutes ago",
      value: "+1",
    },
    {
      id: 2,
      type: "contest_started",
      title: "Contest started",
      description: "Algorithm Master Challenge 2024",
      time: "1 hour ago",
      value: "Active",
    },
    {
      id: 3,
      type: "submission",
      title: "New submission",
      description: "Two Sum - Python solution",
      time: "3 hours ago",
      value: "Accepted",
    },
    {
      id: 4,
      type: "contest_completed",
      title: "Contest completed",
      description: "Web Development Hackathon",
      time: "1 day ago",
      value: "Finished",
    },
  ];

  const topContests = [
    {
      id: "1",
      title: "Algorithm Master Challenge 2024",
      participants: 156,
      submissions: 892,
      successRate: 85,
      status: "active",
    },
    {
      id: "2",
      title: "Web Development Hackathon",
      participants: 89,
      submissions: 445,
      successRate: 72,
      status: "completed",
    },
    {
      id: "3",
      title: "Data Structures Contest",
      participants: 234,
      submissions: 1234,
      successRate: 91,
      status: "upcoming",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "destructive";
      case "completed":
        return "secondary";
      case "upcoming":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Platform statistics and performance insights
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Export Report</Button>
          <Button>Generate Insights</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="flex items-center space-x-2">
                  {stat.changeType === "increase" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm ${
                      stat.changeType === "increase"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest platform activities and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.value}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" size="sm" className="w-full">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Contests */}
        <Card>
          <CardHeader>
            <CardTitle>Top Contests</CardTitle>
            <CardDescription>
              Most popular contests by participation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topContests.map((contest) => (
                <div
                  key={contest.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">
                        {contest.title}
                      </p>
                      <Badge
                        variant={getStatusColor(contest.status)}
                        className="text-xs"
                      >
                        {contest.status.charAt(0).toUpperCase() +
                          contest.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {contest.participants} participants
                      </span>
                      <span className="flex items-center gap-1">
                        <Code className="h-3 w-3" />
                        {contest.submissions} submissions
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        {contest.successRate}% success
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" size="sm" className="w-full">
                View All Contests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* User Growth Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly user registration trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Chart visualization would go here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Trends Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Trends</CardTitle>
            <CardDescription>Daily submission activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Chart visualization would go here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
