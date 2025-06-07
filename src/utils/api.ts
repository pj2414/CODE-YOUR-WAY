const API_BASE_URL = 'http://localhost:3000';

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
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
  async getProblems(page = 1, limit = 12) {
    return this.request(`/problems?page=${page}&limit=${limit}`);
  }

  async getProblem(id: string) {
    return this.request(`/problems/${id}`);
  }

  async getProblemsByDifficulty(difficulty: string) {
    return this.request(`/problems/difficulty/${difficulty}`);
  }

  async getProblemsByTopic(topic: string) {
    return this.request(`/problems/topic/${topic}`);
  }

  // Submissions
  async submitCode(problemId: string, code: string, language: string) {
    return this.post('/submit', { problemId, code, language });
  }

  async getSubmissions() {
    return this.request('/submissions');
  }

  async getSubmission(id: string) {
    return this.request(`/submissions/${id}`);
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

  async getDashboardStats() {
    const token = localStorage.getItem('token');
    return this.request('/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

export const api = new ApiClient();
