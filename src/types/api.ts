export interface Problem {
  _id: string;
  title: string;
  problemStatement: string;
  background?: string;
  task: string;
  approachHint?: string;
  notes?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  hint?: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  inputFormat: string;
  outputFormat: string;
  codeforcesId?: string;
  rating?: number;
  createdAt: string;
}

export interface TestCase {
  input: string;
  expected: string;
  output?: string;
  pass?: boolean;
}

export interface SubmissionResult {
  passed: boolean;
  testResults: TestCase[];
  error?: string;
}

export interface Submission {
  _id: string;
  userId: string;
  problemId: Problem;
  code: string;
  language: string;
  result: SubmissionResult;
  timestamp: string;
}

export interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AdminStats {
  totalProblems: number;
  problemsByDifficulty: Array<{ _id: string; count: number }>;
  topTopics: Array<{ _id: string; count: number }>;
  totalUsers: number;
  totalSubmissions: number;
}

export interface DiscussionThread {
  _id: string;
  problemId: string;
  userId: {
    _id: string;
    email: string;
  };
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionPost {
  _id: string;
  threadId: string;
  userId: {
    _id: string;
    email: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadWithPosts {
  thread: DiscussionThread;
  posts: DiscussionPost[];
}

async getSubmissions() {
  return this.get('/submissions', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
}
