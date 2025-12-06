// EmailDetailsViewModel - Gerencia detalhes de um e-mail específico
import type { Email } from '@/types/email';
import * as emailService from '@/services/emailService';
import { BaseViewModel } from './BaseViewModel';

export class EmailDetailsViewModel extends BaseViewModel {
  private email: Email | null = null;
  private editingEstado: string = '';
  private editingMunicipio: string = '';
  private isEditing: boolean = false;
  private isSaving: boolean = false;
  private observers: Set<() => void> = new Set();

  // Observables
  getEmail(): Email | null {
    return this.email;
  }

  getIsEditing(): boolean {
    return this.isEditing;
  }

  getIsSaving(): boolean {
    return this.isSaving;
  }

  getEditingEstado(): string {
    return this.editingEstado;
  }

  getEditingMunicipio(): string {
    return this.editingMunicipio;
  }

  // Commands
  async fetchEmailDetails(id: string): Promise<void> {
    if (!id) return;
    
    this.setLoading(true);
    this.setError(null);
    
    try {
      this.email = await emailService.getEmailById(id);
      if (!this.email) {
        this.setError('E-mail não encontrado');
      }
      this.notifyObservers();
    } catch (error) {
      this.setError('Erro ao carregar e-mail');
      this.notifyObservers();
    } finally {
      this.setLoading(false);
      this.notifyObservers();
    }
  }

  startEditing(): void {
    this.isEditing = true;
    this.editingEstado = this.email?.estado || '';
    this.editingMunicipio = this.email?.municipio || '';
    this.notifyObservers();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editingEstado = '';
    this.editingMunicipio = '';
    this.notifyObservers();
  }

  setEditingEstado(estado: string): void {
    this.editingEstado = estado;
    this.editingMunicipio = '';
    this.notifyObservers();
  }

  setEditingMunicipio(municipio: string): void {
    this.editingMunicipio = municipio;
    this.notifyObservers();
  }

  async saveLocation(emailId: string): Promise<boolean> {
    if (!emailId) return false;
    
    this.isSaving = true;
    
    try {
      await emailService.updateEmailLocation(
        emailId,
        this.editingEstado || null,
        this.editingMunicipio || null
      );
      
      // Atualiza o email local
      if (this.email) {
        this.email.estado = this.editingEstado || null;
        this.email.municipio = this.editingMunicipio || null;
        this.email.classificado = !!(this.editingEstado && this.editingMunicipio);
      }
      
      this.isEditing = false;
      this.editingEstado = '';
      this.editingMunicipio = '';
      this.notifyObservers();
      return true;
    } catch (error) {
      this.setError('Erro ao salvar localização');
      this.notifyObservers();
      return false;
    } finally {
      this.isSaving = false;
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

// Factory para criar instâncias (vai ser usado nos hooks com useEffect)
export function createEmailDetailsViewModel(): EmailDetailsViewModel {
  return new EmailDetailsViewModel();
}
