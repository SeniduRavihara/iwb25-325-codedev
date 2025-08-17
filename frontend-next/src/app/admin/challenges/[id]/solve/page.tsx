"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeEditor } from "@/components/code-editor"
import { mockChallenges } from "@/lib/mock-data"
import { ArrowLeft, Clock, Database } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface SolveChallengePage {
  params: {
    id: string
  }
}

export default function SolveChallengePage({ params }: SolveChallengePage) {
  const challenge = mockChallenges.find((c) => c.id === params.id)

  if (!challenge) {
    notFound()
  }

  const handleSubmit = (code: string, language: string) => {
    // TODO: Implement submission logic
    console.log("Submitting solution:", { challengeId: params.id, code, language })
    alert("Solution submitted successfully!")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/challenges/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Problem
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{challenge.title}</h1>
            <Badge
              variant={
                challenge.difficulty === "Easy"
                  ? "secondary"
                  : challenge.difficulty === "Medium"
                    ? "default"
                    : "destructive"
              }
            >
              {challenge.difficulty}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Problem Description */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Problem Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-invert max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: challenge.description }}
                />
              </CardContent>
            </Card>

            {/* Sample Test Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Test Cases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {challenge.testCases
                  .filter((tc) => !tc.isHidden)
                  .map((testCase, index) => (
                    <div key={testCase.id} className="space-y-2">
                      <h4 className="font-medium text-sm">Example {index + 1}:</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Input:</div>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">{testCase.input}</pre>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Output:</div>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">{testCase.expectedOutput}</pre>
                        </div>
                      </div>
                      {index < challenge.testCases.filter((tc) => !tc.isHidden).length - 1 && (
                        <hr className="border-border my-3" />
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Constraints */}
            <Card>
              <CardHeader>
                <CardTitle>Constraints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Time Limit: {challenge.timeLimit} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span>Memory Limit: {challenge.memoryLimit} MB</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>• All test cases must pass to get full points</div>
                  <div>• Partial scoring may be available</div>
                  <div>• Multiple submissions allowed</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-3">
            <CodeEditor testCases={challenge.testCases} onSubmit={handleSubmit} initialLanguage="python" />
          </div>
        </div>
      </div>
    </div>
  )
}
