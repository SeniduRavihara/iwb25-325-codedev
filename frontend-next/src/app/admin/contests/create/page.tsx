"use client";

import type React from "react";

import { RichTextEditor } from "@/components/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, type Challenge } from "@/lib/api";
import { Clock, Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateContestPage() {
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

  // Fetch challenges for selection
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!token) {
        setChallengesError("No authentication token");
        setLoadingChallenges(false);
        return;
      }

      try {
        const response = await apiService.getAdminChallenges(token);
        if (response.success && response.data && response.data.data) {
          setChallenges(response.data.data);
        } else {
          setChallengesError(response.message || "Failed to fetch challenges");
        }
      } catch (err) {
        setChallengesError("Network error occurred");
        console.error("Error fetching challenges:", err);
      } finally {
        setLoadingChallenges(false);
      }
    };

    if (token) {
      fetchChallenges();
    }
  }, [token]);

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
  });

  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [challengesError, setChallengesError] = useState<string | null>(null);

  const addPrize = () => {
    if (
      formData.newPrize.trim() &&
      !formData.prizes.includes(formData.newPrize.trim())
    ) {
      setFormData({
        ...formData,
        prizes: [...formData.prizes, formData.newPrize.trim()],
        newPrize: "",
      });
    }
  };

  const removePrize = (prizeToRemove: string) => {
    setFormData({
      ...formData,
      prizes: formData.prizes.filter((prize) => prize !== prizeToRemove),
    });
  };

  const toggleChallenge = (challengeId: string) => {
    setSelectedChallenges((prev) =>
      prev.includes(challengeId)
        ? prev.filter((id) => id !== challengeId)
        : [...prev, challengeId]
    );
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
      if (!formData.startTime) {
        setSubmitError("Start time is required");
        return;
      }
      if (!formData.registrationDeadline) {
        setSubmitError("Registration deadline is required");
        return;
      }
      if (selectedChallenges.length === 0) {
        setSubmitError("Please select at least one challenge");
        return;
      }

      // Calculate end time based on start time and duration
      // Fix timezone issue by preserving local time
      const startDate = new Date(formData.startTime);
      const endDate = new Date(
        startDate.getTime() + formData.duration * 60 * 1000
      );

      // Convert to UTC while preserving the intended local time
      const startTimeUTC = new Date(
        startDate.getTime() - startDate.getTimezoneOffset() * 60000
      ).toISOString();
      const endTimeUTC = new Date(
        endDate.getTime() - endDate.getTimezoneOffset() * 60000
      ).toISOString();
      const registrationDeadlineUTC = new Date(
        new Date(formData.registrationDeadline).getTime() -
          new Date(formData.registrationDeadline).getTimezoneOffset() * 60000
      ).toISOString();

      // Prepare contest data for API
      const contestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        start_time: startTimeUTC,
        end_time: endTimeUTC,
        duration: formData.duration,
        max_participants: formData.maxParticipants,
        prizes: JSON.stringify(formData.prizes), // Convert array to JSON string
        rules: formData.rules.trim(),
        registration_deadline: registrationDeadlineUTC,
      };

      // Create contest via API
      const response = await apiService.createContest(contestData, token);

      if (response.success) {
        // TODO: Link selected challenges to the contest
        // For now, just redirect to contests list with success message
        router.push("/admin/contests?success=true");
      } else {
        setSubmitError(response.message || "Failed to create contest");
      }
    } catch (err) {
      console.error("Error creating contest:", err);
      setSubmitError("Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Create New Contest
            </h1>
            <p className="text-muted-foreground mt-2">
              Set up a new coding contest with challenges and rules
            </p>
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
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter contest title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: Number.parseInt(e.target.value),
                      })
                    }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxParticipants: Number.parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationDeadline">
                    Registration Deadline
                  </Label>
                  <Input
                    id="registrationDeadline"
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registrationDeadline: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prizes</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.prizes.map((prize) => (
                    <Badge
                      key={prize}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {prize}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removePrize(prize)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={formData.newPrize}
                    onChange={(e) =>
                      setFormData({ ...formData, newPrize: e.target.value })
                    }
                    placeholder="Add a prize (e.g., $500 First Place)"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addPrize())
                    }
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
              {loadingChallenges ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">
                    Loading challenges...
                  </p>
                </div>
              ) : challengesError ? (
                <div className="text-center py-8">
                  <div className="text-red-500">Error: {challengesError}</div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {challenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className="flex items-start space-x-3 p-4 border border-border rounded-lg"
                      >
                        <Checkbox
                          id={`challenge-${challenge.id}`}
                          checked={selectedChallenges.includes(
                            challenge.id.toString()
                          )}
                          onCheckedChange={() =>
                            toggleChallenge(challenge.id.toString())
                          }
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Label
                              htmlFor={`challenge-${challenge.id}`}
                              className="font-medium cursor-pointer"
                            >
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
                            {(() => {
                              try {
                                // Handle both string array (mock data) and JSON string (API data)
                                const tagsArray =
                                  typeof challenge.tags === "string"
                                    ? JSON.parse(challenge.tags)
                                    : challenge.tags;
                                return tagsArray.map((tag: string) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ));
                              } catch (error) {
                                return (
                                  <span className="text-muted-foreground text-xs">
                                    No tags
                                  </span>
                                );
                              }
                            })()}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(challenge.time_limit / 60)}min
                            </div>
                            <div>
                              Success Rate:{" "}
                              {Math.round(challenge.success_rate * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedChallenges.length > 0 && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium">
                        Selected: {selectedChallenges.length} challenges
                      </div>
                    </div>
                  )}
                </>
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
                  onChange={(value) =>
                    setFormData({ ...formData, rules: value })
                  }
                  placeholder="Write the contest rules and guidelines..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 text-sm">{submitError}</div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/contests">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creating..." : "Create Contest"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
