// EmailsViewModel - Gerencia lista de e-mails
import type { Email } from '@/types/email';
import * as emailService from '@/services/emailRepository';
import { BaseViewModel } from './BaseViewModel';

export class EmailsViewModel extends BaseViewModel {
  private emails: Email[] = [];
  private searchTerm: string = '';
  private dateFilter: string = '';
  private statusFilter: 'all' | 'pendentes' | 'classificados' = 'all';
  private estadoFilter: string = '';
  private municipioFilter: string = '';
  
  // Observables
  getEmails(): Email[] {
    return this.emails;
  }

  getSearchTerm() { return this.searchTerm; }
  getDateFilter() { return this.dateFilter; }
  getStatusFilter() { return this.statusFilter; }
  getEstadoFilter() { return this.estadoFilter; }
  getMunicipioFilter() { return this.municipioFilter; }

  setSearchTerm(term: string) { this.searchTerm = term; this.notifyObservers(); }
  setDateFilter(date: string) { this.dateFilter = date; this.notifyObservers(); }
  setStatusFilter(status: 'all' | 'pendentes' | 'classificados') { this.statusFilter = status; this.notifyObservers(); }
  setEstadoFilter(estado: string) { this.estadoFilter = estado; this.notifyObservers(); }
  setMunicipioFilter(municipio: string) { this.municipioFilter = municipio; this.notifyObservers(); }

  getFilteredEmails(): Email[] {
    const term = this.searchTerm.toLowerCase();
    const estadoFilter = (this.estadoFilter || '').toLowerCase();
    const municipioFilter = (this.municipioFilter || '').toLowerCase();

    return this.emails.filter((email) => {
      const matchesSearch =
        email.remetente.toLowerCase().includes(term) ||
        email.destinatario.toLowerCase().includes(term) ||
        email.assunto.toLowerCase().includes(term);
      const matchesDate = !this.dateFilter || email.data === this.dateFilter;
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'pendentes' && !email.classificado) ||
        (this.statusFilter === 'classificados' && !!email.classificado);

      const emailEstado = (email.estado || '').toLowerCase();
      const emailMunicipio = (email.municipio || '').toLowerCase();

      const matchesEstado = !estadoFilter || (emailEstado && emailEstado === estadoFilter);
      const matchesMunicipio = !municipioFilter || (emailMunicipio && emailMunicipio === municipioFilter);

      return matchesSearch && matchesDate && matchesStatus && matchesEstado && matchesMunicipio;
    });
  }

  // Commands
  async fetchEmails(): Promise<void> {
    this.setLoading(true);
    this.setError(null);
    
    try {
      this.emails = await emailService.fetchHistorico();
      this.notifyObservers();
    } catch (error) {
      this.setError('Erro ao carregar e-mails');
    } finally {
      this.setLoading(false);
    }
  }

  async deleteEmail(id: string): Promise<boolean> {
    if (!id) return false;
    this.setLoading(true);
    try {
      await emailService.deleteEmail(id);
      await this.fetchEmails();
      return true;
    } catch (err) {
      this.setError('Erro ao deletar e-mail');
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  // Observer Pattern
  // Uses BaseViewModel's `subscribe` and `notifyObservers` implementations

  reset(): void {
    this.emails = [];
    this.setLoading(false);
    this.setError(null);
    this.notifyObservers();
  }
}

// Singleton instance
export const emailsViewModel = new EmailsViewModel();
