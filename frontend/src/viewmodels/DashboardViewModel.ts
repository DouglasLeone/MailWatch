// DashboardViewModel - Gerencia dados do dashboard (MVVM)
import type { DashboardData } from '@/types/email';
import * as emailService from '@/services/emailRepository';
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
      // The repository no longer provides aggregated dashboard data; compute
      // aggregates locally using the repository's fetchHistorico for full
      // control and to keep presentation logic in the ViewModel.
      const emails = await emailService.fetchHistorico();

      const total = emails.length;
      const classificados = emails.filter(e => e.classificado || (e.estado && e.municipio)).length;
      const pendentes = total - classificados;

      const emailsPorEstado: Record<string, number> = {};
      emails.forEach(email => {
        if (!email.estado) return;
        emailsPorEstado[email.estado] = (emailsPorEstado[email.estado] || 0) + 1;
      });

      // Tendência últimos 7 dias
      const tendenciaMap: Record<string, number> = {};
      for (let i = 0; i < 7; i++) {
        const dt = new Date();
        dt.setDate(dt.getDate() - i);
        const key = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        tendenciaMap[key] = 0;
      }

      const parseIsoDateToLocal = (dateStr?: string | null) => {
        if (!dateStr) return null;
        const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
        const d = new Date(String(dateStr));
        if (isNaN(d.getTime())) return null;
        return d;
      };

      emails.forEach(email => {
        const parsed = parseIsoDateToLocal(email.data) || (email.data ? new Date(String(email.data)) : null);
        if (!parsed) return;
        const dateStr = parsed.toLocaleDateString('pt-BR', { month: 'short', day: '2-digit' });
        if (dateStr in tendenciaMap) tendenciaMap[dateStr]++;
      });

      const tendencia = Object.keys(tendenciaMap).map(k => ({ dia: k, quantidade: tendenciaMap[k] }));

      const destMap: Record<string, number> = {};
      for (const e of emails) destMap[e.destinatario] = (destMap[e.destinatario] || 0) + 1;

      const topDestinatarios = Object.entries(destMap)
        .map(([destinatario, quantidade]) => ({ destinatario, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);

      this.data = {
        stats: { total, classificados, pendentes },
        emailsPorEstado: Object.entries(emailsPorEstado).map(([estado, quantidade]) => ({ estado, quantidade })).sort((a, b) => b.quantidade - a.quantidade),
        tendencia,
        topDestinatarios
      };
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

  // Mantém a visibilidade protegida como na BaseViewModel e notifica ambos os conjuntos
  protected notifyObservers(): void {
    // Notifica observadores do BaseViewModel
    // chama implementação base para observers registrados via BaseViewModel
    try {
      super.notifyObservers();
    } catch (e) {
      // Caso a implementação base não exista por algum motivo, ignoramos
    }

    // Notifica observadores específicos do dashboard
    this.dashboardObservers.forEach((observer) => observer());
  }
}

// Singleton instance
export const dashboardViewModel = new DashboardViewModel();
