"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { mockAnalyticsData, mockGlobalUsers } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { Users, Code, Trophy, Target } from "lucide-react"

export default function AnalyticsPage() {
  const chartConfig = {
    submissions: {
      label: "Submissions",
      color: "#8B5CF6", // Purple
    },
    easy: {
      label: "Easy",
      color: "#10B981", // Green
    },
    medium: {
      label: "Medium",
      color: "#F59E0B", // Yellow
    },
    hard: {
      label: "Hard",
      color: "#EF4444", // Red
    },
    python: {
      label: "Python",
      color: "#8B5CF6", // Purple
    },
    java: {
      label: "Java",
      color: "#3B82F6", // Blue
    },
    ballerina: {
      label: "Ballerina",
      color: "#10B981", // Green
    },
  }

  const CHART_COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights into platform performance and user engagement
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalyticsData.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-400">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalyticsData.totalChallenges}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-400">+8</span> added this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contests</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalyticsData.totalContests}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-400">3</span> running now
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalyticsData.averageSuccessRate}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-400">+2.1%</span> improvement
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Submissions Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Submissions Over Time</CardTitle>
              <CardDescription>Daily submission trends for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockAnalyticsData.submissionsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        color: "#F9FAFB",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="submissions"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Language Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Languages</CardTitle>
              <CardDescription>Programming language preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockAnalyticsData.popularLanguages}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ language, percentage }) => `${language} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                      stroke="#374151"
                      strokeWidth={1}
                    >
                      {mockAnalyticsData.popularLanguages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        color: "#F9FAFB",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Challenge Difficulty Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Challenge Difficulty</CardTitle>
              <CardDescription>Distribution of challenges by difficulty level</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockAnalyticsData.challengesByDifficulty}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="difficulty" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        color: "#F9FAFB",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      fill={(entry) => {
                        if (entry?.difficulty === "Easy") return "#10B981"
                        if (entry?.difficulty === "Medium") return "#F59E0B"
                        if (entry?.difficulty === "Hard") return "#EF4444"
                        return "#8B5CF6"
                      }}
                    >
                      {mockAnalyticsData.challengesByDifficulty.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.difficulty === "Easy"
                              ? "#10B981"
                              : entry.difficulty === "Medium"
                                ? "#F59E0B"
                                : entry.difficulty === "Hard"
                                  ? "#EF4444"
                                  : "#8B5CF6"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Leading users by total score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGlobalUsers.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index === 0
                            ? "bg-yellow-500 text-black"
                            : index === 1
                              ? "bg-gray-400 text-white"
                              : index === 2
                                ? "bg-amber-600 text-white"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.challengesSolved} challenges solved</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{user.totalScore}</div>
                      <div className="text-sm text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
