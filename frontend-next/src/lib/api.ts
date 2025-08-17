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
}

export const apiService = new ApiService();
export default apiService;
