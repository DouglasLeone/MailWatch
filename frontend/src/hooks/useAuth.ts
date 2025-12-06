import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types/email';
import { authViewModel } from '@/viewmodels';

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(authViewModel.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authViewModel.getIsAuthenticated());
  const [isLoading, setIsLoading] = useState(authViewModel.getIsLoading());
  const [error, setError] = useState(authViewModel.getError());

  useEffect(() => {
    const unsubscribe = authViewModel.subscribe(() => {
      setUser(authViewModel.getUser());
      setIsAuthenticated(authViewModel.getIsAuthenticated());
      setIsLoading(authViewModel.getIsLoading());
      setError(authViewModel.getError());
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    return await authViewModel.login(email, password);
  }, []);

  const logout = useCallback(async () => {
    await authViewModel.logout();
    navigate('/login');
  }, [navigate]);

  return { user, isAuthenticated, isLoading, error, login, logout };
}
