"use client";

import { CodeEditor, FunctionTemplate } from "@/components/code-editor";
import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  apiService,
  CodeTemplateCreate,
  type Challenge,
  type Contest,
} from "@/lib/api";
import { type TestCase } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";

export default function ContestChallengePage({
  params,
}: {
  params: Promise<{ id: string; challengeId: string }>;
}) {
  const { isAuthenticated, user, token } = useAuth();
  const router = useRouter();

  const [contest, setContest] = useState<Contest | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Sample function templates for testing
  // const sampleFunctionTemplates = [
  //   {
  //     language: "python",
  //     functionName: "max_subarray_sum",
  //     parameters: ["nums"],
  //     returnType: "int",
  //     starterCode:
  //       "def max_subarray_sum(nums):\n    # Write your solution here\n    pass",
  //     executionTemplate:
  //       "# Execution template\nimport json\nimport sys\n\ndef max_subarray_sum(nums):\n    # Write your solution here\n    pass\n\n# Test execution wrapper\ninput_lines = sys.stdin.read().strip().split('\\n')\n\nresult = max_subarray_sum(nums)\nprint(result)",
  //   },
  //   {
  //     language: "java",
  //     functionName: "maxSubarraySum",
  //     parameters: ["nums"],
  //     returnType: "int",
  //     starterCode:
  //       "public static int maxSubarraySum(int[] nums) {\n    // Write your solution here\n    return 0;\n}",
  //     executionTemplate:
  //       'import java.util.*;\n\npublic class Main {\n    public static int maxSubarraySum(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        try {\n            // Parse input array from string like "[1,2,3]"\n            String input = "[1,2,3]";\n            input = input.substring(1, input.length() - 1); // Remove [ and ]\n            String[] parts = input.split(",");\n            int[] nums = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) {\n                nums[i] = Integer.parseInt(parts[i].trim());\n            }\n            \n            int result = maxSubarraySum(nums);\n            System.out.println(result);\n        } catch (Exception e) {\n            System.err.println("Error: " + e.getMessage());\n        }\n    }\n}',
  //   },
  //   {
  //     language: "ballerina",
  //     functionName: "maxSubarraySum",
  //     parameters: ["nums"],
  //     returnType: "int",
  //     starterCode:
  //       "public function maxSubarraySum(int[] nums) returns int {\n    // Write your solution here\n    return 0;\n}",
  //     executionTemplate:
  //       "import ballerina/io;\n\npublic function maxSubarraySum(int[] nums) returns int {\n    // Write your solution here\n    return 0;\n}\n\npublic function main() returns error? {\n    // Simple test with hardcoded array\n    int[] nums = [1, 2, 3];\n    int result = maxSubarraySum(nums);\n    io:println(result);\n}",
  //   },
  // ];

  const resolvedParams = use(params);
  const contestId = parseInt(resolvedParams.id);
  const challengeId = parseInt(resolvedParams.challengeId);

  const [functionTemplates, setFunctionTemplates] = useState<
    FunctionTemplate[]
  >([]);

  useEffect(() => {
    console.log("functionTemplates", functionTemplates);
    console.log("testCases", testCases);
  }, [functionTemplates, testCases]);

  const getFunctionTemplates = async () => {
    try {
      const response = await apiService.getCodeTemplates(challengeId);
      if (response.success && response.data && response.data.data) {
        setFunctionTemplates(
          response.data.data.map((ft: CodeTemplateCreate) => ({
            language: ft.language,
            functionName: ft.function_name,
            parameters: JSON.parse(ft.parameters),
            returnType: ft.return_type,
            starterCode: ft.starter_code,
            executionTemplate: ft.execution_template,
          }))
        );
      } else {
        setError(response.message || "Failed to fetch function templates");
      }
    } catch (error) {
      console.error("Error fetching function templates:", error);
    }
  };

  const getTestCases = async () => {
    try {
      const testCasesResponse = await apiService.getTestCases(challengeId);

      console.log("testCasesResponse", testCasesResponse);

      if (
        testCasesResponse.success &&
        testCasesResponse.data &&
        testCasesResponse.data.data
      ) {
        // Map API response to expected format
        const mappedTestCases = testCasesResponse.data.data.map(
          (apiTestCase: any) => ({
            id: apiTestCase.id.toString(),
            input: apiTestCase.input_data,
            expectedOutput: apiTestCase.expected_output,
            isHidden: apiTestCase.is_hidden,
            points: apiTestCase.points,
          })
        );

        // console.log("mappedTestCases", mappedTestCases);

        setTestCases(mappedTestCases);
      } else {
        console.log("Failed to get test cases:", testCasesResponse);
      }
    } catch (err) {
      console.error("Error fetching test cases:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      try {
        const contestResponse = await apiService.getContests();

        if (
          contestResponse.success &&
          contestResponse.data &&
          contestResponse.data.data
        ) {
          const foundContest = contestResponse.data.data.find(
            (c: Contest) => c.id === contestId
          );

          if (foundContest) {
            setContest(foundContest);

            if (foundContest.status !== "active") {
              try {
                await apiService.updateContestStatus(contestId);

                // Refresh contest data after status update
                const refreshResponse = await apiService.getContests();

                if (
                  refreshResponse.success &&
                  refreshResponse.data &&
                  refreshResponse.data.data
                ) {
                  const refreshedContest = refreshResponse.data.data.find(
                    (c: Contest) => c.id === contestId
                  );

                  if (
                    refreshedContest &&
                    refreshedContest.status === "active"
                  ) {
                    setContest(refreshedContest);
                    return; // Continue with the active contest
                  }
                }
              } catch (error) {
                console.error("❌ Failed to update contest status:", error);
              }

              setError("This contest is not active yet");
              return;
            } else {
            }
          } else {
            setError("Contest not found");
          }
        } else {
          setError("Contest not found");
        }
        // Fetch challenge details
        const challengesResponse = await apiService.getChallengesForContest(
          contestId
        );

        if (
          challengesResponse.success &&
          challengesResponse.data &&
          challengesResponse.data.data
        ) {
          const foundChallenge = challengesResponse.data.data.find(
            (c: Challenge) => c.id === challengeId
          );

          if (foundChallenge) {
            setChallenge(foundChallenge);
            console.log("foundChallenge", foundChallenge);

            await getFunctionTemplates();
            await getTestCases();
          } else {
            console.log(" Challenge not found");
            setError("Challenge not found");
          }
        } else {
          console.log(" Failed to fetch challenges:", challengesResponse);
        }
      } catch (err) {
        console.error("Network error occurred:", err);
        setError("Network error occurred");
      } finally {
        // console.log("🏁 fetchData completed, setting loading to false");
        setLoading(false);
      }
    };

    fetchData();
  }, [contestId, challengeId, isAuthenticated, router]);

  // Timer effect for contest duration
  useEffect(() => {
    if (!contest) {
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(contest.end_time).getTime();
      const timeLeft = endTime - now;

      if (timeLeft <= 0) {
        router.push(`/contests/${contestId}/results`);
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [contest, contestId, router]);

  const handleSubmit = useCallback(
    async (
      code: string,
      language: string,
      results?: {
        passedTests: number;
        totalTests: number;
        successRate: number;
        score: number;
      }
    ) => {
      if (!user || !token) {
        alert("Please login to submit your solution");
        return;
      }
      console.log("SENIDU-RESULT", code, language, results);

      await apiService.submitChallengeSolution(
        contestId,
        challengeId,
        user.id,
        code,
        language,
        token,
        results
      );

      // Show success message since results are stored in localStorage
      if (results) {
        alert(
          `Solution saved successfully!\n\nTest Results:\n- Passed: ${
            results.passedTests
          }/${results.totalTests}\n- Success Rate: ${(
            results.successRate * 100
          ).toFixed(1)}%\n- Score: ${results.score.toFixed(
            2
          )}\n\nResults saved locally. Complete all challenges and click "End Contest" to submit final results.`
        );
      } else {
        alert(
          "Solution saved successfully! Complete all challenges and click 'End Contest' to submit final results."
        );
      }

      // Redirect back to contest participate page
      router.push(`/contests/${contestId}/participate`);
    },
    [challengeId, contestId, router, token]
  ); // Only recreate if these values change

  const parsedTags = useMemo(() => {
    if (!challenge?.tags) return [];
    try {
      const parsed = JSON.parse(challenge.tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }, [challenge?.tags]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading challenge...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contest || !challenge) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="text-red-500">
              Error: {error || "Challenge not found"}
            </div>
            <Button asChild className="mt-4">
              <Link href={`/contests/${contestId}/participate`}>
                Back to Contest
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Contest Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/contests/${contestId}/participate`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contest
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{contest.title}</h1>
              <div className="text-sm text-muted-foreground">
                Problem: {challenge.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-primary">
                {timeRemaining
                  ? `${timeRemaining.hours
                      .toString()
                      .padStart(2, "0")}:${timeRemaining.minutes
                      .toString()
                      .padStart(2, "0")}:${timeRemaining.seconds
                      .toString()
                      .padStart(2, "0")}`
                  : "00:00:00"}
              </div>
              <div className="text-xs text-muted-foreground">
                Time Remaining
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Problem Description */}
          <div className="lg:col-span-2">
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <Badge
                    variant={
                      challenge.difficulty.toLowerCase() === "easy"
                        ? "secondary"
                        : challenge.difficulty.toLowerCase() === "medium"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {challenge.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: challenge.description,
                  }}
                />

                {/* Tags */}
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Tags:</div>
                  <div className="flex flex-wrap gap-1">
                    {parsedTags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Challenge Info */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Limit:</span>
                    <span>{Math.floor(challenge.time_limit / 60)} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Memory Limit:</span>
                    <span>{challenge.memory_limit} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span>{Math.round(challenge.success_rate * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-4">
            <CodeEditor
              testCases={testCases}
              functionTemplates={functionTemplates}
              challengeId={challengeId}
              contestId={contestId}
              onSubmit={handleSubmit}
              initialLanguage="python"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
