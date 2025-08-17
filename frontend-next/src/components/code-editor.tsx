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
import { apiService, type CodeExecutionResponse } from "@/lib/api";
import type { TestCase } from "@/lib/mock-data";
import { AlertCircle, Download, Play, RotateCcw, Upload } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted animate-pulse rounded-md" />,
}) as any;

interface CodeEditorProps {
  testCases: TestCase[];
  onSubmit: (code: string, language: string) => void;
  initialCode?: string;
  initialLanguage?: string;
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
  onSubmit,
  initialCode,
  initialLanguage = "python",
}: CodeEditorProps) {
  const [code, setCode] = useState(
    initialCode ||
      languageTemplates[initialLanguage as keyof typeof languageTemplates]
  );
  const [language, setLanguage] = useState(initialLanguage);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] =
    useState<CodeExecutionResponse | null>(null);
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
    setCode(languageTemplates[newLanguage as keyof typeof languageTemplates]);
    setExecutionResult(null);
    setShowResults(false);
    setError(null);
  };

  const runCode = async () => {
    if (!code.trim()) {
      setError("Please enter some code to run");
      return;
    }

    setIsRunning(true);
    setShowResults(true);
    setError(null);
    setExecutionResult(null);

    try {
      const response = await apiService.executeCode({
        code: code.trim(),
        language: language,
      });

      if (response.success && response.data) {
        setExecutionResult(response.data);
      } else {
        setError(response.message || "Failed to execute code");
      }
    } catch (err) {
      setError("Network error occurred while executing code");
      console.error("Code execution error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = () => {
    onSubmit(code, language);
  };

  const resetCode = () => {
    setCode(languageTemplates[language as keyof typeof languageTemplates]);
    setExecutionResult(null);
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
            {isRunning ? "Running..." : "Run Code"}
          </Button>
          <Button onClick={submitCode}>Submit Solution</Button>
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

      {/* Code Execution Results */}
      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Code Execution Results
              {isRunning && (
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isRunning ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  Executing your code...
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-400 p-4 bg-red-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            ) : executionResult ? (
              <div className="space-y-4">
                {/* Execution Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        executionResult.success ? "default" : "destructive"
                      }
                    >
                      {executionResult.success ? "SUCCESS" : "ERROR"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Language: {executionResult.language}
                    </span>
                  </div>
                  {executionResult.executionTime && (
                    <div className="text-sm text-muted-foreground">
                      {executionResult.executionTime.milliseconds.toFixed(2)}ms
                    </div>
                  )}
                </div>

                {/* Output */}
                <div>
                  <div className="font-medium text-muted-foreground mb-2">
                    Output:
                  </div>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    {executionResult.success
                      ? executionResult.output || "No output"
                      : executionResult.error || "Execution failed"}
                  </pre>
                </div>

                {/* Performance Info */}
                {executionResult.performance && (
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
                )}

                {/* Code Analysis */}
                {executionResult.analysis && (
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
                )}

                {/* Test Cases Comparison */}
                {testCases.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="font-medium text-muted-foreground mb-2">
                        Test Cases (Manual Verification):
                      </div>
                      <div className="space-y-3">
                        {testCases
                          .filter((tc) => !tc.isHidden)
                          .map((testCase, index) => (
                            <div
                              key={testCase.id}
                              className="border border-border rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">
                                  Test Case {index + 1}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  Manual Check
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <div className="font-medium text-muted-foreground mb-1">
                                    Input:
                                  </div>
                                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                                    {testCase.input}
                                  </pre>
                                </div>
                                <div>
                                  <div className="font-medium text-muted-foreground mb-1">
                                    Expected Output:
                                  </div>
                                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                                    {testCase.expectedOutput}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
