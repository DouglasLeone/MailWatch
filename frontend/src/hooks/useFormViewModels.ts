import { useState, useEffect, useCallback } from 'react';
import { loginViewModel, cadastroManualViewModel } from '@/viewmodels';

// Hook para Login
export function useLoginForm() {
  const [email, setEmail] = useState(loginViewModel.getFormData().email);
  const [password, setPassword] = useState(loginViewModel.getFormData().password);
  const [showPassword, setShowPassword] = useState(loginViewModel.getFormData().showPassword);
  const [isLoading, setIsLoading] = useState(loginViewModel.getIsSubmitting());
  const [errors, setErrors] = useState(loginViewModel.getErrors());

  useEffect(() => {
    const unsubscribe = loginViewModel.subscribe(() => {
      const formData = loginViewModel.getFormData();
      setEmail(formData.email);
      setPassword(formData.password);
      setShowPassword(formData.showPassword);
      setIsLoading(loginViewModel.getIsSubmitting());
      setErrors(loginViewModel.getErrors());
    });

    return unsubscribe;
  }, []);

  const handleEmailChange = useCallback((value: string) => loginViewModel.setEmail(value), []);
  const handlePasswordChange = useCallback((value: string) => loginViewModel.setPassword(value), []);
  const toggleShowPassword = useCallback(() => loginViewModel.toggleShowPassword(), []);
  const handleSubmit = useCallback(async (): Promise<boolean> => loginViewModel.submitLogin(), []);

  return { email, password, showPassword, isLoading, errors, handleEmailChange, handlePasswordChange, toggleShowPassword, handleSubmit };
}

// Hook para Cadastro Manual
export function useCadastroManualForm() {
  const [formData, setFormData] = useState(cadastroManualViewModel.getFormData());
  const [errors, setErrors] = useState(cadastroManualViewModel.getErrors());
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = cadastroManualViewModel.subscribe(() => {
      setFormData({ ...cadastroManualViewModel.getFormData() });
      setErrors({ ...cadastroManualViewModel.getErrors() });
      setIsLoading(cadastroManualViewModel.getIsSubmitting());
      setSubmitError((cadastroManualViewModel as any).getError ? (cadastroManualViewModel as any).getError() : null);
    });

    return unsubscribe;
  }, []);

  const handleChange = useCallback((field: string, value: string) => {
    switch (field) {
      case 'remetente': cadastroManualViewModel.setRemetente(value); break;
      case 'destinatario': cadastroManualViewModel.setDestinatario(value); break;
      case 'data': cadastroManualViewModel.setData(value); break;
      case 'hora': cadastroManualViewModel.setHora(value); break;
      case 'assunto': cadastroManualViewModel.setAssunto(value); break;
      case 'corpo': cadastroManualViewModel.setCorpo(value); break;
      case 'estado': cadastroManualViewModel.setEstado(value); break;
      case 'municipio': cadastroManualViewModel.setMunicipio(value); break;
    }
  }, []);

  const handleSubmit = useCallback(async (): Promise<{ ok: boolean; error?: string | null }> => {
    const ok = await cadastroManualViewModel.submitForm();
    const error = (cadastroManualViewModel as any).getError ? (cadastroManualViewModel as any).getError() : null;
    return { ok, error };
  }, []);
  const resetForm = useCallback(() => cadastroManualViewModel.resetForm(), []);

  return { formData, errors, isLoading, submitError, handleChange, handleSubmit, resetForm };
}