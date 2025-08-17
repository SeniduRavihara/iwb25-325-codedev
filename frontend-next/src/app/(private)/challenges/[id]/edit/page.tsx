"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Save } from "lucide-react"
import { mockChallenges, type TestCase } from "@/lib/mock-data"
import Link from "next/link"
import { notFound } from "next/navigation"

interface EditChallengePageProps {
  params: {
    id: string
  }
}

export default function EditChallengePage({ params }: EditChallengePageProps) {
  const challenge = mockChallenges.find((c) => c.id === params.id)

  if (!challenge) {
    notFound()
  }

  const [formData, setFormData] = useState({
    title: challenge.title,
    description: challenge.description,
    difficulty: challenge.difficulty,
    timeLimit: challenge.timeLimit,
    memoryLimit: challenge.memoryLimit,
    tags: challenge.tags,
    newTag: "",
  })

  const [testCases, setTestCases] = useState<TestCase[]>(challenge.testCases)

  const addTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.newTag.trim()],
        newTag: "",
      })
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      input: "",
      expectedOutput: "",
      isHidden: false,
      points: 50,
    }
    setTestCases([...testCases, newTestCase])
  }

  const updateTestCase = (id: string, field: keyof TestCase, value: any) => {
    setTestCases(testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)))
  }

  const removeTestCase = (id: string) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((tc) => tc.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement challenge update logic
    console.log("Updating challenge:", { ...formData, testCases })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Challenge</h1>
            <p className="text-muted-foreground mt-2">Update the challenge details and test cases</p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/challenges/${params.id}`}>Cancel</Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Challenge Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter challenge title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Write the challenge description with examples..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: Number.parseInt(e.target.value) })}
                    min="1"
                    max="180"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memoryLimit">Memory Limit (MB)</Label>
                  <Input
                    id="memoryLimit"
                    type="number"
                    value={formData.memoryLimit}
                    onChange={(e) => setFormData({ ...formData, memoryLimit: Number.parseInt(e.target.value) })}
                    min="64"
                    max="1024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={formData.newTag}
                    onChange={(e) => setFormData({ ...formData, newTag: e.target.value })}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Cases */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Test Cases</CardTitle>
                <Button type="button" onClick={addTestCase} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Test Case
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {testCases.map((testCase, index) => (
                <div key={testCase.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Test Case {index + 1}</h4>
                    {testCases.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeTestCase(testCase.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Input</Label>
                      <Textarea
                        value={testCase.input}
                        onChange={(e) => updateTestCase(testCase.id, "input", e.target.value)}
                        placeholder="Enter test input"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Output</Label>
                      <Textarea
                        value={testCase.expectedOutput}
                        onChange={(e) => updateTestCase(testCase.id, "expectedOutput", e.target.value)}
                        placeholder="Enter expected output"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`hidden-${testCase.id}`}
                        checked={testCase.isHidden}
                        onChange={(e) => updateTestCase(testCase.id, "isHidden", e.target.checked)}
                        className="rounded border-border"
                      />
                      <Label htmlFor={`hidden-${testCase.id}`}>Hidden test case</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`points-${testCase.id}`}>Points:</Label>
                      <Input
                        id={`points-${testCase.id}`}
                        type="number"
                        value={testCase.points}
                        onChange={(e) => updateTestCase(testCase.id, "points", Number.parseInt(e.target.value))}
                        className="w-20"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/challenges/${params.id}`}>Cancel</Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Update Challenge
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
