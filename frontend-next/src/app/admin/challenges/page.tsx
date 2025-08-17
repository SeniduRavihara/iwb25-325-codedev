import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockChallenges } from "@/lib/mock-data"
import { Plus, Search, Clock, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function ChallengesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Challenges</h1>
            <p className="text-muted-foreground mt-2">
              Test your coding skills with our collection of programming challenges
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/challenges/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Challenge
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search challenges..." className="pl-10" />
          </div>
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
          <Select>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="array">Array</SelectItem>
              <SelectItem value="tree">Tree</SelectItem>
              <SelectItem value="dynamic-programming">Dynamic Programming</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Challenges Grid */}
        <div className="grid gap-6">
          {mockChallenges.map((challenge) => (
            <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">
                        <Link href={`/admin/challenges/${challenge.id}`} className="hover:text-primary transition-colors">
                          {challenge.title}
                        </Link>
                      </CardTitle>
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
                    <div className="flex flex-wrap gap-2 mb-3">
                      {challenge.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/challenges/${challenge.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {challenge.timeLimit}min
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {challenge.submissions} submissions
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {challenge.successRate}% success rate
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
