"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CodeEditor } from "@/components/code-editor"
import { mockContests, mockChallenges } from "@/lib/mock-data"
import { ArrowLeft, Trophy, CheckCircle, Circle } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface ParticipateContestPageProps {
  params: {
    id: string
  }
}

export default function ParticipateContestPage({ params }: ParticipateContestPageProps) {
  const contest = mockContests.find((c) => c.id === params.id)

  if (!contest) {
    notFound()
  }

  const contestChallenges = mockChallenges.filter((c) => contest.challenges.includes(c.id))
  const [selectedChallenge, setSelectedChallenge] = useState(contestChallenges[0])
  const [timeRemaining, setTimeRemaining] = useState(contest.duration * 60) // Convert to seconds
  const [solvedChallenges, setSolvedChallenges] = useState<string[]>([])

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = (code: string, language: string) => {
    // TODO: Implement contest submission logic
    console.log("Contest submission:", {
      contestId: params.id,
      challengeId: selectedChallenge.id,
      code,
      language,
    })

    // Mock: Mark challenge as solved
    if (!solvedChallenges.includes(selectedChallenge.id)) {
      setSolvedChallenges([...solvedChallenges, selectedChallenge.id])
    }

    alert("Solution submitted successfully!")
  }

  const progressPercentage = (solvedChallenges.length / contestChallenges.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Contest Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/contests/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit Contest
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{contest.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  {solvedChallenges.length}/{contestChallenges.length} solved
                </div>
                <Progress value={progressPercentage} className="w-24 h-2" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-primary">{formatTime(timeRemaining)}</div>
              <div className="text-xs text-muted-foreground">Time Remaining</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Problem List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Problems</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contestChallenges.map((challenge, index) => (
                  <button
                    key={challenge.id}
                    onClick={() => setSelectedChallenge(challenge)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedChallenge.id === challenge.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>
                      {solvedChallenges.includes(challenge.id) ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-xs font-medium truncate">{challenge.title}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge
                        variant={
                          challenge.difficulty === "Easy"
                            ? "secondary"
                            : challenge.difficulty === "Medium"
                              ? "default"
                              : "destructive"
                        }
                        className="text-xs px-1 py-0"
                      >
                        {challenge.difficulty[0]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{challenge.timeLimit}m</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Problem Description */}
          <div className="lg:col-span-2">
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{selectedChallenge.title}</CardTitle>
                  <Badge
                    variant={
                      selectedChallenge.difficulty === "Easy"
                        ? "secondary"
                        : selectedChallenge.difficulty === "Medium"
                          ? "default"
                          : "destructive"
                    }
                  >
                    {selectedChallenge.difficulty}
                  </Badge>
                  {solvedChallenges.includes(selectedChallenge.id) && (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-invert max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: selectedChallenge.description }}
                />

                {/* Sample Test Cases */}
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-sm">Sample Test Cases:</h4>
                  {selectedChallenge.testCases
                    .filter((tc) => !tc.isHidden)
                    .map((testCase, index) => (
                      <div key={testCase.id} className="space-y-2">
                        <div className="text-xs font-medium">Example {index + 1}:</div>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <div className="text-xs text-muted-foreground">Input:</div>
                            <pre className="bg-muted p-2 rounded text-xs">{testCase.input}</pre>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Output:</div>
                            <pre className="bg-muted p-2 rounded text-xs">{testCase.expectedOutput}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-3">
            <CodeEditor testCases={selectedChallenge.testCases} onSubmit={handleSubmit} initialLanguage="python" />
          </div>
        </div>
      </div>
    </div>
  )
}
