/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = "http://localhost:8080";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  is_admin: boolean;
  role: string;
  message: string;
}

// Code execution interfaces
export interface CodeExecutionRequest {
  code: string;
  language: string;
}

export interface CodeExecutionResponse {
  success: boolean;
  language?: string;
  output?: string;
  error?: string;
  executionTime?: {
    milliseconds: number;
    seconds: number;
  };
  performance?: {
    memoryLimit: string;
    cpuLimit: string;
    processLimit: number;
    networkAccess: boolean;
  };
  analysis?: {
    linesOfCode: number;
    codeLength: number;
    estimatedComplexity?: {
      timeComplexity: string;
      spaceComplexity: string;
      detectedPatterns: string[];
    };
    patterns?: string[];
  };
  exitCode?: number;
  timestamp?: string;
}

export interface LanguageInfo {
  name: string;
  version: string;
  fileExtension: string;
  example: string;
}

export interface LanguagesResponse {
  supportedLanguages: LanguageInfo[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  services: {
    docker: string;
    codeExecution: string;
  };
  systemInfo: {
    memoryLimit: string;
    timeoutLimit: string;
    supportedLanguages: string[];
  };
}

// Challenge interfaces
export interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  time_limit: number;
  memory_limit: number;
  author_id: number;
  submissions_count: number;
  success_rate: number;
  function_templates?: string; // JSON string of function templates
  test_cases?: string; // JSON string of test cases
  created_at: string;
  updated_at: string;
}

export interface Contest {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: string;
  max_participants: number;
  prizes: string; // JSON string from backend
  rules: string;
  created_by: number;
  registration_deadline: string;
  participants_count: number;
  created_at: string;
  updated_at: string;
}

export interface TestCase {
  id: number;
  challenge_id: number;
  input_data: string;
  expected_output: string;
  is_hidden: boolean;
  points: number;
  created_at: string;
}

// Create interfaces
export interface ChallengeCreate {
  title: string;
  description: string;
  difficulty: string;
  tags: string;
  time_limit: number;
  memory_limit: number;
  function_templates?: string; // JSON string of function templates
  test_cases?: string; // JSON string of test cases
}

export interface ContestCreate {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration: number;
  max_participants?: number;
  prizes: string;
  rules: string;
  registration_deadline: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Request failed",
          code: response.status,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        message: "Network error occurred",
        code: 500,
      };
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getProfile(token: string): Promise<ApiResponse<User>> {
    return this.request<User>("/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async healthCheck(): Promise<ApiResponse<string>> {
    return this.request<string>("/health");
  }

  // Code execution methods
  async executeCode(
    request: CodeExecutionRequest
  ): Promise<ApiResponse<CodeExecutionResponse>> {
    return this.request<CodeExecutionResponse>("/api/submit", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getCodeExecutionHealth(): Promise<ApiResponse<HealthResponse>> {
    return this.request<HealthResponse>("/api/health");
  }

  async getSupportedLanguages(): Promise<ApiResponse<LanguagesResponse>> {
    return this.request<LanguagesResponse>("/api/languages");
  }

  // Challenge methods
  async getChallenges(): Promise<ApiResponse<{ data: Challenge[] }>> {
    return this.request<{ data: Challenge[] }>("/challenges");
  }

  async getChallengesForContest(
    contestId: number
  ): Promise<ApiResponse<{ data: Challenge[] }>> {
    return this.request<{ data: Challenge[] }>(
      `/contests/${contestId}/challenges`
    );
  }

  async addChallengeToContest(
    contestId: number,
    challengeId: number,
    points: number,
    orderIndex: number,
    token: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(
      `/contests/${contestId}/challenges`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          challengeId,
          points,
          orderIndex,
        }),
      }
    );
  }

  async getAdminChallenges(
    token: string
  ): Promise<ApiResponse<{ data: Challenge[] }>> {
    return this.request<{ data: Challenge[] }>("/admin_challenges", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Contest methods
  async getContests(): Promise<ApiResponse<{ data: Contest[] }>> {
    return this.request<{ data: Contest[] }>("/contests");
  }

  async getAdminContests(
    token: string
  ): Promise<ApiResponse<{ data: Contest[] }>> {
    return this.request<{ data: Contest[] }>("/admin_contests", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Test case methods - removed duplicate, using the newer version below

  // Create methods
  async createChallenge(
    challengeData: ChallengeCreate,
    token: string
  ): Promise<ApiResponse<any>> {
    return this.request<any>("/challenges", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(challengeData),
    });
  }

  async createContest(
    contestData: ContestCreate,
    token: string
  ): Promise<ApiResponse<any>> {
    return this.request<any>("/contests", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(contestData),
    });
  }

  async linkChallengesToContest(
    contestId: number,
    challengeIds: number[],
    token: string
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/contests/${contestId}/link_challenges`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ challengeIds }),
    });
  }

  // Delete methods
  async deleteChallenge(
    challengeId: number,
    token: string
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/challenges/${challengeId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async deleteContest(
    contestId: number,
    token: string
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/contests/${contestId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Contest registration methods
  async registerForContest(
    contestId: number,
    token: string
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/contests/${contestId}/register`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async unregisterFromContest(
    contestId: number,
    token: string
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/contests/${contestId}/register`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async checkContestRegistration(
    contestId: number,
    token: string
  ): Promise<ApiResponse<{ data: { isRegistered: boolean } }>> {
    return this.request<{ data: { isRegistered: boolean } }>(
      `/contests/${contestId}/register`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  async updateContestStatus(contestId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/contests/${contestId}/update_status`, {
      method: "POST",
    });
  }

  async getContestStatus(
    contestId: number
  ): Promise<ApiResponse<{ data: { contestId: number; status: string } }>> {
    return this.request<{ data: { contestId: number; status: string } }>(
      `/contests/${contestId}/status`,
      {
        method: "GET",
      }
    );
  }

  async getTestCases(
    challengeId: number
  ): Promise<ApiResponse<{ data: TestCase[] }>> {
    return this.request<{ data: TestCase[] }>(
      `/challenges/${challengeId}/testcases`,
      {
        method: "GET",
      }
    );
  }

  async submitChallengeSolution(
    contestId: number,
    challengeId: number,
    code: string,
    language: string,
    token: string,
    results?: {
      passedTests: number;
      totalTests: number;
      successRate: number;
      score: number;
    }
  ): Promise<
    ApiResponse<{
      data: {
        passedTests: number;
        totalTests: number;
        successRate: number;
        score: number;
        message: string;
      };
    }>
  > {
    return this.request<{
      data: {
        passedTests: number;
        totalTests: number;
        successRate: number;
        score: number;
        message: string;
      };
    }>(`/contests/${contestId}/challenges/${challengeId}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code,
        language,
        token,
        ...(results && {
          passedTests: results.passedTests,
          totalTests: results.totalTests,
          successRate: results.successRate,
          score: results.score,
        }),
      }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
