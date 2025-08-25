"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, type Challenge } from "@/lib/api";
import {
  Clock,
  Edit,
  Eye,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function AdminChallengesPage() {
  const { token } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingChallenge, setDeletingChallenge] = useState<number | null>(
    null
  );

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!token) {
        setError("No authentication token");
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.getAdminChallenges(token);
        if (response.success && response.data && response.data.data) {
          console.log("Challenge Response: ", response.data.data);
          setChallenges(response.data.data);
        } else {
          setError(response.message || "Failed to fetch challenges");
        }
      } catch (err) {
        setError("Network error occurred");
        console.error("Error fetching challenges:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [token]);

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

  // Filter and sort challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          challenge.title.toLowerCase().includes(searchLower) ||
          challenge.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Difficulty filter
      if (difficultyFilter !== "all") {
        if (challenge.difficulty !== difficultyFilter) return false;
      }

      // Category filter (check tags)
      if (categoryFilter !== "all") {
        try {
          const tagsArray = JSON.parse(challenge.tags);
          const hasCategory = tagsArray.some((tag: string) =>
            tag.toLowerCase().includes(categoryFilter.toLowerCase())
          );
          if (!hasCategory) return false;
        } catch (error) {
          return false;
        }
      }

      return true;
    });
  }, [challenges, searchTerm, difficultyFilter, categoryFilter]);

  const handleDeleteChallenge = async (challengeId: number) => {
    if (!token) {
      alert("Authentication required");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${
          challenges.find((c) => c.id === challengeId)?.title
        }"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingChallenge(challengeId);
    try {
      const response = await apiService.deleteChallenge(challengeId, token);
      if (response.success) {
        setChallenges(challenges.filter((c) => c.id !== challengeId));
        alert("Challenge deleted successfully");
      } else {
        alert(response.message || "Failed to delete challenge");
      }
    } catch (err) {
      console.error("Error deleting challenge:", err);
      alert("Network error occurred");
    } finally {
      setDeletingChallenge(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Manage Challenges
          </h1>
          <p className="text-muted-foreground mt-2">
            Create, edit, and manage all coding challenges
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/challenges/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Challenge
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search challenges..."
            className="pl-10 border-2 border-border focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-[180px] border-2 border-border focus:border-primary">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px] border-2 border-border focus:border-primary">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="arrays">Arrays</SelectItem>
            <SelectItem value="strings">Strings</SelectItem>
            <SelectItem value="trees">Trees</SelectItem>
            <SelectItem value="linked-lists">Linked Lists</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground mb-4">
        {filteredChallenges.length} of {challenges.length} challenges
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading challenges...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <div className="text-red-500">Error: {error}</div>
        </div>
      )}

      {/* Challenges Grid */}
      {!loading && !error && (
        <div className="grid gap-6">
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <p className="text-lg font-medium mb-2">No challenges found</p>
                <p className="text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </div>
          ) : (
            filteredChallenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          <Link
                            href={`/admin/challenges/${challenge.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {challenge.title}
                          </Link>
                        </CardTitle>
                        <Badge
                          variant={getDifficultyBadge(challenge.difficulty)}
                        >
                          {challenge.difficulty.charAt(0).toUpperCase() +
                            challenge.difficulty.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="mb-3">
                        {challenge.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          try {
                            const tagsArray = JSON.parse(challenge.tags);
                            return tagsArray.map(
                              (tag: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              )
                            );
                          } catch (error) {
                            return (
                              <span className="text-muted-foreground text-xs">
                                No tags
                              </span>
                            );
                          }
                        })()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/challenges/${challenge.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/challenges/${challenge.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteChallenge(challenge.id)}
                        disabled={deletingChallenge === challenge.id}
                      >
                        {deletingChallenge === challenge.id ? (
                          <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Time Limit</div>
                        <div>{challenge.time_limit}ms</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Submissions</div>
                        <div>{challenge.submissions_count}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Success Rate</div>
                        <div>{Math.round(challenge.success_rate * 100)}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
