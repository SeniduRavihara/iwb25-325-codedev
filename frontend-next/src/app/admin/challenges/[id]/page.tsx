"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, type Challenge } from "@/lib/api";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Code,
  Edit,
  HardDrive,
  Star,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  points: number;
}

interface FunctionTemplate {
  language: string;
  functionName: string;
  parameters: string[];
  returnType: string;
  starterCode: string;
  executionTemplate: string;
}

interface ViewChallengePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ViewChallengePage({ params }: ViewChallengePageProps) {
  const { isAuthenticated, user, token } = useAuth();
  const router = useRouter();
  const [challengeId, setChallengeId] = useState<string>("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [functionTemplates, setFunctionTemplates] = useState<
    FunctionTemplate[]
  >([]);

  // Redirect to login if not authenticated, or to home if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user?.role, router]);

  // Get challenge ID from params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setChallengeId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Load challenge data
  useEffect(() => {
    const loadChallengeData = async () => {
      if (!challengeId || !token) return;

      try {
        setLoading(true);
        const response = await apiService.getAdminChallenges(token);

        if (response.success && response.data?.data) {
          const foundChallenge = response.data.data.find(
            (c: Challenge) => c.id.toString() === challengeId
          );

          if (foundChallenge) {
            setChallenge(foundChallenge);

            // Parse tags
            try {
              const tagsArray =
                typeof foundChallenge.tags === "string"
                  ? JSON.parse(foundChallenge.tags)
                  : foundChallenge.tags;
              foundChallenge.tags = tagsArray;
            } catch (error) {
              console.warn("Failed to parse tags:", error);
              foundChallenge.tags = [];
            }
          } else {
            setError("Challenge not found");
          }
        } else {
          setError(response.message || "Failed to load challenge");
        }
      } catch (err) {
        console.error("Error loading challenge:", err);
        setError("Failed to load challenge data");
      } finally {
        setLoading(false);
      }
    };

    loadChallengeData();
  }, [challengeId, token]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "default";
      case "medium":
        return "secondary";
      case "hard":
        return "destructive";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="text-muted-foreground">
            Loading challenge details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            Error: {error || "Challenge not found"}
          </div>
          <Button asChild>
            <Link href="/admin/challenges">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Challenges
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
            <Link href="/admin/challenges">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Challenges
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{challenge.title}</h1>
            <p className="text-muted-foreground">Challenge Details</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/challenges/${challenge.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Challenge
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Title
                </Label>
                <p className="text-lg font-medium">{challenge.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Difficulty
                </Label>
                <div className="mt-1">
                  <Badge variant={getDifficultyBadge(challenge.difficulty)}>
                    {challenge.difficulty.charAt(0).toUpperCase() +
                      challenge.difficulty.slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Time Limit
                </Label>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {challenge.time_limit}ms
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Memory Limit
                </Label>
                <p className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  {challenge.memory_limit}MB
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Description
              </Label>
              <div className="mt-2 p-4 bg-muted rounded-lg">
                <div
                  dangerouslySetInnerHTML={{ __html: challenge.description }}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Tags
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(challenge.tags) && challenge.tags.length > 0 ? (
                  challenge.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">No tags</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Submissions</p>
                  <p className="text-2xl font-bold">
                    {challenge.submissions_count}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Star className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {Math.round(challenge.success_rate * 100)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Code className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Challenge ID</p>
                  <p className="text-2xl font-bold">#{challenge.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Function Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Function Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Function templates will be loaded here when backend support is
                available.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Test Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Test cases will be loaded here when backend support is
                available.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
