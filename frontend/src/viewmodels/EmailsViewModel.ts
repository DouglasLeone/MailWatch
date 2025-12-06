// EmailsViewModel - Gerencia lista de e-mails
import type { Email } from '@/types/email';
import * as emailService from '@/services/emailService';
import { BaseViewModel } from './BaseViewModel';

export class EmailsViewModel extends BaseViewModel {
  private emails: Email[] = [];
  
  // Observables
  getEmails(): Email[] {
    return this.emails;
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
