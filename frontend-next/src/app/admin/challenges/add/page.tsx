"use client";

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
import apiService from "@/lib/api";
import {
  BookOpen,
  Clock,
  Code,
  HardDrive,
  Plus,
  Save,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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

  const [functionTemplates, setFunctionTemplates] = useState<
    FunctionTemplate[]
  >([]);

  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: "1", input: "", expectedOutput: "", isHidden: false, points: 50 },
  ]);

  const [currentTemplate, setCurrentTemplate] = useState<FunctionTemplate>({
    language: "python",
    functionName: "",
    parameters: [],
    returnType: "",
    starterCode: "",
    executionTemplate: "",
  });

  // console.log("Current template: ", currentTemplate);
  console.log("Function templates: ", functionTemplates);

  const [newParameter, setNewParameter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const addParameter = () => {
    if (
      newParameter.trim() &&
      !currentTemplate.parameters.includes(newParameter.trim())
    ) {
      setCurrentTemplate({
        ...currentTemplate,
        parameters: [...currentTemplate.parameters, newParameter.trim()],
      });
      setNewParameter("");
    }
  };

  const removeParameter = (param: string) => {
    setCurrentTemplate({
      ...currentTemplate,
      parameters: currentTemplate.parameters.filter((p) => p !== param),
    });
  };

  const generateStarterCode = () => {
    const { language, functionName, parameters, returnType } = currentTemplate;
    let code = "";

    switch (language) {
      case "python":
        code = `def ${functionName}(${parameters.join(
          ", "
        )}):\n    # Write your solution here\n    pass`;
        break;
      case "javascript":
        code = `function ${functionName}(${parameters.join(
          ", "
        )}) {\n    // Write your solution here\n}`;
        break;
      case "java":
        code = `public ${returnType} ${functionName}(${parameters
          .map((p) => `int ${p}`)
          .join(", ")}) {\n    // Write your solution here\n    return 0;\n}`;
        break;
      case "cpp":
        code = `${returnType} ${functionName}(${parameters
          .map((p) => `vector<int>& ${p}`)
          .join(", ")}) {\n    // Write your solution here\n    return 0;\n}`;
        break;
    }

    setCurrentTemplate({ ...currentTemplate, starterCode: code });
  };

  const generateExecutionTemplate = () => {
    const { language, functionName, parameters } = currentTemplate;
    let template = "";

    switch (language) {
      case "python":
        if (parameters.length === 1) {
          template = `# Execution template
import json
import sys

${currentTemplate.starterCode}

# Test execution wrapper
input_line = sys.stdin.read().strip()
${parameters[0]} = json.loads(input_line)
result = ${functionName}(${parameters[0]})
print(result)`;
        } else {
          template = `# Execution template
import json
import sys

${currentTemplate.starterCode}

# Test execution wrapper
input_lines = sys.stdin.read().strip().split('\\n')
${parameters
  .map((param, i) => `${param} = json.loads(input_lines[${i}])`)
  .join("\n")}
result = ${functionName}(${parameters.join(", ")})
print(result)`;
        }
        break;
      case "javascript":
        template = `// Execution template
${currentTemplate.starterCode}

// Test execution wrapper
const input = require('fs').readFileSync(0, 'utf8').trim();
${
  parameters.length === 1
    ? `const ${parameters[0]} = JSON.parse(input);`
    : parameters
        .map(
          (param, i) => `const ${param} = JSON.parse(input.split('\\n')[${i}]);`
        )
        .join("\n")
}
const result = ${functionName}(${parameters.join(", ")});
console.log(result);`;
        break;
      case "java":
        template = `import java.util.*;

public class Main {
    ${currentTemplate.starterCode}
    
    public static void main(String[] args) {
        try {
            // Parse input array from string like "[1,2,3]"
            String input = "[1,2,3]"; // This will be replaced by actual input
            input = input.substring(1, input.length() - 1); // Remove [ and ]
            String[] parts = input.split(",");
            int[] ${parameters[0]} = new int[parts.length];
            for (int i = 0; i < parts.length; i++) {
                ${parameters[0]}[i] = Integer.parseInt(parts[i].trim());
            }
            
            int result = ${functionName}(${parameters[0]});
            System.out.println(result);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}`;
        break;
      case "ballerina":
        template = `import ballerina/io;

${currentTemplate.starterCode}

public function main() returns error? {
    // Simple test with hardcoded array
    int[] ${parameters[0]} = [1, 2, 3]; // This will be replaced by actual input
    int result = ${functionName}(${parameters[0]});
    io:println(result);
}`;
        break;
    }

    setCurrentTemplate({ ...currentTemplate, executionTemplate: template });
  };

  const addFunctionTemplate = () => {
    if (currentTemplate.functionName && currentTemplate.parameters.length > 0) {
      setFunctionTemplates([...functionTemplates, { ...currentTemplate }]);
      setCurrentTemplate({
        language: "python",
        functionName: "",
        parameters: [],
        returnType: "",
        starterCode: "",
        executionTemplate: "",
      });
    }
  };

  const removeFunctionTemplate = (index: number) => {
    setFunctionTemplates(functionTemplates.filter((_, i) => i !== index));
  };

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

  const submitFunctionTemplate = async (challengeId: number, token: string) => {
    if (!token) {
      setSubmitError("Authentication required. Please log in again.");
      return;
    }

    if (functionTemplates.length === 0) {
      setSubmitError("At least one function template is required");
      return;
    }

    try {
      // Prepare all templates for bulk creation
      const templates = functionTemplates.map((ft) => ({
        language: ft.language,
        function_name: ft.functionName,
        parameters: JSON.stringify(ft.parameters), // Convert array to JSON string
        return_type: ft.returnType,
        starter_code: ft.starterCode,
        execution_template: ft.executionTemplate,
      }));

      const bulkTemplatesData = {
        templates: templates,
      };

      const codeTemplateResponse = await apiService.createBulkCodeTemplates(
        challengeId,
        bulkTemplatesData,
        token
      );

      if (codeTemplateResponse.success) {
        console.log(`Successfully created ${templates.length} code templates`);
      } else {
        setSubmitError(
          codeTemplateResponse.message || "Failed to create code templates"
        );
      }
    } catch (error) {
      console.error("Error creating code templates:", error);
      setSubmitError("Network error occurred");
    }
  };

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
      if (functionTemplates.length === 0) {
        setSubmitError("At least one function template is required");
        return;
      }
      if (testCases.length === 0) {
        setSubmitError("At least one test case is required");
        return;
      }

      // Validate test cases
      for (const testCase of testCases) {
        if (!testCase.input.trim()) {
          setSubmitError("All test cases must have input");
          return;
        }
        if (!testCase.expectedOutput.trim()) {
          setSubmitError("All test cases must have expected output");
          return;
        }
      }

      console.log(JSON.stringify(functionTemplates));

      // Prepare challenge data for API
      const challengeData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        difficulty: formData.difficulty,
        tags: JSON.stringify(formData.tags),
        time_limit: formData.timeLimit * 60, // Convert minutes to seconds
        memory_limit: formData.memoryLimit,
        // function_templates: JSON.stringify(functionTemplates), // Add function templates
        // test_cases: JSON.stringify(testCases), // Add test cases
      };

      // Create challenge via API
      const response = await apiService.createChallenge(challengeData, token);

      if (response.success) {
        await submitFunctionTemplate(response.data.data.challenge_id, token);

        console.log(testCases);

        console.log("Challenge ID: ", response.data.data.challenge_id);

        // Link test cases to the challenge
        const linkResponse = await apiService.linkTestcasesToChallenge(
          response.data.data.challenge_id,
          testCases.map((tc) => ({
            input_data: tc.input,
            expected_output: tc.expectedOutput,
            is_hidden: tc.isHidden,
            points: tc.points,
          })),
          token
        );
        if (linkResponse.success) {
          console.log("Test cases linked to challenge");
          // router.push("/admin/challenges?success=true");
        } else {
          setSubmitError(
            linkResponse.message || "Failed to link challenges to contest"
          );
        }
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Add New Challenge
            </h1>
            <p className="text-muted-foreground mt-2">
              Create a new coding challenge with function templates and test
              cases
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/challenges">Cancel</Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-2 border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter challenge title"
                  className="border-2 border-border focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value: string) =>
                    setFormData({ ...formData, description: value })
                  }
                  placeholder="Enter challenge description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-medium">
                    Difficulty
                  </Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, difficulty: value })
                    }
                  >
                    <SelectTrigger className="border-2 border-border focus:border-primary">
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
                  <Label
                    htmlFor="timeLimit"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Time Limit (minutes)
                  </Label>
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
                    className="border-2 border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="memoryLimit"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <HardDrive className="h-4 w-4" />
                    Memory Limit (MB)
                  </Label>
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
                    className="border-2 border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.newTag}
                    onChange={(e) =>
                      setFormData({ ...formData, newTag: e.target.value })
                    }
                    placeholder="Add a tag"
                    className="border-2 border-border focus:border-primary"
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

          {/* Function Template Builder */}
          <Card className="border-2 border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Function Template Builder
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Define the function signature that users must implement
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Language</Label>
                  <Select
                    value={currentTemplate.language}
                    onValueChange={(value) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        language: value,
                      })
                    }
                  >
                    <SelectTrigger className="border-2 border-border focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Function Name</Label>
                  <Input
                    value={currentTemplate.functionName}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        functionName: e.target.value,
                      })
                    }
                    placeholder="max_subarray_sum"
                    className="border-2 border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Return Type</Label>
                  <Input
                    value={currentTemplate.returnType}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        returnType: e.target.value,
                      })
                    }
                    placeholder="int, List[int], etc."
                    className="border-2 border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Parameters</Label>
                <div className="flex gap-2">
                  <Input
                    value={newParameter}
                    onChange={(e) => setNewParameter(e.target.value)}
                    placeholder="nums, target, etc."
                    className="border-2 border-border focus:border-primary"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addParameter())
                    }
                  />
                  <Button type="button" onClick={addParameter} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentTemplate.parameters.map((param) => (
                    <Badge
                      key={param}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {param}
                      <button
                        type="button"
                        onClick={() => removeParameter(param)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={generateStarterCode}
                  variant="outline"
                >
                  Generate Starter Code
                </Button>
                <Button
                  type="button"
                  onClick={generateExecutionTemplate}
                  variant="outline"
                >
                  Generate Execution Template
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Starter Code (What users see)
                  </Label>
                  <Textarea
                    value={currentTemplate.starterCode}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        starterCode: e.target.value,
                      })
                    }
                    placeholder="def max_subarray_sum(nums):\n    # Write your solution here\n    pass"
                    rows={8}
                    className="font-mono text-sm border-2 border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Execution Template (Hidden from users)
                  </Label>
                  <Textarea
                    value={currentTemplate.executionTemplate}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        executionTemplate: e.target.value,
                      })
                    }
                    placeholder="Code that wraps user function with test case injection..."
                    rows={8}
                    className="font-mono text-sm border-2 border-border focus:border-primary"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={addFunctionTemplate}
                className="w-full"
                disabled={
                  !currentTemplate.functionName ||
                  currentTemplate.parameters.length === 0
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Function Template
              </Button>
            </CardContent>
          </Card>

          {/* Added Templates Display */}
          {functionTemplates.length > 0 && (
            <Card className="border-2 border-border shadow-lg">
              <CardHeader>
                <CardTitle>
                  Function Templates ({functionTemplates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {functionTemplates.map((template, index) => (
                    <div
                      key={index}
                      className="border-2 border-border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">
                            {template.language} - {template.functionName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Parameters: {template.parameters.join(", ")} |
                            Returns: {template.returnType}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFunctionTemplate(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="bg-muted p-3 rounded font-mono text-sm border border-border">
                        <pre>{template.starterCode}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Cases */}
          <Card className="border-2 border-border shadow-lg">
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
                <div
                  key={testCase.id}
                  className="border-2 border-border rounded-lg p-4"
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
                        className="rounded border-2 border-border"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Input (JSON format)
                      </Label>
                      <Textarea
                        value={testCase.input}
                        onChange={(e) =>
                          updateTestCase(testCase.id, "input", e.target.value)
                        }
                        placeholder="[-2,1,-3,4,-1,2,1,-5,4]"
                        rows={4}
                        className="font-mono border-2 border-border focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Expected Output
                      </Label>
                      <Textarea
                        value={testCase.expectedOutput}
                        onChange={(e) =>
                          updateTestCase(
                            testCase.id,
                            "expectedOutput",
                            e.target.value
                          )
                        }
                        placeholder="6"
                        rows={4}
                        className="font-mono border-2 border-border focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Points</Label>
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
                      className="w-24 border-2 border-border focus:border-primary"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Error Display */}
          {submitError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
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
