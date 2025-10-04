'use client';

import { useState, useEffect } from 'react';
import { DataAPI } from '@/lib/data-api';
import { User, Expense } from '@/lib/types';

// Custom hooks that replace Firebase hooks with MySQL-based ones

export function useCollection<T>(endpoint: string | null, dependencies: any[] = []) {
  const [data, setData] = useState<((T & { id: string }) | null)[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!endpoint) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await DataAPI.request<T[]>(endpoint);
        setData(result as ((T & { id: string }) | null)[] | null);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [endpoint, ...dependencies]);

  return { data, isLoading };
}

export function useDoc<T>(endpoint: string | null, dependencies: any[] = []) {
  const [data, setData] = useState<((T & { id: string }) | null) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!endpoint) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await DataAPI.request<T>(endpoint);
        setData(result as ((T & { id: string }) | null) | null);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [endpoint, ...dependencies]);

  return { data, isLoading };
}

// Specific hooks for common data types
export function useUsers() {
  return useCollection<User>('/api/users');
}

export function useExpenses() {
  return useCollection<Expense>('/api/expenses');
}

export function useUser(id: string | null) {
  return useDoc<User>(id ? `/api/users/${id}` : null);
}

export function useExpense(id: string | null) {
  return useDoc<Expense>(id ? `/api/expenses/${id}` : null);
}
