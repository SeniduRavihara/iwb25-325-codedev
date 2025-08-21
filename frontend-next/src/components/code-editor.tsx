"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, type CodeExecutionResponse } from "@/lib/api";
import type { TestCase } from "@/lib/mock-data";
import { AlertCircle, Download, Play, RotateCcw, Upload } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted animate-pulse rounded-md" />,
}) as any;

export interface FunctionTemplate {
  language: string;
  functionName: string;
  parameters: string[];
  returnType: string;
  starterCode: string;
  executionTemplate: string;
}

interface CodeEditorProps {
  testCases: TestCase[];
  // challengeId?: number; // Add challengeId prop
  // contestId?: number; // Add contestId prop
  functionTemplates?: FunctionTemplate[]; // Add function templates prop
  onSubmit: (
    code: string,
    language: string,
    results?: {
      passedTests: number;
      totalTests: number;
      successRate: number;
      score: number;
    }
  ) => void;
  initialCode?: string;
  initialLanguage?: string;
}

interface TestResult {
  testCase: TestCase;
  index: number;
  actualOutput: string;
  status: "passed" | "failed" | "error";
  executionTime: number;
  error?: string;
}

const languageTemplates = {
  java: `public class Main {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello, World!");
    }
}`,
  python: `# Your code here
print("Hello, World!")`,
  ballerina: `import ballerina/io;

public function main() {
    // Your code here
    io:println("Hello, World!");
}`,
};

const languageExtensions = {
  java: "java",
  python: "python",
  ballerina: "bal",
};

export function CodeEditor({
  testCases,
  functionTemplates = [], // Default to empty array
  onSubmit,
  initialCode,
  initialLanguage = "python",
}: CodeEditorProps) {
  const { user, token } = useAuth();

  // Get initial code from function template if available, otherwise use language template
  const getInitialCode = () => {
    if (initialCode) return initialCode;

    // Check if there's a function template for the initial language
    const template = functionTemplates.find(
      (t) => t.language === initialLanguage
    );
    if (template) {
      return template.starterCode;
    }

    // Fallback to language template
    return languageTemplates[initialLanguage as keyof typeof languageTemplates];
  };

  const [code, setCode] = useState(getInitialCode());
  const [language, setLanguage] = useState(initialLanguage);

  // Update code when function templates change (only on initial load)
  useEffect(() => {
    const template = functionTemplates.find((t) => t.language === language);
    if (template && !initialCode && functionTemplates.length > 0) {
      setCode(template.starterCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [functionTemplates.length]); // Only run when functionTemplates array length changes (initial load)

  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] =
    useState<CodeExecutionResponse | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Configure Monaco themes and settings
    monaco.editor.defineTheme("hackathon-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955" },
        { token: "keyword", foreground: "569CD6" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
      ],
      colors: {
        "editor.background": "#1a1a1a",
        "editor.foreground": "#d4d4d4",
        "editorLineNumber.foreground": "#858585",
        "editor.selectionBackground": "#264f78",
        "editor.inactiveSelectionBackground": "#3a3d41",
      },
    });

    monaco.editor.setTheme("hackathon-dark");
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);

    // Check if there's a function template for the new language
    const template = functionTemplates.find((t) => t.language === newLanguage);
    if (template) {
      setCode(template.starterCode);
    } else {
      setCode(languageTemplates[newLanguage as keyof typeof languageTemplates]);
    }

    setExecutionResult(null);
    setTestResults([]);
    setShowResults(false);
    setError(null);
  };

  const runCode = async () => {
    if (!code.trim()) {
      setError("Please enter some code to run");
      return;
    }

    console.log("🔄 Starting code execution...");
    setIsRunning(true);
    setShowResults(true);
    setError(null);
    setExecutionResult(null);
    setTestResults([]);

    try {
      // Check if we have test cases to run against
      const visibleTestCases = testCases.filter((tc) => !tc.isHidden);

      if (visibleTestCases.length === 0) {
        setError(
          "No test cases available to run. Please add test cases to this challenge."
        );
        return;
      }

      // IMPORTANT: We always run against test cases because:
      // 1. Starter code is just function definitions (not executable standalone)
      // 2. We need input data to test the function
      // 3. The execution template provides the proper test harness
      await runTestCases();

      // Set a success message for the execution result
      setExecutionResult({
        success: true,
        output: `Code executed successfully against ${visibleTestCases.length} test case(s)`,
        executionTime: { milliseconds: 0, seconds: 0 },
      });
    } catch (err) {
      setError("Network error occurred while executing code");
      console.error("Code execution error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const runTestCases = async () => {
    const visibleTestCases = testCases.filter((tc) => !tc.isHidden);
    console.log("👁️ Visible test cases:", visibleTestCases.length);

    const results: TestResult[] = [];

    for (let i = 0; i < visibleTestCases.length; i++) {
      const testCase = visibleTestCases[i];
      try {
        // Create test code that includes the input
        const testCode = createTestCode(code, testCase.input, language);

        const response = await apiService.executeCode({
          code: testCode,
          language: language,
        });

        // console.log(`📊 Test case ${i + 1} response:`, response);

        if (response.success && response.data) {
          const actualOutput = response.data.output?.trim() || "";
          const expectedOutput = testCase.expectedOutput.trim();
          const status = actualOutput === expectedOutput ? "passed" : "failed";

          results.push({
            testCase,
            index: i + 1,
            actualOutput,
            status,
            executionTime: response.data.executionTime?.milliseconds || 0,
          });
        } else {
          // console.log(`❌ Test case ${i + 1} failed:`, response.message);
          results.push({
            testCase,
            index: i + 1,
            actualOutput: "",
            status: "error",
            executionTime: 0,
            error: response.message || "Execution failed",
          });
        }
      } catch (err) {
        // console.log(`❌ Test case ${i + 1} error:`, err);
        results.push({
          testCase,
          index: i + 1,
          actualOutput: "",
          status: "error",
          executionTime: 0,
          error: "Network error",
        });
      }
    }

    // console.log("🏁 All test cases completed:", results);
    setTestResults(results);
  };

  const createTestCode = (
    userCode: string,
    input: string,
    lang: string
  ): string => {
    // Find the function template for the current language
    const template = functionTemplates.find((t) => t.language === lang);
    // console.log("TEMPLATE", template);

    if (!template) {
      // Fallback: return user code as-is if no template found
      return userCode;
    }

    try {
      // Start with the execution template
      let executionCode = template.executionTemplate;

      // Debug: Log the replacement process
      // console.log("🔧 REPLACEMENT DEBUG:");
      // console.log(
      //   "Template starter code:",
      //   JSON.stringify(template.starterCode)
      // );
      // console.log("User code:", JSON.stringify(userCode));
      // console.log("Execution template before replacement:", executionCode);

      // Replace the placeholder function in execution template with user's complete function
      const placeholderInExecution = template.starterCode;

      // Normalize line endings and whitespace for better matching
      const normalizedPlaceholder = placeholderInExecution
        .replace(/\r\n/g, "\n")
        .trim();
      const normalizedUserCode = userCode.replace(/\r\n/g, "\n").trim();
      const normalizedExecutionCode = executionCode.replace(/\r\n/g, "\n");

      // For Java, replace the specific function within the class
      if (lang === "java") {
        // Find the function signature and replace the entire function
        const functionSignature = `public static int ${template.functionName}\\(int\\[\\] ${template.parameters[0]}\\)`;
        const functionRegex = new RegExp(
          `${functionSignature}\\s*\\{[^}]*\\}`,
          "s"
        );

        if (functionRegex.test(normalizedExecutionCode)) {
          executionCode = normalizedExecutionCode.replace(
            functionRegex,
            normalizedUserCode
          );
          console.log("✅ Java function replacement successful");
        } else {
          console.log(
            "❌ Java function replacement failed - function not found"
          );
        }
      } else {
        // For other languages, try the original approach
        if (normalizedExecutionCode.includes(normalizedPlaceholder)) {
          executionCode = normalizedExecutionCode.replace(
            normalizedPlaceholder,
            normalizedUserCode
          );
          console.log("✅ Exact replacement successful");
        } else {
          // Try more flexible replacement
          const escapedPlaceholder = normalizedPlaceholder.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );
          const regex = new RegExp(escapedPlaceholder, "g");
          if (regex.test(normalizedExecutionCode)) {
            executionCode = normalizedExecutionCode.replace(
              regex,
              normalizedUserCode
            );
            console.log("✅ Regex replacement successful");
          } else {
            console.log("❌ Replacement failed - placeholder not found");
            console.log(
              "Available content in execution template:",
              normalizedExecutionCode
            );
          }
        }
      }

      // NEW APPROACH: Replace REPLACE_PARAMETERS0101 with actual parameter assignments
      if (executionCode.includes("REPLACE_PARAMETERS0101")) {
        const parameterAssignments = createParameterAssignments(
          template.parameters,
          input,
          lang
        );

        executionCode = executionCode.replace(
          "REPLACE_PARAMETERS0101",
          parameterAssignments
        );

        console.log("✅ REPLACE_PARAMETERS0101 replacement successful");
        console.log("Parameter assignments:", parameterAssignments);
      } else {
        console.log(
          "⚠️ REPLACE_PARAMETERS0101 placeholder not found, using fallback"
        );
        // Fallback to old approach for backward compatibility
        executionCode = injectInputUsingOldApproach(
          executionCode,
          input,
          lang,
          template
        );
      }

      console.log("FINAL TEMPLATE", executionCode);
      return executionCode;
    } catch (error) {
      console.error("Error creating test code:", error);
      // Fallback to user code if template processing fails
      return userCode;
    }
  };

  // Helper function to format test case input for display
  const formatTestInputForDisplay = (
    input: string,
    parameters: string[]
  ): string => {
    try {
      // Handle literal \n characters in the input string
      const normalizedInput = input.replace(/\\n/g, "\n");

      // Split input by newline to get individual parameter values
      const inputLines = normalizedInput.split("\n");

      // Create formatted parameter assignments
      const formattedParams = parameters
        .map((param, index) => {
          const inputValue = inputLines[index] || "";
          if (!inputValue.trim()) {
            return `${param} = None`;
          }

          const convertedValue = convertJsonToPythonSyntax(inputValue);
          return `${param} = ${convertedValue}`;
        })
        .join("\n");

      return formattedParams;
    } catch (error) {
      console.error("Error formatting test input:", error);
      // Fallback to original input
      return input;
    }
  };

  // Helper function to create parameter assignments for the new approach
  const createParameterAssignments = (
    parameters: string[],
    input: string,
    lang: string
  ): string => {
    // console.log("🔍 DEBUG: Input received:", JSON.stringify(input));
    // console.log("🔍 DEBUG: Parameters:", parameters);

    // Handle literal \n characters in the input string
    const normalizedInput = input.replace(/\\n/g, "\n");
    // console.log("🔍 DEBUG: Normalized input:", JSON.stringify(normalizedInput));

    // Split input by newline to get individual parameter values
    const inputLines = normalizedInput.split("\n");
    // console.log("🔍 DEBUG: Input lines:", inputLines);

    return parameters
      .map((param, index) => {
        const inputValue = inputLines[index] || "";
        // console.log(`🔍 DEBUG: Parameter ${param} = "${inputValue}"`);

        // Handle empty input values
        if (!inputValue.trim()) {
          // console.log(`⚠️ WARNING: Empty input for parameter ${param}`);
          return `${param} = None`;
        }

        const convertedValue = convertJsonToPythonSyntax(inputValue);
        // console.log(`🔍 DEBUG: Converted value for ${param}:`, convertedValue);
        return `${param} = ${convertedValue}`;
      })
      .join("\n");
  };

  // Helper function to convert JSON string to Python syntax
  const convertJsonToPythonSyntax = (jsonString: string): string => {
    // console.log(
    //   "🔍 DEBUG: Converting JSON string:",
    //   JSON.stringify(jsonString)
    // );

    try {
      // Clean the input string - remove any extra whitespace
      const cleanedString = jsonString.trim();

      // Handle empty or null input
      if (!cleanedString || cleanedString === "null") {
        return "None";
      }

      // Try to parse as JSON
      const parsed = JSON.parse(cleanedString);
      // console.log("🔍 DEBUG: Parsed JSON:", parsed);

      // Convert to Python syntax based on type
      if (Array.isArray(parsed)) {
        return `[${parsed.join(", ")}]`;
      } else if (typeof parsed === "string") {
        return `"${parsed}"`;
      } else if (typeof parsed === "boolean") {
        return parsed ? "True" : "False";
      } else if (typeof parsed === "number") {
        return parsed.toString();
      } else if (parsed === null) {
        return "None";
      } else {
        // For objects, convert to Python dict
        const entries = Object.entries(parsed).map(([key, value]) => {
          const valueStr = typeof value === "string" ? `"${value}"` : value;
          return `"${key}": ${valueStr}`;
        });
        return `{${entries.join(", ")}}`;
      }
    } catch (error) {
      console.error("❌ Error converting JSON to Python syntax:", error);
      console.error("❌ Problematic string:", JSON.stringify(jsonString));

      // Fallback: try to handle common cases
      const cleanedString = jsonString.trim();

      // If it looks like a number, return as number
      if (/^-?\d+(\.\d+)?$/.test(cleanedString)) {
        return cleanedString;
      }

      // If it looks like a boolean, convert
      if (cleanedString.toLowerCase() === "true") {
        return "True";
      }
      if (cleanedString.toLowerCase() === "false") {
        return "False";
      }

      // If it looks like an array (starts with [ and ends with ])
      if (cleanedString.startsWith("[") && cleanedString.endsWith("]")) {
        // Try to extract array elements
        try {
          const arrayContent = cleanedString.slice(1, -1);
          const elements = arrayContent.split(",").map((el) => el.trim());
          return `[${elements.join(", ")}]`;
        } catch (e) {
          console.error("❌ Failed to parse array:", e);
        }
      }

      // If it looks like a string (starts and ends with quotes)
      if (
        (cleanedString.startsWith('"') && cleanedString.endsWith('"')) ||
        (cleanedString.startsWith("'") && cleanedString.endsWith("'"))
      ) {
        return cleanedString;
      }

      // Last resort: return as string
      return `"${cleanedString}"`;
    }
  };

  // Fallback function for old approach (backward compatibility)
  const injectInputUsingOldApproach = (
    executionCode: string,
    input: string,
    lang: string,
    template: any
  ): string => {
    if (lang === "python") {
      // Python-specific input injection
      if (template.parameters.length === 1) {
        const parameterName = template.parameters[0];
        const parameterAssignment = `${parameterName} = json.loads('${input}')`;

        // Remove any hardcoded input assignments first
        executionCode = executionCode.replace(
          new RegExp(`${parameterName} = json\\.loads\\('[^']*'\\)`, "g"),
          ""
        );

        // Find the line that reads from stdin and replace it
        const stdinPattern = /input_line = sys\.stdin\.read\(\)\.strip\(\)/;
        if (stdinPattern.test(executionCode)) {
          executionCode = executionCode.replace(
            stdinPattern,
            parameterAssignment
          );
        } else {
          // If no stdin reading, add the parameter assignment before the function call
          const functionCallPattern = new RegExp(
            `result = ${template.functionName}\\([^)]*\\)`
          );
          if (functionCallPattern.test(executionCode)) {
            executionCode = executionCode.replace(
              functionCallPattern,
              `${parameterAssignment}\n$&`
            );
          }
        }

        console.log("✅ Python input injection successful (fallback)");
      }
    } else if (lang === "java") {
      // Java-specific input injection
      const parameterName = template.parameters[0];
      const inputInjection = `String input = "${input}";`;

      // Replace the hardcoded input
      executionCode = executionCode.replace(
        /String input = "\[[^\]]*\]";/,
        inputInjection
      );

      console.log("✅ Java input injection successful (fallback)");
    } else if (lang === "ballerina") {
      // Ballerina-specific input injection
      const parameterName = template.parameters[0];

      // Parse the JSON input and convert to Ballerina array format
      try {
        const parsedInput = JSON.parse(input);
        const ballerinaArray = `[${parsedInput.join(", ")}]`;
        const arrayAssignment = `int[] ${parameterName} = ${ballerinaArray};`;

        // Replace the hardcoded array
        executionCode = executionCode.replace(
          new RegExp(`int\\[\\] ${parameterName} = \\[[^\\]]*\\];`),
          arrayAssignment
        );

        console.log("✅ Ballerina input injection successful (fallback)");
      } catch (error) {
        console.error("❌ Error parsing input for Ballerina:", error);
      }
    }

    return executionCode;
  };

  const submitCode = async () => {
    if (!user || !token) {
      alert("Please login to submit your solution");
      return;
    }

    await runCode();

    // Calculate score based on test results
    if (testResults.length > 0 && testCases) {
      const passedTests = testResults.filter(
        (result) => result.status === "passed"
      ).length;
      const totalTests = testCases.length;
      const successRate = totalTests > 0 ? passedTests / totalTests : 0;

      // Calculate score: (passed tests / total tests) * 100
      const score = successRate * 100;

      // Store result in localStorage instead of submitting to backend
      // const challengeResult = {
      //   challengeId: challengeId || 0,
      //   code,
      //   language,
      //   passedTests,
      //   totalTests,
      //   successRate,
      //   score,
      //   submittedAt: new Date().toISOString(),
      // };

      // Call onSubmit with the result (for UI feedback)
      onSubmit(code, language, {
        passedTests,
        totalTests,
        successRate,
        score,
      });
    } else {
      // Fallback if no results
      onSubmit(code, language, {
        passedTests: 0,
        totalTests: testCases?.length || 0,
        successRate: 0,
        score: 0,
      });
    }
  };

  const resetCode = () => {
    // Check if there's a function template for the current language
    const template = functionTemplates.find((t) => t.language === language);
    if (template) {
      setCode(template.starterCode);
    } else {
      setCode(languageTemplates[language as keyof typeof languageTemplates]);
    }
    setExecutionResult(null);
    setTestResults([]);
    setShowResults(false);
    setError(null);
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `solution.${
      languageExtensions[language as keyof typeof languageExtensions]
    }`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const uploadCode = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".java,.py,.bal,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setCode(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const passedTests = testResults.filter((r) => r.status === "passed").length;
  const totalTests = testResults.length;

  return (
    <div className="space-y-6">
      {/* Editor Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="ballerina">Ballerina</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={uploadCode}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button variant="outline" size="sm" onClick={downloadCode}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={resetCode}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={runCode} disabled={isRunning}>
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Running..." : "Run Against Test Cases"}
          </Button>
          <Button disabled={isRunning} onClick={submitCode}>
            Submit Solution
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <Card>
        <CardContent className="p-0">
          <MonacoEditor
            height="500px"
            language={language === "ballerina" ? "javascript" : language}
            value={code}
            onChange={(value: string | undefined) => setCode(value || "")}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: "on",
              theme: "hackathon-dark",
            }}
          />
        </CardContent>
      </Card>

      {/* Test Results */}
      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Test Results
              {isRunning && (
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isRunning ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  Running your code against test cases...
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-400 p-4 bg-red-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            ) : testResults.length > 0 ? (
              <div className="space-y-4">
                {/* Test Summary */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {passedTests} of {totalTests} test cases passed
                  </div>
                  <div className="text-sm">
                    <span className="text-green-400">{passedTests} Passed</span>
                    {" • "}
                    <span className="text-red-400">
                      {totalTests - passedTests} Failed
                    </span>
                  </div>
                </div>

                {/* Code Analysis (if available) */}
                {executionResult?.analysis && (
                  <>
                    <Separator />
                    <div>
                      <div className="font-medium text-muted-foreground mb-2">
                        Code Analysis:
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-muted-foreground">
                            Lines of Code
                          </div>
                          <div>{executionResult.analysis.linesOfCode}</div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">
                            Code Length
                          </div>
                          <div>{executionResult.analysis.codeLength} chars</div>
                        </div>
                        {executionResult.analysis.estimatedComplexity && (
                          <>
                            <div>
                              <div className="font-medium text-muted-foreground">
                                Time Complexity
                              </div>
                              <div className="text-xs">
                                {
                                  executionResult.analysis.estimatedComplexity
                                    .timeComplexity
                                }
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-muted-foreground">
                                Space Complexity
                              </div>
                              <div className="text-xs">
                                {
                                  executionResult.analysis.estimatedComplexity
                                    .spaceComplexity
                                }
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Performance Info (if available) */}
                {executionResult?.performance && (
                  <>
                    <Separator />
                    <div>
                      <div className="font-medium text-muted-foreground mb-2">
                        Performance Metrics:
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-muted-foreground">
                            Memory Limit
                          </div>
                          <div>{executionResult.performance.memoryLimit}</div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">
                            CPU Limit
                          </div>
                          <div>{executionResult.performance.cpuLimit}</div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">
                            Process Limit
                          </div>
                          <div>{executionResult.performance.processLimit}</div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">
                            Network
                          </div>
                          <div>
                            {executionResult.performance.networkAccess
                              ? "Enabled"
                              : "Disabled"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Individual Test Results */}
                <Separator />
                <div className="space-y-3">
                  {testResults.map((result) => (
                    <div
                      key={result.testCase.id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Test Case {result.index}
                          </span>
                          <Badge
                            variant={
                              result.status === "passed"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {result.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.executionTime.toFixed(2)}ms
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-muted-foreground mb-1">
                            Input:
                          </div>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                            {formatTestInputForDisplay(
                              result.testCase.input,
                              functionTemplates.find(
                                (t) => t.language === language
                              )?.parameters || []
                            )}
                          </pre>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground mb-1">
                            Expected:
                          </div>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                            {result.testCase.expectedOutput}
                          </pre>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground mb-1">
                            Your Output:
                          </div>
                          <pre
                            className={`p-2 rounded text-xs overflow-x-auto ${
                              result.status === "passed"
                                ? "bg-green-900/20"
                                : "bg-red-900/20"
                            }`}
                          >
                            {result.status === "error"
                              ? result.error || "Execution failed"
                              : result.actualOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
