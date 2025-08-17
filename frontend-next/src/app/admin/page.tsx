"use client";

import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { 
  Users, 
  Code, 
  Trophy, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  BarChart3,
  Settings
} from "lucide-react";

export default function AdminPage() {
  // Mock data for dashboard
  const stats = {
    totalUsers: 1256,
    totalChallenges: 89,
    activeContests: 3,
    totalSubmissions: 5432,
    successRate: 78.5,
    recentActivity: [
      { type: "user", message: "New user registered", time: "2 min ago" },
      { type: "challenge", message: "Challenge 'Array Rotation' added", time: "15 min ago" },
      { type: "contest", message: "Contest 'Spring Coding' started", time: "1 hour ago" },
      { type: "submission", message: "High score achieved in 'Dynamic Programming'", time: "2 hours ago" },
    ]
  };

  const quickActions = [
    {
      title: "Add Challenge",
      description: "Create a new coding challenge",
      icon: Plus,
      href: "/admin/challenges/add",
      color: "bg-blue-500"
    },
    {
      title: "View Analytics",
      description: "Check detailed platform statistics",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "bg-purple-500"
    },
    {
      title: "Manage Users",
      description: "User management and permissions",
      icon: Users,
      href: "/admin/users",
      color: "bg-green-500"
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-orange-500"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back! Here's what's happening with your platform.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Last 24 hours
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +12% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChallenges}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Plus className="h-3 w-3 mr-1 text-blue-500" />
                +8 added this week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contests</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeContests}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                All running smoothly
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +2.1% improvement
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={action.href}>
                  <CardHeader className="pb-3">
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'user' ? 'bg-blue-500' :
                      activity.type === 'challenge' ? 'bg-green-500' :
                      activity.type === 'contest' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Server Uptime</span>
                    <span className="text-green-500">99.9%</span>
                  </div>
                  <Progress value={99.9} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Response Time</span>
                    <span className="text-blue-500">120ms</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>User Satisfaction</span>
                    <span className="text-purple-500">4.8/5</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">All systems operational</span>
              </div>
              <Badge variant="secondary">No issues detected</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
