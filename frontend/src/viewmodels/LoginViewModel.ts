// LoginViewModel - ViewModel específico para a tela de login
import { FormViewModel, FormState } from './FormViewModel';
import * as authService from '@/services/authService';
import { authViewModel } from './AuthViewModel';

interface LoginFormData extends FormState {
  email: string;
  password: string;
  showPassword: boolean;
}

export class LoginViewModel extends FormViewModel<LoginFormData> {
  constructor() {
    super({
      email: '',
      password: '',
      showPassword: false,
    });
  }

  // Commands
  setEmail(email: string): void {
    this.setFieldValue('email' as keyof LoginFormData, email);
  }

  setPassword(password: string): void {
    this.setFieldValue('password' as keyof LoginFormData, password);
  }

  toggleShowPassword(): void {
    this.formData.showPassword = !this.formData.showPassword;
    this.notifyObservers();
  }

  validate(): boolean {
    const newErrors: { [key: string]: string } = {};

    if (!this.formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!this.formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (this.formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    this.setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async submitLogin(): Promise<boolean> {
    if (!this.validate()) return false;

    this.setSubmitting(true);
    try {
      // Use AuthViewModel to ensure global auth state is updated
      const success = await authViewModel.login(this.formData.email, this.formData.password);
      if (!success) {
        this.setError('Credenciais inválidas');
        return false;
      }
      this.clearErrors();
      return true;
    } catch (error) {
      this.setError('Erro ao realizar login');
      return false;
    } finally {
      this.setSubmitting(false);
    }
  }

  resetForm(): void {
    super.resetForm({
      email: '',
      password: '',
      showPassword: false,
    });
  }
}

// Singleton instance
export const loginViewModel = new LoginViewModel();
