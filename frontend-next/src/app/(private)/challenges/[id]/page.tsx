import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockChallenges } from "@/lib/mock-data"
import { Clock, Users, TrendingUp, Play, Edit } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface ChallengePageProps {
  params: {
    id: string
  }
}

export default function ChallengePage({ params }: ChallengePageProps) {
  const challenge = mockChallenges.find((c) => c.id === params.id)

  if (!challenge) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">{challenge.title}</CardTitle>
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
                    <div className="flex flex-wrap gap-2">
                      {challenge.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/challenges/${challenge.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href={`/challenges/${challenge.id}/solve`}>
                        <Play className="h-4 w-4 mr-2" />
                        Solve
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: challenge.description }}
                />
              </CardContent>
            </Card>

            {/* Test Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Test Cases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {challenge.testCases
                  .filter((tc) => !tc.isHidden)
                  .map((testCase, index) => (
                    <div key={testCase.id} className="space-y-2">
                      <h4 className="font-medium">Example {index + 1}:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Input:</Label>
                          <pre className="bg-muted p-3 rounded-md text-sm mt-1">{testCase.input}</pre>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Output:</Label>
                          <pre className="bg-muted p-3 rounded-md text-sm mt-1">{testCase.expectedOutput}</pre>
                        </div>
                      </div>
                      {index < challenge.testCases.filter((tc) => !tc.isHidden).length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Challenge Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Time Limit</span>
                  </div>
                  <span className="font-medium">{challenge.timeLimit} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Submissions</span>
                  </div>
                  <span className="font-medium">{challenge.submissions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Success Rate</span>
                  </div>
                  <span className="font-medium">{challenge.successRate}%</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory Limit</span>
                  <span className="font-medium">{challenge.memoryLimit} MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Test Cases</span>
                  <span className="font-medium">{challenge.testCases.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Challenge Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Author:</span>
                  <span>{challenge.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{challenge.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>{challenge.updatedAt}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
