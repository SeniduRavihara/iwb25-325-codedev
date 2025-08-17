"use client"

import { useState, useRef } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Play, RotateCcw, Download, Upload } from "lucide-react"
import type { TestCase } from "@/lib/mock-data"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted animate-pulse rounded-md" />,
})

interface CodeEditorProps {
  testCases: TestCase[]
  onSubmit: (code: string, language: string) => void
  initialCode?: string
  initialLanguage?: string
}

const languageTemplates = {
  java: `public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`,
  python: `def solution():
    # Your code here
    pass

if __name__ == "__main__":
    solution()`,
  ballerina: `import ballerina/io;

public function main() {
    // Your code here
    io:println("Hello, World!");
}`,
}

const languageExtensions = {
  java: "java",
  python: "python",
  ballerina: "bal",
}

export function CodeEditor({ testCases, onSubmit, initialCode, initialLanguage = "python" }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode || languageTemplates[initialLanguage as keyof typeof languageTemplates])
  const [language, setLanguage] = useState(initialLanguage)
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

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
    })

    monaco.editor.setTheme("hackathon-dark")
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    setCode(languageTemplates[newLanguage as keyof typeof languageTemplates])
    setResults([])
    setShowResults(false)
  }

  const runCode = async () => {
    setIsRunning(true)
    setShowResults(true)

    // Simulate code execution with test cases
    const mockResults = testCases
      .filter((tc) => !tc.isHidden)
      .map((testCase, index) => ({
        testCase: index + 1,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: testCase.expectedOutput, // Mock: assume correct for demo
        status: Math.random() > 0.3 ? "passed" : "failed", // Random pass/fail for demo
        executionTime: Math.floor(Math.random() * 100) + 10,
        memoryUsed: Math.floor(Math.random() * 50) + 20,
      }))

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setResults(mockResults)
    setIsRunning(false)
  }

  const submitCode = () => {
    onSubmit(code, language)
  }

  const resetCode = () => {
    setCode(languageTemplates[language as keyof typeof languageTemplates])
    setResults([])
    setShowResults(false)
  }

  const downloadCode = () => {
    const element = document.createElement("a")
    const file = new Blob([code], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `solution.${languageExtensions[language as keyof typeof languageExtensions]}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const uploadCode = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".java,.py,.bal,.txt"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setCode(content)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

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
            {isRunning ? "Running..." : "Run Tests"}
          </Button>
          <Button onClick={submitCode}>Submit Solution</Button>
        </div>
      </div>

      {/* Code Editor */}
      <Card>
        <CardContent className="p-0">
          <MonacoEditor
            height="500px"
            language={language === "ballerina" ? "javascript" : language} // Monaco doesn't have Ballerina, use JS for syntax
            value={code}
            onChange={(value) => setCode(value || "")}
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
                <div className="text-muted-foreground">Running your code against test cases...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Test Case {result.testCase}</span>
                        <Badge variant={result.status === "passed" ? "default" : "destructive"}>
                          {result.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.executionTime}ms • {result.memoryUsed}MB
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-muted-foreground mb-1">Input:</div>
                        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">{result.input}</pre>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground mb-1">Expected:</div>
                        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">{result.expectedOutput}</pre>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground mb-1">Your Output:</div>
                        <pre
                          className={`p-2 rounded text-xs overflow-x-auto ${
                            result.status === "passed" ? "bg-green-900/20" : "bg-red-900/20"
                          }`}
                        >
                          {result.actualOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {results.filter((r) => r.status === "passed").length} of {results.length} test cases passed
                  </div>
                  <div className="text-sm">
                    <span className="text-green-400">{results.filter((r) => r.status === "passed").length} Passed</span>
                    {" • "}
                    <span className="text-red-400">{results.filter((r) => r.status === "failed").length} Failed</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
