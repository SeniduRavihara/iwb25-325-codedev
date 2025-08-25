"use client";

import { Navigation } from "@/components/navigation";
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
import { apiService, type Contest } from "@/lib/api";
import {
  Calendar,
  Clock,
  Filter,
  Plus,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  Trophy,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type SortField =
  | "title"
  | "start_time"
  | "duration"
  | "participants_count"
  | "status";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "upcoming" | "active" | "completed";
interface FilterState {
  search: string;
  status: StatusFilter;
  registrationStatus: "all" | "registered" | "not_registered";
}

interface SortState {
  field: SortField;
  order: SortOrder;
}

export default function ContestsPage() {
  const { isAuthenticated, user, token, isLoading } = useAuth();
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<
    Record<number, boolean>
  >({});
  const [registeringContest, setRegisteringContest] = useState<number | null>(
    null
  );

  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    registrationStatus: "all",
  });
  const [sort, setSort] = useState<SortState>({
    field: "start_time",
    order: "asc",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch contests from API and check registration status
  useEffect(() => {
    const fetchContests = async () => {
      // Wait for AuthContext to finish loading
      if (isLoading) {
        return;
      }

      if (!token || !isAuthenticated) {
        router.push("/login");
        return;
      }

      try {
        const response = await apiService.getContests();
        if (response.success && response.data && response.data.data) {
          setContests(response.data.data);

          // Check registration status for each contest
          if (token) {
            const statusPromises = response.data.data.map(
              async (contest: Contest) => {
                try {
                  const statusResponse =
                    await apiService.checkContestRegistration(
                      contest.id,
                      token
                    );
                  return {
                    contestId: contest.id,
                    isRegistered:
                      statusResponse.success &&
                      statusResponse.data?.data?.isRegistered,
                  };
                } catch (err) {
                  console.error(
                    `Error checking registration for contest ${contest.id}:`,
                    err
                  );
                  return { contestId: contest.id, isRegistered: false };
                }
              }
            );

            const statusResults = await Promise.all(statusPromises);
            const statusMap: Record<number, boolean> = {};
            statusResults.forEach((result) => {
              if (result) {
                statusMap[result.contestId] = result.isRegistered || false;
              }
            });
            setRegistrationStatus(statusMap);
          }
        } else {
          setError(response.message || "Failed to fetch contests");
        }
      } catch (err) {
        setError("Network error occurred");
        console.error("Error fetching contests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [token, isAuthenticated, isLoading, router]);

  // Filter and sort contests
  const filteredAndSortedContests = useMemo(() => {
    const filtered = contests.filter((contest) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          contest.title.toLowerCase().includes(searchLower) ||
          contest.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== "all") {
        if (contest.status !== filters.status) return false;
      }

      // Registration status filter
      if (filters.registrationStatus !== "all") {
        const isRegistered = registrationStatus[contest.id] || false;
        if (filters.registrationStatus === "registered" && !isRegistered)
          return false;
        if (filters.registrationStatus === "not_registered" && isRegistered)
          return false;
      }

      return true;
    });

    // Sort contests
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sort.field) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "start_time":
          aValue = new Date(a.start_time).getTime();
          bValue = new Date(b.start_time).getTime();
          break;
        case "duration":
          aValue = a.duration;
          bValue = b.duration;
          break;
        case "participants_count":
          aValue = a.participants_count;
          bValue = b.participants_count;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (sort.order === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [contests, filters, sort, registrationStatus]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "all",
      registrationStatus: "all",
    });
  }, []);

  // Toggle sort order
  const toggleSort = useCallback((field: SortField) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  }, []);

  // Show loading or redirect if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading contests...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "default";
      case "active":
        return "destructive";
      case "completed":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isContestFinished = (contest: Contest) => {
    const now = new Date().getTime();
    const endTime = new Date(contest.end_time).getTime();
    return now > endTime;
  };

  const handleRegisterForContest = async (contestId: number) => {
    if (!token) {
      alert("Authentication required");
      return;
    }

    setRegisteringContest(contestId);
    try {
      const response = await apiService.registerForContest(contestId, token);
      if (response.success) {
        setRegistrationStatus((prev) => ({ ...prev, [contestId]: true }));
        alert("Successfully registered for contest!");

        // Update the contest's participant count
        setContests((prev) =>
          prev.map((contest) =>
            contest.id === contestId
              ? {
                  ...contest,
                  participants_count: contest.participants_count + 1,
                }
              : contest
          )
        );
      } else {
        alert(response.message || "Failed to register for contest");
      }
    } catch (err) {
      console.error("Error registering for contest:", err);
      alert("Network error occurred");
    } finally {
      setRegisteringContest(null);
    }
  };

  const handleUnregisterFromContest = async (contestId: number) => {
    if (!token) {
      alert("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to unregister from this contest?")) {
      return;
    }

    setRegisteringContest(contestId);
    try {
      const response = await apiService.unregisterFromContest(contestId, token);
      if (response.success) {
        setRegistrationStatus((prev) => ({ ...prev, [contestId]: false }));
        alert("Successfully unregistered from contest");

        // Update the contest's participant count
        setContests((prev) =>
          prev.map((contest) =>
            contest.id === contestId
              ? {
                  ...contest,
                  participants_count: Math.max(
                    0,
                    contest.participants_count - 1
                  ),
                }
              : contest
          )
        );
      } else {
        alert(response.message || "Failed to unregister from contest");
      }
    } catch (err) {
      console.error("Error unregistering from contest:", err);
      alert("Network error occurred");
    } finally {
      setRegisteringContest(null);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) {
      return <SortAsc className="h-4 w-4 text-muted-foreground" />;
    }
    return sort.order === "asc" ? (
      <SortAsc className="h-4 w-4 text-primary" />
    ) : (
      <SortDesc className="h-4 w-4 text-primary" />
    );
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.registrationStatus !== "all";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contests</h1>
            <p className="text-muted-foreground mt-2">
              Participate in coding contests and compete with developers
              worldwide
            </p>
          </div>
          {/* Only show Create Contest button for admin users */}
          {user?.role === "admin" && (
            <Button asChild>
              <Link href="/admin/contests/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Contest
              </Link>
            </Button>
          )}
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contests by title or description..."
              className="pl-10 pr-10 border-2 border-border focus:border-primary"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter Toggle and Quick Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border-2 border-border hover:border-primary"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {
                    Object.values(filters).filter(
                      (v) => v !== "all" && v !== ""
                    ).length
                  }
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2 border-2 border-border hover:border-primary hover:bg-muted/50"
              >
                <RefreshCw className="h-4 w-4" />
                Clear All
              </Button>
            )}

            {/* Results count */}
            <div className="text-sm text-muted-foreground ml-auto">
              {filteredAndSortedContests.length} of {contests.length} contests
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border-2 border-border">
              <Select
                value={filters.status}
                onValueChange={(value: StatusFilter) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="border-2 border-border focus:border-primary">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.registrationStatus}
                onValueChange={(
                  value: "all" | "registered" | "not_registered"
                ) =>
                  setFilters((prev) => ({ ...prev, registrationStatus: value }))
                }
              >
                <SelectTrigger className="border-2 border-border focus:border-primary">
                  <SelectValue placeholder="Registration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contests</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="not_registered">Not Registered</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort by:</span>
                <div className="flex gap-1">
                  {(["title", "start_time"] as SortField[]).map((field) => (
                    <Button
                      key={field}
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort(field)}
                      className="h-8 px-2 border border-border hover:border-primary hover:bg-muted/50"
                    >
                      {getSortIcon(field)}
                      <span className="ml-1 text-xs capitalize">
                        {field.replace("_", " ")}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: &quot;{filters.search}&quot;
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, search: "" }))
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.status !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {filters.status}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, status: "all" }))
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.registrationStatus !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Registration: {filters.registrationStatus.replace("_", " ")}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      registrationStatus: "all",
                    }))
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}

        {/* No Results */}
        {filteredAndSortedContests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {hasActiveFilters ? (
                <>
                  <p className="text-lg font-medium mb-2">No contests found</p>
                  <p className="text-sm">
                    Try adjusting your filters or search terms
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">
                    No contests available
                  </p>
                  <p className="text-sm">Check back later for new contests</p>
                </>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-2 border-border hover:border-primary"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        {/* Contests Grid */}
        <div className="grid gap-6">
          {filteredAndSortedContests.map((contest) => (
            <Card
              key={contest.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">
                        {/* <Link
                          href={`/contests/${contest.id}`}
                          className="hover:text-primary transition-colors"
                        > */}
                        {contest.title}
                        {/* </Link> */}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={getStatusColor(contest.status)}>
                          {contest.status.charAt(0).toUpperCase() +
                            contest.status.slice(1)}
                        </Badge>
                        {isContestFinished(contest) &&
                          contest.status !== "completed" && (
                            <Badge
                              variant="secondary"
                              className="bg-red-100 text-red-800"
                            >
                              Finished
                            </Badge>
                          )}
                        {registrationStatus[contest.id] && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Registered
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="mb-3">
                      {contest.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {/* Only show Edit button for admin users */}
                    {user?.role === "admin" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/contests/${contest.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    )}
                    {/* Show "View Results" button if contest is finished (time expired) */}
                    {isContestFinished(contest) ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/contests/${contest.id}/results`}>
                          View Results
                        </Link>
                      </Button>
                    ) : (
                      <>
                        {/* Show registration/join buttons only if contest is not finished */}
                        {contest.status === "upcoming" &&
                          (registrationStatus[contest.id] ? (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleUnregisterFromContest(contest.id)
                                }
                                disabled={registeringContest === contest.id}
                              >
                                {registeringContest === contest.id ? (
                                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  "Unregister"
                                )}
                              </Button>
                              <Button size="sm" asChild>
                                <Link href={`/contests/${contest.id}`}>
                                  Join
                                </Link>
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleRegisterForContest(contest.id)
                              }
                              disabled={registeringContest === contest.id}
                            >
                              {registeringContest === contest.id ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                "Register"
                              )}
                            </Button>
                          ))}
                        {contest.status === "active" && (
                          <Button size="sm" asChild>
                            <Link href={`/contests/${contest.id}/participate`}>
                              Join Now
                            </Link>
                          </Button>
                        )}
                        {contest.status === "completed" && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/contests/${contest.id}/results`}>
                              View Results
                            </Link>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Start Time</div>
                      <div>{formatDateTime(contest.start_time)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Duration</div>
                      <div>
                        {Math.floor(contest.duration / 60)}h{" "}
                        {contest.duration % 60}m
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Participants</div>
                      <div>
                        {contest.participants_count}
                        {contest.max_participants
                          ? `/${contest.max_participants}`
                          : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Problems</div>
                      <div>
                        {/* TODO: Get challenge count from contest_challenges table */}
                        <span className="text-muted-foreground">N/A</span>
                      </div>
                    </div>
                  </div>
                </div>

                {contest.prizes && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Prizes:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          const prizesArray = JSON.parse(contest.prizes);
                          return prizesArray.map(
                            (prize: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {prize}
                              </Badge>
                            )
                          );
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        } catch (error) {
                          return (
                            <span className="text-muted-foreground text-xs">
                              No prizes
                            </span>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
