"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockContests } from "@/lib/mock-data"
import { Clock, Calendar, Users, Trophy, Play } from "lucide-react"
import Link from "next/link"

export default function TimerPage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getTimeUntil = (targetDate: string) => {
    const target = new Date(targetDate)
    const now = currentTime
    const diff = target.getTime() - now.getTime()

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds }
  }

  const formatTime = (time: { days: number; hours: number; minutes: number; seconds: number }) => {
    return {
      days: time.days.toString().padStart(2, "0"),
      hours: time.hours.toString().padStart(2, "0"),
      minutes: time.minutes.toString().padStart(2, "0"),
      seconds: time.seconds.toString().padStart(2, "0"),
    }
  }

  const upcomingContests = mockContests.filter((contest) => contest.status === "upcoming")
  const activeContests = mockContests.filter((contest) => contest.status === "active")

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Contest Timer</h1>
          <p className="text-muted-foreground">Stay updated with upcoming contests and active competitions</p>
        </div>

        {/* Current Time Display */}
        <Card className="mb-8">
          <CardContent className="text-center py-8">
            <div className="text-4xl font-mono font-bold text-primary mb-2">{currentTime.toLocaleTimeString()}</div>
            <div className="text-muted-foreground">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </CardContent>
        </Card>

        {/* Active Contests */}
        {activeContests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Play className="h-6 w-6 text-red-500" />
              Live Contests
            </h2>
            <div className="grid gap-6">
              {activeContests.map((contest) => {
                const timeUntilEnd = getTimeUntil(contest.endTime)

                return (
                  <Card key={contest.id} className="border-red-500/50 bg-red-500/5">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {contest.title}
                            <Badge variant="destructive">LIVE</Badge>
                          </CardTitle>
                          <p className="text-muted-foreground mt-2">{contest.description}</p>
                        </div>
                        <Button asChild>
                          <Link href={`/contests/${contest.id}/participate`}>Join Now</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {timeUntilEnd && (
                        <div className="mb-4">
                          <div className="text-sm text-muted-foreground mb-2">Time Remaining:</div>
                          <div className="flex gap-4">
                            {Object.entries(formatTime(timeUntilEnd)).map(([unit, value]) => (
                              <div key={unit} className="text-center">
                                <div className="text-2xl font-mono font-bold text-red-500">{value}</div>
                                <div className="text-xs text-muted-foreground uppercase">{unit}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {contest.participants} participants
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.floor(contest.duration / 60)}h {contest.duration % 60}m duration
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          {contest.challenges.length} problems
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Upcoming Contests */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Upcoming Contests
          </h2>

          {upcomingContests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Upcoming Contests</h3>
                <p className="text-muted-foreground">Check back later for new contests!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {upcomingContests.map((contest) => {
                const timeUntilStart = getTimeUntil(contest.startTime)

                return (
                  <Card key={contest.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {contest.title}
                            <Badge>Upcoming</Badge>
                          </CardTitle>
                          <p className="text-muted-foreground mt-2">{contest.description}</p>
                        </div>
                        <Button variant="outline">Register</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {timeUntilStart && (
                        <div className="mb-4">
                          <div className="text-sm text-muted-foreground mb-2">Starts in:</div>
                          <div className="flex gap-4">
                            {Object.entries(formatTime(timeUntilStart)).map(([unit, value]) => (
                              <div key={unit} className="text-center">
                                <div className="text-2xl font-mono font-bold text-primary">{value}</div>
                                <div className="text-xs text-muted-foreground uppercase">{unit}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(contest.startTime).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.floor(contest.duration / 60)}h {contest.duration % 60}m duration
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {contest.participants}/{contest.maxParticipants} registered
                        </div>
                      </div>

                      {contest.prizes.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="text-sm font-medium text-muted-foreground mb-2">Prizes:</div>
                          <div className="flex flex-wrap gap-2">
                            {contest.prizes.map((prize, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {prize}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
