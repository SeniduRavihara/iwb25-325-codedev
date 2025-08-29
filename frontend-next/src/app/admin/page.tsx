"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Code,
  Plus,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Contests",
      value: "24",
      description: "Active and completed contests",
      icon: Trophy,
      color: "text-blue-500",
    },
    {
      title: "Total Users",
      value: "1,234",
      description: "Registered participants",
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Total Challenges",
      value: "156",
      description: "Available coding challenges",
      icon: Code,
      color: "text-purple-500",
    },
    {
      title: "Active Contests",
      value: "3",
      description: "Currently running contests",
      icon: Clock,
      color: "text-orange-500",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "contest_created",
      title: "New contest created",
      description: "Algorithm Master Challenge 2024",
      time: "2 hours ago",
      status: "success",
    },
    {
      id: 2,
      type: "user_registered",
      title: "New user registered",
      description: "john.doe@example.com",
      time: "4 hours ago",
      status: "info",
    },
    {
      id: 3,
      type: "contest_started",
      title: "Contest started",
      description: "Web Development Hackathon",
      time: "6 hours ago",
      status: "success",
    },
    {
      id: 4,
      type: "challenge_added",
      title: "New challenge added",
      description: "Dynamic Programming - Longest Subsequence",
      time: "1 day ago",
      status: "success",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "info":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-orbitron">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 font-jetbrains-mono">
            Manage contests, challenges, and monitor platform activity
          </p>
        </div>
        <div className="flex space-x-4">
          <Button asChild className="font-jetbrains-mono">
            <Link href="/admin/contests/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Contest
            </Link>
          </Button>
          <Button variant="outline" asChild className="font-jetbrains-mono">
            <Link href="/admin/challenges/add">
              <Code className="h-4 w-4 mr-2" />
              Add Challenge
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border-2 border-border/50 bg-card/80 backdrop-blur-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground font-jetbrains-mono">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground font-orbitron">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground font-jetbrains-mono">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-orbitron">Quick Actions</CardTitle>
            <CardDescription className="font-jetbrains-mono">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                asChild
                className="h-auto p-4 flex flex-col items-start font-jetbrains-mono"
              >
                <Link href="/admin/contests">
                  <Trophy className="h-6 w-6 mb-2" />
                  <span className="font-medium">Manage Contests</span>
                  <span className="text-xs text-muted-foreground">
                    Create, edit, and monitor contests
                  </span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto p-4 flex flex-col items-start font-jetbrains-mono"
              >
                <Link href="/admin/challenges">
                  <Code className="h-6 w-6 mb-2" />
                  <span className="font-medium">Manage Challenges</span>
                  <span className="text-xs text-muted-foreground">
                    Add and edit coding challenges
                  </span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto p-4 flex flex-col items-start font-jetbrains-mono"
              >
                <Link href="/admin/analytics">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="font-medium">View Analytics</span>
                  <span className="text-xs text-muted-foreground">
                    Platform statistics and insights
                  </span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto p-4 flex flex-col items-start font-jetbrains-mono"
              >
                <Link href="/admin/settings">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="font-medium">Settings</span>
                  <span className="text-xs text-muted-foreground">
                    Platform configuration
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-orbitron">Recent Activity</CardTitle>
            <CardDescription className="font-jetbrains-mono">
              Latest platform activities and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="mt-1">{getStatusIcon(activity.status)}</div>
                  <div className="flex-1 min-w-0">
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
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full font-jetbrains-mono"
              >
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
