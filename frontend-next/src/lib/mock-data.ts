export interface Challenge {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  tags: string[]
  timeLimit: number // in minutes
  memoryLimit: number // in MB
  testCases: TestCase[]
  createdAt: string
  updatedAt: string
  author: string
  submissions: number
  successRate: number
}

export interface TestCase {
  id: string
  input: string
  expectedOutput: string
  isHidden: boolean
  points: number
}

export const mockChallenges: Challenge[] = [
  {
    id: "1",
    title: "Two Sum",
    description: `<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.</p>
    <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
    <p>You can return the answer in any order.</p>
    <h3>Example 1:</h3>
    <pre><code>Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</code></pre>`,
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    timeLimit: 30,
    memoryLimit: 256,
    testCases: [
      {
        id: "1",
        input: "[2,7,11,15]\n9",
        expectedOutput: "[0,1]",
        isHidden: false,
        points: 25,
      },
      {
        id: "2",
        input: "[3,2,4]\n6",
        expectedOutput: "[1,2]",
        isHidden: false,
        points: 25,
      },
      {
        id: "3",
        input: "[3,3]\n6",
        expectedOutput: "[0,1]",
        isHidden: true,
        points: 50,
      },
    ],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
    author: "Admin",
    submissions: 1250,
    successRate: 85,
  },
  {
    id: "2",
    title: "Binary Tree Traversal",
    description: `<p>Given the <code>root</code> of a binary tree, return the inorder traversal of its nodes' values.</p>
    <h3>Example:</h3>
    <pre><code>Input: root = [1,null,2,3]
Output: [1,3,2]</code></pre>`,
    difficulty: "Medium",
    tags: ["Tree", "Depth-First Search", "Binary Tree"],
    timeLimit: 45,
    memoryLimit: 512,
    testCases: [
      {
        id: "1",
        input: "[1,null,2,3]",
        expectedOutput: "[1,3,2]",
        isHidden: false,
        points: 50,
      },
      {
        id: "2",
        input: "[]",
        expectedOutput: "[]",
        isHidden: true,
        points: 50,
      },
    ],
    createdAt: "2024-01-14",
    updatedAt: "2024-01-14",
    author: "Admin",
    submissions: 890,
    successRate: 72,
  },
  {
    id: "3",
    title: "Maximum Subarray",
    description: `<p>Given an integer array <code>nums</code>, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.</p>
    <h3>Example:</h3>
    <pre><code>Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.</code></pre>`,
    difficulty: "Hard",
    tags: ["Array", "Dynamic Programming"],
    timeLimit: 60,
    memoryLimit: 512,
    testCases: [
      {
        id: "1",
        input: "[-2,1,-3,4,-1,2,1,-5,4]",
        expectedOutput: "6",
        isHidden: false,
        points: 30,
      },
      {
        id: "2",
        input: "[1]",
        expectedOutput: "1",
        isHidden: false,
        points: 20,
      },
      {
        id: "3",
        input: "[5,4,-1,7,8]",
        expectedOutput: "23",
        isHidden: true,
        points: 50,
      },
    ],
    createdAt: "2024-01-13",
    updatedAt: "2024-01-13",
    author: "Admin",
    submissions: 654,
    successRate: 58,
  },
]

export interface Contest {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  duration: number // in minutes
  status: "upcoming" | "active" | "completed"
  challenges: string[] // challenge IDs
  participants: number
  maxParticipants?: number
  prizes: string[]
  rules: string
  createdBy: string
  createdAt: string
  registrationDeadline: string
}

export interface ContestParticipant {
  id: string
  contestId: string
  userId: string
  username: string
  score: number
  rank: number
  submissions: number
  lastSubmissionTime: string
}

export const mockContests: Contest[] = [
  {
    id: "1",
    title: "Weekly Coding Challenge #1",
    description:
      "Test your algorithmic skills with a mix of easy to medium problems. Perfect for beginners and intermediate programmers.",
    startTime: "2024-01-20T10:00:00Z",
    endTime: "2024-01-20T13:00:00Z",
    duration: 180,
    status: "upcoming",
    challenges: ["1", "2"],
    participants: 45,
    maxParticipants: 100,
    prizes: ["$500 First Place", "$300 Second Place", "$200 Third Place"],
    rules: `<h3>Contest Rules:</h3>
    <ul>
      <li>Contest duration is 3 hours</li>
      <li>You can submit multiple times for each problem</li>
      <li>Only your best submission counts</li>
      <li>Plagiarism will result in disqualification</li>
      <li>Use of external libraries is not allowed</li>
    </ul>`,
    createdBy: "Admin",
    createdAt: "2024-01-15",
    registrationDeadline: "2024-01-20T09:00:00Z",
  },
  {
    id: "2",
    title: "Advanced Algorithms Contest",
    description: "Challenge yourself with complex algorithmic problems. Recommended for experienced programmers.",
    startTime: "2024-01-18T14:00:00Z",
    endTime: "2024-01-18T18:00:00Z",
    duration: 240,
    status: "active",
    challenges: ["2", "3"],
    participants: 28,
    maxParticipants: 50,
    prizes: ["$1000 First Place", "$600 Second Place", "$400 Third Place"],
    rules: `<h3>Contest Rules:</h3>
    <ul>
      <li>Contest duration is 4 hours</li>
      <li>Partial scoring available</li>
      <li>Time penalty for wrong submissions</li>
      <li>No external help allowed</li>
    </ul>`,
    createdBy: "Admin",
    createdAt: "2024-01-10",
    registrationDeadline: "2024-01-18T13:00:00Z",
  },
  {
    id: "3",
    title: "Beginner Friendly Contest",
    description: "Perfect for newcomers to competitive programming. Focus on basic algorithms and data structures.",
    startTime: "2024-01-15T16:00:00Z",
    endTime: "2024-01-15T18:00:00Z",
    duration: 120,
    status: "completed",
    challenges: ["1"],
    participants: 67,
    maxParticipants: 100,
    prizes: ["Certificate of Achievement", "CodeArena Swag", "Premium Account"],
    rules: `<h3>Contest Rules:</h3>
    <ul>
      <li>Contest duration is 2 hours</li>
      <li>Beginner friendly problems only</li>
      <li>Educational focus over competition</li>
      <li>Help available in contest chat</li>
    </ul>`,
    createdBy: "Admin",
    createdAt: "2024-01-08",
    registrationDeadline: "2024-01-15T15:00:00Z",
  },
]

export const mockContestParticipants: ContestParticipant[] = [
  {
    id: "1",
    contestId: "2",
    userId: "user1",
    username: "coder_pro",
    score: 850,
    rank: 1,
    submissions: 5,
    lastSubmissionTime: "2024-01-18T16:30:00Z",
  },
  {
    id: "2",
    contestId: "2",
    userId: "user2",
    username: "algo_master",
    score: 720,
    rank: 2,
    submissions: 8,
    lastSubmissionTime: "2024-01-18T17:15:00Z",
  },
  {
    id: "3",
    contestId: "2",
    userId: "user3",
    username: "dev_ninja",
    score: 680,
    rank: 3,
    submissions: 6,
    lastSubmissionTime: "2024-01-18T16:45:00Z",
  },
]

export interface GlobalUser {
  id: string
  username: string
  email: string
  totalScore: number
  globalRank: number
  challengesSolved: number
  contestsParticipated: number
  averageScore: number
  preferredLanguage: string
  joinDate: string
  lastActive: string
  badges: string[]
}

export interface AnalyticsData {
  totalUsers: number
  totalChallenges: number
  totalContests: number
  totalSubmissions: number
  averageSuccessRate: number
  popularLanguages: { language: string; percentage: number }[]
  challengesByDifficulty: { difficulty: string; count: number }[]
  submissionsOverTime: { date: string; submissions: number }[]
  topPerformers: GlobalUser[]
}

export const mockGlobalUsers: GlobalUser[] = [
  {
    id: "user1",
    username: "coder_pro",
    email: "coder@example.com",
    totalScore: 2450,
    globalRank: 1,
    challengesSolved: 45,
    contestsParticipated: 12,
    averageScore: 204,
    preferredLanguage: "Python",
    joinDate: "2023-08-15",
    lastActive: "2024-01-18T17:30:00Z",
    badges: ["Contest Winner", "Problem Solver", "Speed Demon"],
  },
  {
    id: "user2",
    username: "algo_master",
    email: "algo@example.com",
    totalScore: 2280,
    globalRank: 2,
    challengesSolved: 38,
    contestsParticipated: 10,
    averageScore: 228,
    preferredLanguage: "Java",
    joinDate: "2023-09-02",
    lastActive: "2024-01-18T16:45:00Z",
    badges: ["Algorithm Expert", "Consistent Performer"],
  },
  {
    id: "user3",
    username: "dev_ninja",
    email: "ninja@example.com",
    totalScore: 2150,
    globalRank: 3,
    challengesSolved: 42,
    contestsParticipated: 8,
    averageScore: 269,
    preferredLanguage: "Python",
    joinDate: "2023-07-20",
    lastActive: "2024-01-18T15:20:00Z",
    badges: ["Code Ninja", "Problem Solver"],
  },
  {
    id: "user4",
    username: "byte_warrior",
    email: "warrior@example.com",
    totalScore: 1980,
    globalRank: 4,
    challengesSolved: 35,
    contestsParticipated: 9,
    averageScore: 220,
    preferredLanguage: "Java",
    joinDate: "2023-10-10",
    lastActive: "2024-01-17T20:15:00Z",
    badges: ["Rising Star", "Dedicated Coder"],
  },
  {
    id: "user5",
    username: "script_sage",
    email: "sage@example.com",
    totalScore: 1850,
    globalRank: 5,
    challengesSolved: 31,
    contestsParticipated: 7,
    averageScore: 264,
    preferredLanguage: "Ballerina",
    joinDate: "2023-11-05",
    lastActive: "2024-01-17T18:30:00Z",
    badges: ["Language Explorer", "Creative Solver"],
  },
]

export const mockAnalyticsData: AnalyticsData = {
  totalUsers: 1247,
  totalChallenges: 156,
  totalContests: 23,
  totalSubmissions: 8934,
  averageSuccessRate: 72.5,
  popularLanguages: [
    { language: "Python", percentage: 45 },
    { language: "Java", percentage: 35 },
    { language: "Ballerina", percentage: 20 },
  ],
  challengesByDifficulty: [
    { difficulty: "Easy", count: 65 },
    { difficulty: "Medium", count: 58 },
    { difficulty: "Hard", count: 33 },
  ],
  submissionsOverTime: [
    { date: "2024-01-10", submissions: 245 },
    { date: "2024-01-11", submissions: 312 },
    { date: "2024-01-12", submissions: 289 },
    { date: "2024-01-13", submissions: 356 },
    { date: "2024-01-14", submissions: 423 },
    { date: "2024-01-15", submissions: 398 },
    { date: "2024-01-16", submissions: 445 },
    { date: "2024-01-17", submissions: 512 },
    { date: "2024-01-18", submissions: 478 },
  ],
  topPerformers: mockGlobalUsers.slice(0, 10),
}
