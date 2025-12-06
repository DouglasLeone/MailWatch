// DashboardViewModel - Gerencia dados do dashboard (MVVM)
import type { DashboardData } from '@/types/email';
import * as emailService from '@/services/emailService';
import { BaseViewModel } from './BaseViewModel';

export class DashboardViewModel extends BaseViewModel {
  private data: DashboardData | null = null;
  private dashboardObservers: Set<() => void> = new Set();
  private refreshInterval: NodeJS.Timeout | null = null;
  private readonly REFRESH_INTERVAL = 30000; // 30 segundos

  // Observables
  getData(): DashboardData | null {
    return this.data;
  }

  // Commands
  async fetchDashboard(): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      const result = await emailService.getDashboardData();
      this.data = result;
      this.notifyObservers();
    } catch (error) {
      console.error('[DashboardViewModel] Erro ao buscar dashboard:', error);
      this.setError('Erro ao carregar dashboard');
      this.notifyObservers();
    } finally {
      this.setLoading(false);
      this.notifyObservers();
    }
  }

  // Inicia auto-refresh (polling) dos dados
  startAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Carrega imediatamente
    this.fetchDashboard();

    // Depois atualiza a cada REFRESH_INTERVAL
    this.refreshInterval = setInterval(() => {
      this.fetchDashboard();
    }, this.REFRESH_INTERVAL);
  }

  // Para o auto-refresh
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Força um refresh manual
  async manualRefresh(): Promise<void> {
    await this.fetchDashboard();
  }

  reset(): void {
    this.data = null;
    this.setLoading(false);
    this.setError(null);
    this.stopAutoRefresh();
    this.notifyObservers();
  }

  // Observer Pattern - sobrescreve para incluir observadores locais
  subscribe(observer: () => void): () => void {
    this.dashboardObservers.add(observer);
    // Retorna função para cancelar inscrição
    return () => this.dashboardObservers.delete(observer);
  }

  private notifyObservers(): void {
    this.dashboardObservers.forEach((observer) => observer());
  }
}

// Singleton instance
export const dashboardViewModel = new DashboardViewModel();
