import { User, Expense } from './types';

// API endpoints for data access
export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    me: '/api/auth/me',
  },
  
  // Data endpoints
  users: '/api/users',
  expenses: '/api/expenses',
};

// Type-safe data access functions
export class DataAPI {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Auth methods
  static async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(data: { name: string; email: string; password: string }) {
    return this.request<{ user: User; token: string }>(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async logout() {
    return this.request(API_ENDPOINTS.auth.logout, { method: 'POST' });
  }

  static async getMe(): Promise<User> {
    return this.request<User>(API_ENDPOINTS.auth.me);
  }

  // User methods
  static async getUsers(): Promise<User[]> {
    return this.request<User[]>(API_ENDPOINTS.users);
  }

  static async getUser(id: string): Promise<User> {
    return this.request<User>(`${API_ENDPOINTS.users}/${id}`);
  }

  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.request<User>(API_ENDPOINTS.users, {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return this.request<User>(`${API_ENDPOINTS.users}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteUser(id: string): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.users}/${id}`, {
      method: 'DELETE',
    });
  }

  // Expense methods
  static async getExpenses(): Promise<Expense[]> {
    return this.request<Expense[]>(API_ENDPOINTS.expenses);
  }

  static async getExpense(id: string): Promise<Expense> {
    return this.request<Expense>(`${API_ENDPOINTS.expenses}/${id}`);
  }

  static async createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    return this.request<Expense>(API_ENDPOINTS.expenses, {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  static async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    return this.request<Expense>(`${API_ENDPOINTS.expenses}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteExpense(id: string): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.expenses}/${id}`, {
      method: 'DELETE',
    });
  }
}
