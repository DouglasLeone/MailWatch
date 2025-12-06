// Serviço de autenticação (mock)
import type { User, AuthState } from '@/types/email';

const STORAGE_KEY = 'emailmanager_auth';

// Usuário mock para testes
const mockUser: User = {
  id: '1',
  email: 'admin@emailmanager.com',
  nome: 'Administrador',
};

// Simula delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Verifica credenciais mock
export async function login(email: string, password: string): Promise<User | null> {
  await delay(800);
  
  // Credenciais de teste: qualquer email válido + senha "123456"
  if (email && password === '123456') {
    const user: User = {
      id: '1',
      email: email,
      nome: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
    };
    
    // Salva no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, isAuthenticated: true }));
    return user;
  }
  
  return null;
}

// Realiza logout
export async function logout(): Promise<void> {
  await delay(200);
  localStorage.removeItem(STORAGE_KEY);
}

// Verifica se está autenticado
export function getAuthState(): AuthState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { user: null, isAuthenticated: false };
    }
  }
  return { user: null, isAuthenticated: false };
}

// Verifica token/sessão
export function isAuthenticated(): boolean {
  return getAuthState().isAuthenticated;
}

// Obtém usuário atual
export function getCurrentUser(): User | null {
  return getAuthState().user;
}
