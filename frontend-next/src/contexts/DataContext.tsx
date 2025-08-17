"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export interface Contest {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  participants: number;
  maxParticipants: number;
  createdBy: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  points: number;
  contestId?: string;
  createdBy: string;
  createdAt: string;
}

interface DataContextType {
  contests: Contest[];
  challenges: Challenge[];
  isLoading: boolean;
  error: string | null;
  fetchContests: () => Promise<void>;
  fetchChallenges: () => Promise<void>;
  createContest: (
    contest: Omit<Contest, "id" | "createdAt">
  ) => Promise<{ success: boolean; message: string }>;
  createChallenge: (
    challenge: Omit<Challenge, "id" | "createdAt">
  ) => Promise<{ success: boolean; message: string }>;
  updateContest: (
    id: string,
    updates: Partial<Contest>
  ) => Promise<{ success: boolean; message: string }>;
  updateChallenge: (
    id: string,
    updates: Partial<Challenge>
  ) => Promise<{ success: boolean; message: string }>;
  deleteContest: (id: string) => Promise<{ success: boolean; message: string }>;
  deleteChallenge: (
    id: string
  ) => Promise<{ success: boolean; message: string }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Mock data for development
  const mockContests: Contest[] = [
    {
      id: "1",
      title: "Spring Coding Challenge 2024",
      description:
        "A comprehensive coding challenge covering algorithms, data structures, and system design.",
      startDate: "2024-03-01T00:00:00Z",
      endDate: "2024-03-31T23:59:59Z",
      status: "upcoming",
      participants: 45,
      maxParticipants: 100,
      createdBy: "admin@codearena.com",
      createdAt: "2024-02-15T10:00:00Z",
    },
    {
      id: "2",
      title: "Web Development Hackathon",
      description:
        "Build innovative web applications using modern technologies.",
      startDate: "2024-02-01T00:00:00Z",
      endDate: "2024-02-28T23:59:59Z",
      status: "active",
      participants: 78,
      maxParticipants: 150,
      createdBy: "admin@codearena.com",
      createdAt: "2024-01-15T10:00:00Z",
    },
  ];

  const mockChallenges: Challenge[] = [
    {
      id: "1",
      title: "Two Sum",
      description:
        "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      difficulty: "easy",
      category: "algorithms",
      points: 10,
      createdBy: "admin@codearena.com",
      createdAt: "2024-02-15T10:00:00Z",
    },
    {
      id: "2",
      title: "Valid Parentheses",
      description:
        'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
      difficulty: "medium",
      category: "data-structures",
      points: 15,
      createdBy: "admin@codearena.com",
      createdAt: "2024-02-15T10:00:00Z",
    },
    {
      id: "3",
      title: "Build a REST API",
      description:
        "Create a RESTful API with proper authentication, validation, and error handling.",
      difficulty: "hard",
      category: "backend",
      points: 25,
      createdBy: "admin@codearena.com",
      createdAt: "2024-02-15T10:00:00Z",
    },
  ];

  const fetchContests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // For now, use mock data. Replace with actual API call when backend is ready
      // const response = await fetch('http://localhost:8080/contests', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // })
      // const data = await response.json()
      // setContests(data)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setContests(mockContests);
    } catch (error) {
      console.error("Error fetching contests:", error);
      setError("Failed to fetch contests");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChallenges = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // For now, use mock data. Replace with actual API call when backend is ready
      // const response = await fetch('http://localhost:8080/challenges', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // })
      // const data = await response.json()
      // setChallenges(data)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setChallenges(mockChallenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      setError("Failed to fetch challenges");
    } finally {
      setIsLoading(false);
    }
  };

  const createContest = async (
    contest: Omit<Contest, "id" | "createdAt">
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const newContest: Contest = {
        ...contest,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setContests((prev) => [...prev, newContest]);
      return { success: true, message: "Contest created successfully" };
    } catch (error) {
      console.error("Error creating contest:", error);
      return { success: false, message: "Failed to create contest" };
    }
  };

  const createChallenge = async (
    challenge: Omit<Challenge, "id" | "createdAt">
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const newChallenge: Challenge = {
        ...challenge,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setChallenges((prev) => [...prev, newChallenge]);
      return { success: true, message: "Challenge created successfully" };
    } catch (error) {
      console.error("Error creating challenge:", error);
      return { success: false, message: "Failed to create challenge" };
    }
  };

  const updateContest = async (
    id: string,
    updates: Partial<Contest>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setContests((prev) =>
        prev.map((contest) =>
          contest.id === id ? { ...contest, ...updates } : contest
        )
      );
      return { success: true, message: "Contest updated successfully" };
    } catch (error) {
      console.error("Error updating contest:", error);
      return { success: false, message: "Failed to update contest" };
    }
  };

  const updateChallenge = async (
    id: string,
    updates: Partial<Challenge>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setChallenges((prev) =>
        prev.map((challenge) =>
          challenge.id === id ? { ...challenge, ...updates } : challenge
        )
      );
      return { success: true, message: "Challenge updated successfully" };
    } catch (error) {
      console.error("Error updating challenge:", error);
      return { success: false, message: "Failed to update challenge" };
    }
  };

  const deleteContest = async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setContests((prev) => prev.filter((contest) => contest.id !== id));
      return { success: true, message: "Contest deleted successfully" };
    } catch (error) {
      console.error("Error deleting contest:", error);
      return { success: false, message: "Failed to delete contest" };
    }
  };

  const deleteChallenge = async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setChallenges((prev) => prev.filter((challenge) => challenge.id !== id));
      return { success: true, message: "Challenge deleted successfully" };
    } catch (error) {
      console.error("Error deleting challenge:", error);
      return { success: false, message: "Failed to delete challenge" };
    }
  };

  // Load initial data
  useEffect(() => {
    if (token) {
      fetchContests();
      fetchChallenges();
    }
  }, [token]);

  const value: DataContextType = {
    contests,
    challenges,
    isLoading,
    error,
    fetchContests,
    fetchChallenges,
    createContest,
    createChallenge,
    updateContest,
    updateChallenge,
    deleteContest,
    deleteChallenge,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
