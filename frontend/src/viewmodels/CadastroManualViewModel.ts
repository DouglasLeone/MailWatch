// CadastroManualViewModel.ts
import { FormViewModel, FormState } from './FormViewModel';
import type { Email } from '@/types/email';
import * as emailService from '@/services/emailService';

interface CadastroFormData extends FormState {
  remetente: string;
  destinatario: string;
  data: string;
  hora: string;
  assunto: string;
  corpo: string;
  estado: string;
  municipio: string;
}

export class CadastroManualViewModel extends FormViewModel<CadastroFormData> {
  constructor() {
    super({
      remetente: '',
      destinatario: '',
      data: '',
      hora: '',
      assunto: '',
      corpo: '',
      estado: '',
      municipio: '',
    });
  }

  // --- Commands ---
  setRemetente(remetente: string) { this.setFieldValue('remetente', remetente); }
  setDestinatario(destinatario: string) { this.setFieldValue('destinatario', destinatario); }
  setData(data: string) { this.setFieldValue('data', data); }
  setHora(hora: string) { this.setFieldValue('hora', hora); }
  setAssunto(assunto: string) { this.setFieldValue('assunto', assunto); }
  setCorpo(corpo: string) { this.setFieldValue('corpo', corpo); }

  setEstado(estado: string) {
    this.formData.estado = estado;
    this.formData.municipio = '';
    this.notifyObservers();
  }

  setMunicipio(municipio: string) { this.setFieldValue('municipio', municipio); }

  // --- Validação ---
  validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!this.formData.remetente) newErrors.remetente = 'Remetente é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.remetente)) newErrors.remetente = 'E-mail inválido';

    if (!this.formData.destinatario) newErrors.destinatario = 'Destinatário é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.destinatario)) newErrors.destinatario = 'E-mail inválido';

    if (!this.formData.data) newErrors.data = 'Data é obrigatória';
    if (!this.formData.hora) newErrors.hora = 'Hora é obrigatória';
    if (!this.formData.assunto) newErrors.assunto = 'Assunto é obrigatório';
    if (!this.formData.corpo) newErrors.corpo = 'Corpo da mensagem é obrigatório';

    this.setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // --- Submissão isolada ---
  async submitForm(): Promise<boolean> {
    if (!this.validate()) return false;

    this.setSubmitting(true);
    try {
      const newEmail: Omit<Email, 'id'> = {
        remetente: this.formData.remetente,
        destinatario: this.formData.destinatario,
        data: this.formData.data,
        hora: this.formData.hora,
        assunto: this.formData.assunto,
        corpo: this.formData.corpo,
        estado: this.formData.estado || null,
        municipio: this.formData.municipio || null,
        classificado: !!(this.formData.estado && this.formData.municipio),
      };

      await emailService.criarEmail(newEmail);
      this.clearErrors();
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar e-mail:', error);
      this.setError('Erro ao cadastrar e-mail');
      return false;
    } finally {
      this.setSubmitting(false);
    }
  }

  resetForm(): void {
    super.resetForm({
      remetente: '',
      destinatario: '',
      data: '',
      hora: '',
      assunto: '',
      corpo: '',
      estado: '',
      municipio: '',
    });
  }
}

// --- Instância isolada ---
export const cadastroManualViewModel = new CadastroManualViewModel();
