import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockGlobalUsers, mockContestParticipants, mockContests } from "@/lib/mock-data"
import { Trophy, Medal, Award, TrendingUp, Calendar, Code } from "lucide-react"

export default function LeaderboardPage() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-muted-foreground font-medium">#{rank}</span>
    }
  }

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground mt-2">See how you rank against other developers on CodeArena</p>
        </div>

        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="global">Global Rankings</TabsTrigger>
            <TabsTrigger value="contests">Contest Rankings</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Leaders</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-6">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {mockGlobalUsers.slice(0, 3).map((user, index) => (
                <Card
                  key={user.id}
                  className={`relative ${index === 0 ? "md:order-2 ring-2 ring-primary" : index === 1 ? "md:order-1" : "md:order-3"}`}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-3">{getRankIcon(user.globalRank)}</div>
                    <Avatar className="h-16 w-16 mx-auto mb-3">
                      <AvatarFallback className="text-lg font-bold">{getInitials(user.username)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{user.username}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-2">
                    <div className="text-2xl font-bold text-primary">{user.totalScore}</div>
                    <div className="text-sm text-muted-foreground">Total Score</div>
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                      <div>{user.challengesSolved} solved</div>
                      <div>{user.contestsParticipated} contests</div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {user.badges.slice(0, 2).map((badge) => (
                        <Badge key={badge} variant="outline" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full Rankings Table */}
            <Card>
              <CardHeader>
                <CardTitle>Global Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockGlobalUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 flex justify-center">{getRankIcon(user.globalRank)}</div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Code className="h-3 w-3" />
                            {user.preferredLanguage}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-primary">{user.totalScore}</div>
                          <div className="text-muted-foreground">Score</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{user.challengesSolved}</div>
                          <div className="text-muted-foreground">Solved</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{user.contestsParticipated}</div>
                          <div className="text-muted-foreground">Contests</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{user.averageScore}</div>
                          <div className="text-muted-foreground">Avg</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contests" className="space-y-6">
            <div className="grid gap-6">
              {mockContests.map((contest) => {
                const participants = mockContestParticipants.filter((p) => p.contestId === contest.id)
                if (participants.length === 0) return null

                return (
                  <Card key={contest.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{contest.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={
                                contest.status === "completed"
                                  ? "secondary"
                                  : contest.status === "active"
                                    ? "destructive"
                                    : "default"
                              }
                            >
                              {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                            </Badge>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(contest.startTime)}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Contest
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between p-3 border border-border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 flex justify-center">{getRankIcon(participant.rank)}</div>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-sm">{getInitials(participant.username)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{participant.username}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-center">
                                <div className="font-bold text-primary">{participant.score}</div>
                                <div className="text-muted-foreground">Score</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{participant.submissions}</div>
                                <div className="text-muted-foreground">Submissions</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  January 2024 Leaders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockGlobalUsers.slice(0, 10).map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 flex justify-center">{getRankIcon(index + 1)}</div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-muted-foreground">
                            {Math.floor(user.totalScore * 0.3)} points this month
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-primary">{Math.floor(user.challengesSolved * 0.4)}</div>
                          <div className="text-muted-foreground">Solved</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{Math.floor(user.contestsParticipated * 0.5)}</div>
                          <div className="text-muted-foreground">Contests</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
