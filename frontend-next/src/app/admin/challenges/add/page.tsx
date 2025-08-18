"use client";

import type React from "react";

import { RichTextEditor } from "@/components/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";
import type { TestCase } from "@/lib/mock-data";
import { Plus, Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AddChallengePage() {
  const { isAuthenticated, user, token } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated, or to home if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user?.role, router]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "",
    timeLimit: 30,
    memoryLimit: 256,
    tags: [] as string[],
    newTag: "",
  });

  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: "1", input: "", expectedOutput: "", isHidden: false, points: 50 },
  ]);

  const addTag = () => {
    if (
      formData.newTag.trim() &&
      !formData.tags.includes(formData.newTag.trim())
    ) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.newTag.trim()],
        newTag: "",
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      input: "",
      expectedOutput: "",
      isHidden: false,
      points: 50,
    };
    setTestCases([...testCases, newTestCase]);
  };

  const updateTestCase = (
    id: string,
    field: keyof TestCase,
    value: string | number | boolean
  ) => {
    setTestCases(
      testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  const removeTestCase = (id: string) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((tc) => tc.id !== id));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Check authentication
      if (!token) {
        setSubmitError("Authentication required. Please log in again.");
        return;
      }

      // Validate required fields
      if (!formData.title.trim()) {
        setSubmitError("Title is required");
        return;
      }
      if (!formData.description.trim()) {
        setSubmitError("Description is required");
        return;
      }
      if (!formData.difficulty) {
        setSubmitError("Difficulty is required");
        return;
      }
      if (formData.tags.length === 0) {
        setSubmitError("At least one tag is required");
        return;
      }

      // Prepare challenge data for API
      const challengeData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        difficulty: formData.difficulty,
        tags: JSON.stringify(formData.tags), // Convert array to JSON string
        time_limit: formData.timeLimit * 60, // Convert minutes to seconds
        memory_limit: formData.memoryLimit,
      };

      // Create challenge via API
      const response = await apiService.createChallenge(challengeData, token);

      if (response.success) {
        // TODO: Create test cases for the challenge
        // For now, just redirect to challenges list with success message
        router.push("/admin/challenges?success=true");
      } else {
        setSubmitError(response.message || "Failed to create challenge");
      }
    } catch (err) {
      console.error("Error creating challenge:", err);
      setSubmitError("Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading if not authenticated or not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {!isAuthenticated
              ? "Redirecting to login..."
              : "Access denied. Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Add New Challenge
            </h1>
            <p className="text-muted-foreground mt-2">
              Create a new coding challenge for the platform
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/challenges">Cancel</Link>
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
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter challenge title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value: string) =>
                    setFormData({ ...formData, description: value })
                  }
                  placeholder="Enter challenge description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, difficulty: value })
                    }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeLimit: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memoryLimit">Memory Limit (MB)</Label>
                  <Input
                    id="memoryLimit"
                    type="number"
                    value={formData.memoryLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memoryLimit: parseInt(e.target.value),
                      })
                    }
                    min="16"
                    max="2048"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.newTag}
                    onChange={(e) =>
                      setFormData({ ...formData, newTag: e.target.value })
                    }
                    placeholder="Add a tag"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
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
            <CardContent className="space-y-4">
              {testCases.map((testCase, index) => (
                <div
                  key={testCase.id}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Test Case {index + 1}</h4>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Hidden:</Label>
                      <input
                        type="checkbox"
                        checked={testCase.isHidden}
                        onChange={(e) =>
                          updateTestCase(
                            testCase.id,
                            "isHidden",
                            e.target.checked
                          )
                        }
                        className="rounded"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTestCase(testCase.id)}
                        disabled={testCases.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Input</Label>
                      <Textarea
                        value={testCase.input}
                        onChange={(e) =>
                          updateTestCase(testCase.id, "input", e.target.value)
                        }
                        placeholder="Enter test case input"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Output</Label>
                      <Textarea
                        value={testCase.expectedOutput}
                        onChange={(e) =>
                          updateTestCase(
                            testCase.id,
                            "expectedOutput",
                            e.target.value
                          )
                        }
                        placeholder="Enter expected output"
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Points</Label>
                    <Input
                      type="number"
                      value={testCase.points}
                      onChange={(e) =>
                        updateTestCase(
                          testCase.id,
                          "points",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      max="100"
                      className="w-24"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Error Display */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 text-sm">{submitError}</div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creating..." : "Create Challenge"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
