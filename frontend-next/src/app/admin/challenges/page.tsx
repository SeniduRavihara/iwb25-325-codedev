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
import {
  Clock,
  Code,
  Edit,
  Eye,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";

// Mock challenges data
const mockChallenges = [
  {
    id: "1",
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "easy",
    category: "arrays",
    language: "python",
    timeLimit: 1000,
    memoryLimit: 128,
    submissions: 1250,
    successRate: 85,
    tags: ["arrays", "hash-table", "two-pointers"],
  },
  {
    id: "2",
    title: "Longest Substring Without Repeating Characters",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    difficulty: "medium",
    category: "strings",
    language: "javascript",
    timeLimit: 2000,
    memoryLimit: 256,
    submissions: 890,
    successRate: 72,
    tags: ["strings", "sliding-window", "hash-table"],
  },
  {
    id: "3",
    title: "Binary Tree Inorder Traversal",
    description:
      "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    difficulty: "easy",
    category: "trees",
    language: "java",
    timeLimit: 1000,
    memoryLimit: 128,
    submissions: 567,
    successRate: 91,
    tags: ["trees", "recursion", "stack"],
  },
  {
    id: "4",
    title: "Merge k Sorted Lists",
    description:
      "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.",
    difficulty: "hard",
    category: "linked-lists",
    language: "cpp",
    timeLimit: 5000,
    memoryLimit: 512,
    submissions: 234,
    successRate: 45,
    tags: ["linked-lists", "divide-and-conquer", "heap"],
  },
];

export default function AdminChallengesPage() {
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
          <Input placeholder="Search challenges..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
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

      {/* Challenges Grid */}
      <div className="grid gap-6">
        {mockChallenges.map((challenge) => (
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
                    <Badge variant={getDifficultyBadge(challenge.difficulty)}>
                      {challenge.difficulty.charAt(0).toUpperCase() +
                        challenge.difficulty.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription className="mb-3">
                    {challenge.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2">
                    {challenge.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
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
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Code className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Language</div>
                    <div className="capitalize">{challenge.language}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Time Limit</div>
                    <div>{challenge.timeLimit}ms</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Submissions</div>
                    <div>{challenge.submissions}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Success Rate</div>
                    <div>{challenge.successRate}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
