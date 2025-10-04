'use client';

import { Auth, onIdTokenChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { useAuth } from '../provider';

export const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(
      auth,
      (firebaseUser: User | null) => {
        setUser(firebaseUser);
        setIsLoading(false);
      },
      (error) => {
        console.error('Authentication error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return { data: user, isLoading };
};
