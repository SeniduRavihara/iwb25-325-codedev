"use client";

import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, type Contest } from "@/lib/api";
import { ArrowLeft, Calendar, Clock, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EditContestPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditContestPage({ params }: EditContestPageProps) {
  const { isAuthenticated, user, token } = useAuth();
  const router = useRouter();
  const [contestId, setContestId] = useState<string>("");
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    duration: 120,
    max_participants: 100,
    registration_deadline: "",
    rules: "",
    prizes: "",
  });

  // Redirect to login if not authenticated, or to home if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user?.role, router]);

  // Get contest ID from params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setContestId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Load contest data
  useEffect(() => {
    const loadContestData = async () => {
      if (!contestId || !token) return;

      try {
        setLoading(true);
        const response = await apiService.getAdminContests(token);

        if (response.success && response.data?.data) {
          const foundContest = response.data.data.find(
            (c: Contest) => c.id.toString() === contestId
          );

          if (foundContest) {
            setContest(foundContest);

            // Populate form data
            setFormData({
              title: foundContest.title,
              description: foundContest.description,
              start_time: foundContest.start_time.slice(0, 16), // Format for datetime-local
              end_time: foundContest.end_time.slice(0, 16),
              duration: foundContest.duration,
              max_participants: foundContest.max_participants,
              registration_deadline: foundContest.registration_deadline.slice(
                0,
                16
              ),
              rules: foundContest.rules,
              prizes: foundContest.prizes,
            });
          } else {
            setError("Contest not found");
          }
        } else {
          setError(response.message || "Failed to load contest");
        }
      } catch (err) {
        console.error("Error loading contest:", err);
        setError("Failed to load contest data");
      } finally {
        setLoading(false);
      }
    };

    loadContestData();
  }, [contestId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setSubmitError("No authentication token");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Note: Backend endpoint for updating contests is not yet available
      console.log("Updating contest:", formData);

      // TODO: Implement contest update when backend endpoint is available
      // const response = await apiService.updateContest(contestId, formData, token);

      alert(
        "Contest update functionality will be available when backend support is added."
      );
    } catch (err) {
      console.error("Error updating contest:", err);
      setSubmitError("Failed to update contest");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="text-muted-foreground">
            Loading contest details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            Error: {error || "Contest not found"}
          </div>
          <Button asChild>
            <Link href="/admin/contests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contests
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/contests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contests
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Contest</h1>
            <p className="text-muted-foreground">
              Update contest details and settings
            </p>
          </div>
        </div>
      </div>

      {/* Note about backend limitations */}
      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-1">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">Note</h3>
              <p className="text-yellow-700 text-sm">
                Currently, contest updates require backend support. The form is
                ready but the update functionality will be enabled once the
                backend endpoint is available.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter contest title"
                    className="border-2 border-border focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_participants: parseInt(e.target.value),
                      })
                    }
                    placeholder="100"
                    className="border-2 border-border focus:border-primary"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) =>
                    setFormData({ ...formData, description: value })
                  }
                  placeholder="Enter contest description..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="border-2 border-border focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className="border-2 border-border focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    placeholder="120"
                    className="border-2 border-border focus:border-primary"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="registration_deadline">
                    Registration Deadline
                  </Label>
                  <Input
                    id="registration_deadline"
                    type="datetime-local"
                    value={formData.registration_deadline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registration_deadline: e.target.value,
                      })
                    }
                    className="border-2 border-border focus:border-primary"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={formData.rules}
                onChange={(value) => setFormData({ ...formData, rules: value })}
                placeholder="Enter contest rules..."
              />
            </CardContent>
          </Card>

          {/* Prizes */}
          <Card>
            <CardHeader>
              <CardTitle>Prizes</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={formData.prizes}
                onChange={(value) =>
                  setFormData({ ...formData, prizes: value })
                }
                placeholder="Enter contest prizes..."
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
                         <Button variant="outline" asChild>
               <Link href={`/admin/contests/${contest.id}`}>Cancel</Link>
             </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Contest
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="text-red-500 text-center">{submitError}</div>
          )}
        </div>
      </form>
    </div>
  );
}
