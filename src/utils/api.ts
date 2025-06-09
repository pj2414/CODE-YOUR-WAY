import config from '@/config/config';

class Api {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'An error occurred while processing your request'
      }));
      throw error;
    }

    return response.json();
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Problems
  async getProblems(page: number = 1, limit: number = 12): Promise<{
    problems: Problem[];
    currentPage: number;
    totalPages: number;
    totalProblems: number;
  }> {
    return this.get(`/api/problems?page=${page}&limit=${limit}`);
  }

  async getProblem(id: string) {
    return this.get(`/api/problems/${id}`);  // Changed to use /api prefix and correct path
  }

  async getProblemsByDifficulty(difficulty: string) {
    return this.request(`/problems/difficulty/${difficulty}`);
  }

  async getProblemsByTopic(topic: string) {
    return this.request(`/problems/topic/${topic}`);
  }

  // Submissions
  async submitCode(problemId: string, code: string, language: string) {
    // Add test case validation
    const response = await this.request('/submit', {
      method: 'POST',
      body: JSON.stringify({ 
        problemId, 
        code, 
        language,
        runType: 'submit' // Add runType to differentiate between run and submit
      }),
    });

    // Transform response to match SubmissionResult type
    return {
      ...response,
      result: {
        passed: response.result.passed,
        testResults: response.result.testResults.map((result: any) => ({
          input: result.input,
          expected: result.expected,
          output: result.output,
          pass: result.pass
        })),
        error: response.result.error
      }
    };
  }

  async runCode(problemId: string, code: string, language: string) {
    // Run against example test cases only
    return this.request('/submit', {
      method: 'POST', 
      body: JSON.stringify({ 
        problemId, 
        code, 
        language,
        runType: 'run' // Will only run example test cases
      }),
    });
  }

  async getSubmissions() {
    return this.request('/api/submissions');
  }

  async getSubmission(id: string) {
    return this.request(`/submissions/${id}`);
  }

  // Contests - Public API
  async getContests() {
    return this.request('/api/contests/all');
  }

  async joinContest(roomId: string) {
    return this.request('/api/contests/join', {
      method: 'POST',
      body: JSON.stringify({ roomId }),
    });
  }

  // Remove old submitContestSolution method and use this instead:
  async submitContestCode(contestId: string, problemId: string, code: string, language: string) {
    return this.request(`/api/contests/${contestId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ problemId, code, language }),
    });
  }

  async runContestCode(contestId: string, problemId: string, code: string, language: string) {
    return this.request(`/api/contests/${contestId}/run`, {
      method: 'POST',
      body: JSON.stringify({ problemId, code, language }),
    });
  }

  async getContestRankings(contestId: string) {
    // Always use .get so auth headers are sent
    return this.get(`/api/contests/${contestId}/rankings`);
  }

  async getContest(contestId: string) {
    // Always use .get so auth headers are sent
    return this.get(`/api/contests/${contestId}`);
  }

  async getContestSubmissions(contestId: string, userId?: string | null) {
    const url = `/api/contests/${contestId}/submissions${userId ? `?userId=${userId}` : ''}`;
    return this.get(url);
  }

  // Admin - Contest Management
  async getAdminContests() {
    return this.request('/api/admin/contests');
  }

  async createContest(contestData: any) {
    return this.request('/api/admin/contests/create', {
      method: 'POST',
      body: JSON.stringify(contestData),
    });
  }

  // Chatbot
  async sendChatMessage(problemId: string, userMessage: string, conversationHistory: any[] = []) {
    return this.request('/chatbot', {
      method: 'POST',
      body: JSON.stringify({ problemId, userMessage, conversationHistory }),
    });
  }

  async getChatHistory(problemId: string) {
    return this.request(`/chatbot/history/${problemId}`);
  }

  async clearChatHistory(problemId: string) {
    return this.request(`/chatbot/history/${problemId}`, {
      method: 'DELETE',
    });
  }

  // Discussion endpoints
  async getDiscussionThreads(problemId: string) {
    return this.request(`/api/problems/${problemId}/discussions`);
  }

  async createDiscussionThread(problemId: string, title: string, content: string) {
    return this.request(`/api/problems/${problemId}/discussions`, {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  }

  async getThreadWithPosts(threadId: string) {
    return this.request(`/api/discussions/${threadId}`);
  }

  async addPostToThread(threadId: string, content: string) {
    return this.request(`/api/discussions/${threadId}/posts`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Admin
  async createProblem(problemData: any) {
    return this.request('/problems', {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
  }

  async updateProblem(id: string, problemData: any) {
    return this.request(`/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(problemData),
    });
  }

  async deleteProblem(id: string) {
    return this.request(`/problems/${id}`, {
      method: 'DELETE',
    });
  }

  async getUsers() {
    return this.request('/users');
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async reloadProblems(count?: number) {
    return this.request('/admin/reload-problems', {
      method: 'POST',
      body: JSON.stringify({ count }),
    });
  }

  // Admin - Problems Management
  async getAdminProblems() {
    return this.request('/api/admin/problems');
  }

  // Admin - Users Management
  async getAdminUsers() {
    return this.request('/api/admin/users');
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/api/dashboard');
  }
}

export const api = new Api();