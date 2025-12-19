import type { Email } from "@/types/email";
import * as emailService from "@/services/emailRepository";
import { BaseViewModel } from "./BaseViewModel";

export class PendingEmailsViewModel extends BaseViewModel {
  private emails: Email[] = [];
  private localUpdates: Record<string, { estado: string; municipio: string }> = {};
  private searchTerm: string = '';
  private dateFilter: string = '';
  private estadoFilter: string = '';
  private municipioFilter: string = '';

  getEmails() {
    return this.emails;
  }

  getLocalUpdates() {
    return this.localUpdates;
  }

  getSearchTerm() {
    return this.searchTerm;
  }

  getDateFilter() {
    return this.dateFilter;
  }

  getEstadoFilter() { return this.estadoFilter; }
  getMunicipioFilter() { return this.municipioFilter; }

  setSearchTerm(term: string) {
    this.searchTerm = term;
    this.notifyObservers();
  }

  setDateFilter(date: string) {
    this.dateFilter = date;
    this.notifyObservers();
  }

  setEstadoFilter(estado: string) { this.estadoFilter = estado; this.notifyObservers(); }
  setMunicipioFilter(municipio: string) { this.municipioFilter = municipio; this.notifyObservers(); }

  // Returns merged & filtered list ready for the View
  getFilteredEmails(): Email[] {
    const merged = this.emails.map(email => {
      const local = this.localUpdates[email.id];
      if (local) {
        return { ...email, estado: local.estado || email.estado || '', municipio: local.municipio || email.municipio || '' } as Email;
      }
      return email;
    });

    const term = this.searchTerm.toLowerCase();
    const estadoFilter = (this.estadoFilter || '').toLowerCase();
    const municipioFilter = (this.municipioFilter || '').toLowerCase();

    return merged.filter(email => {
      const matchesSearch =
        email.remetente.toLowerCase().includes(term) ||
        email.destinatario.toLowerCase().includes(term);
      const matchesDate = !this.dateFilter || email.data === this.dateFilter;

      const emailEstado = (email.estado || '').toLowerCase();
      const emailMunicipio = (email.municipio || '').toLowerCase();

      const matchesEstado = !estadoFilter || (emailEstado && emailEstado === estadoFilter);
      const matchesMunicipio = !municipioFilter || (emailMunicipio && emailMunicipio === municipioFilter);

      return matchesSearch && matchesDate && matchesEstado && matchesMunicipio;
    });
  }

  getPendingCount() {
    return Object.values(this.localUpdates).filter(
      u => u.estado && u.municipio
    ).length;
  }

  async fetchPendingEmails() {
    this.setLoading(true);
    this.setError(null);

    try {
      this.emails = await emailService.fetchPendentes();
      this.notifyObservers();
    } catch (e) {
      this.setError("Erro ao carregar e-mails pendentes");
    } finally {
      this.setLoading(false);
    }
  }

  updateEstado(id: string, estado: string) {
    this.localUpdates[id] = {
      estado,
      municipio: ""
    };
    this.notifyObservers();
  }

  updateMunicipio(id: string, municipio: string) {
    if (!this.localUpdates[id]) {
      this.localUpdates[id] = { estado: "", municipio };
    } else {
      this.localUpdates[id].municipio = municipio;
    }
    this.notifyObservers();
  }

  async saveAllClassifications() {
    const updates = Object.entries(this.localUpdates)
      .filter(([, u]) => u.estado && u.municipio)
      .map(([id, u]) => ({ id, ...u }));

    if (updates.length === 0) {
      this.setError("Nenhum dado para salvar");
      return false;
    }

    this.setLoading(true);

    try {
      for (const update of updates) {
        await emailService.classificarEmail(update.id, update);
      }

      this.localUpdates = {};
      await this.fetchPendingEmails();
      return true;
    } catch {
      this.setError("Erro ao salvar classificações");
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  async deleteEmail(id: string): Promise<boolean> {
    if (!id) return false;
    this.setLoading(true);
    try {
      await emailService.deleteEmail(id);
      await this.fetchPendingEmails();
      return true;
    } catch (err) {
      this.setError('Erro ao deletar e-mail');
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  clearUpdates() {
    this.localUpdates = {};
    this.notifyObservers();
  }

  reset() {
    this.emails = [];
    this.localUpdates = {};
    this.setError(null);
    this.setLoading(false);
    this.notifyObservers();
  }
}

export const pendingEmailsViewModel = new PendingEmailsViewModel();
