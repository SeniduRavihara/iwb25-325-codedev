"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { mockChallenges } from "@/lib/mock-data"
import { X, Save, Clock } from "lucide-react"
import Link from "next/link"

export default function CreateContestPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    duration: 120,
    maxParticipants: 100,
    registrationDeadline: "",
    rules: "",
    prizes: [] as string[],
    newPrize: "",
  })

  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])

  const addPrize = () => {
    if (formData.newPrize.trim() && !formData.prizes.includes(formData.newPrize.trim())) {
      setFormData({
        ...formData,
        prizes: [...formData.prizes, formData.newPrize.trim()],
        newPrize: "",
      })
    }
  }

  const removePrize = (prizeToRemove: string) => {
    setFormData({
      ...formData,
      prizes: formData.prizes.filter((prize) => prize !== prizeToRemove),
    })
  }

  const toggleChallenge = (challengeId: string) => {
    setSelectedChallenges((prev) =>
      prev.includes(challengeId) ? prev.filter((id) => id !== challengeId) : [...prev, challengeId],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedChallenges.length === 0) {
      alert("Please select at least one challenge")
      return
    }
    // TODO: Implement contest creation logic
    console.log("Creating contest:", { ...formData, challenges: selectedChallenges })
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Contest</h1>
            <p className="text-muted-foreground mt-2">Set up a new coding contest with challenges and rules</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/contests">Cancel</Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contest Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Contest Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter contest title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the contest"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                    min="30"
                    max="480"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: Number.parseInt(e.target.value) })}
                    min="1"
                    max="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                  <Input
                    id="registrationDeadline"
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prizes</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.prizes.map((prize) => (
                    <Badge key={prize} variant="secondary" className="flex items-center gap-1">
                      {prize}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removePrize(prize)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={formData.newPrize}
                    onChange={(e) => setFormData({ ...formData, newPrize: e.target.value })}
                    placeholder="Add a prize (e.g., $500 First Place)"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPrize())}
                  />
                  <Button type="button" onClick={addPrize}>
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Challenge Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockChallenges.map((challenge) => (
                  <div key={challenge.id} className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                    <Checkbox
                      id={`challenge-${challenge.id}`}
                      checked={selectedChallenges.includes(challenge.id)}
                      onCheckedChange={() => toggleChallenge(challenge.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor={`challenge-${challenge.id}`} className="font-medium cursor-pointer">
                          {challenge.title}
                        </Label>
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
                      <div className="flex flex-wrap gap-1 mb-2">
                        {challenge.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {challenge.timeLimit}min
                        </div>
                        <div>Success Rate: {challenge.successRate}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {selectedChallenges.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">Selected: {selectedChallenges.length} challenges</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Contest Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="rules">Rules and Guidelines</Label>
                <RichTextEditor
                  value={formData.rules}
                  onChange={(value) => setFormData({ ...formData, rules: value })}
                  placeholder="Write the contest rules and guidelines..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/contests">Cancel</Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Create Contest
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
