// AuthViewModel - Gerencia autenticação
import type { User, AuthState } from '@/types/email';
import * as authService from '@/services/authService';
import { BaseViewModel } from './BaseViewModel';

export class AuthViewModel extends BaseViewModel {
  private user: User | null = null;
  private isAuthenticated: boolean = false;
  private observers: Set<() => void> = new Set();

  constructor() {
    super();
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const authState = authService.getAuthState();
    this.user = authState.user;
    this.isAuthenticated = authState.isAuthenticated;
  }

  // Observables
  getUser(): User | null {
    return this.user;
  }

  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  // Commands
  async login(email: string, password: string): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);
    
    try {
      const loggedUser = await authService.login(email, password);
      if (loggedUser) {
        this.user = loggedUser;
        this.isAuthenticated = true;
        this.notifyObservers();
        return true;
      }
      this.setError('Credenciais inválidas');
      this.notifyObservers();
      return false;
    } catch (error) {
      this.setError('Erro ao fazer login');
      this.notifyObservers();
      return false;
    } finally {
      this.setLoading(false);
      this.notifyObservers();
    }
  }

  async logout(): Promise<void> {
    this.setLoading(true);
    
    try {
      await authService.logout();
      this.user = null;
      this.isAuthenticated = false;
      this.notifyObservers();
    } finally {
      this.setLoading(false);
      this.notifyObservers();
    }
  }

  // Observer Pattern
  subscribe(observer: () => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer());
  }
}

// Singleton instance
export const authViewModel = new AuthViewModel();
