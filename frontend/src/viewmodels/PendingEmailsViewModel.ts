import type { Email } from "@/types/email";
import * as emailService from "@/services/emailService";
import { BaseViewModel } from "./BaseViewModel";

export class PendingEmailsViewModel extends BaseViewModel {
  private emails: Email[] = [];
  private localUpdates: Record<string, { estado: string; municipio: string }> = {};

  getEmails() {
    return this.emails;
  }

  getLocalUpdates() {
    return this.localUpdates;
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
