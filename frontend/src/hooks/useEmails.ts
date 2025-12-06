import { useState, useEffect, useCallback } from 'react';
import type { Email, DashboardData } from '@/types/email';
import { 
  emailsViewModel, 
  pendingEmailsViewModel, 
  dashboardViewModel,
  createEmailDetailsViewModel,
  type EmailDetailsViewModel
} from '@/viewmodels';

interface UsePendingEmailsResult {
  emails: Email[];
  isLoading: boolean;
  error: string | null;
  localUpdates: Record<string, { estado: string, municipio: string }>;
  pendingCount: number;
  refetch: () => Promise<void>;
  updateLocalEmail: (id: string, estado?: string, municipio?: string) => void;
}

// Lista de e-mails
export function useEmails() {
  const [emails, setEmails] = useState<Email[]>(emailsViewModel.getEmails());
  const [isLoading, setIsLoading] = useState(emailsViewModel.getIsLoading());
  const [error, setError] = useState(emailsViewModel.getError());

  useEffect(() => {
    const unsubscribe = emailsViewModel.subscribe(() => {
      setEmails(emailsViewModel.getEmails());
      setIsLoading(emailsViewModel.getIsLoading());
      setError(emailsViewModel.getError());
    });

    emailsViewModel.fetchEmails();
    return unsubscribe;
  }, []);

  const refetch = useCallback(() => emailsViewModel.fetchEmails(), []);

  return { emails, isLoading, error, refetch };
}

// E-mails pendentes
export function usePendingEmails(): UsePendingEmailsResult {
  const [emails, setEmails] = useState<Email[]>(pendingEmailsViewModel.getEmails());
  const [isLoading, setIsLoading] = useState(pendingEmailsViewModel.getIsLoading());
  const [error, setError] = useState(pendingEmailsViewModel.getError());
  const [localUpdates, setLocalUpdates] = useState(pendingEmailsViewModel.getLocalUpdates());
  const [pendingCount, setPendingCount] = useState(pendingEmailsViewModel.getPendingCount());

  useEffect(() => {
    const unsubscribe = pendingEmailsViewModel.subscribe(() => {
      setEmails(pendingEmailsViewModel.getEmails());
      setIsLoading(pendingEmailsViewModel.getIsLoading());
      setError(pendingEmailsViewModel.getError());
      setLocalUpdates(pendingEmailsViewModel.getLocalUpdates());
      setPendingCount(pendingEmailsViewModel.getPendingCount());
    });

    pendingEmailsViewModel.fetchPendingEmails();
    return unsubscribe;
  }, []);

  const updateLocalEmail = useCallback(
    (id: string, estado?: string, municipio?: string) => {
      if (estado) pendingEmailsViewModel.updateEstado(id, estado);
      if (municipio) pendingEmailsViewModel.updateMunicipio(id, municipio);
    },
    []
  );

  const refetch = useCallback(() => pendingEmailsViewModel.fetchPendingEmails(), []);

  return { emails, isLoading, error, refetch, updateLocalEmail, localUpdates, pendingCount };
}

// Dashboard
export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(dashboardViewModel.getData());
  const [isLoading, setIsLoading] = useState(dashboardViewModel.getIsLoading());
  const [error, setError] = useState(dashboardViewModel.getError());

  useEffect(() => {
    const unsubscribe = dashboardViewModel.subscribe(() => {
      setData(dashboardViewModel.getData());
      setIsLoading(dashboardViewModel.getIsLoading());
      setError(dashboardViewModel.getError());
    });

    // Inicia auto-refresh ao montar o componente
    dashboardViewModel.startAutoRefresh();

    return () => {
      unsubscribe();
      // Para o auto-refresh ao desmontar
      dashboardViewModel.stopAutoRefresh();
    };
  }, []);

  const refetch = useCallback(() => dashboardViewModel.manualRefresh(), []);

  return { data, isLoading, error, refetch };
}

// Detalhes de e-mail
export function useEmailDetails(id: string) {
  const [viewModel] = useState<EmailDetailsViewModel>(() => createEmailDetailsViewModel());
  const [email, setEmail] = useState(viewModel.getEmail());
  const [isLoading, setIsLoading] = useState(viewModel.getIsLoading());
  const [error, setError] = useState(viewModel.getError());
  const [isEditing, setIsEditing] = useState(viewModel.getIsEditing());
  const [isSaving, setIsSaving] = useState(viewModel.getIsSaving());
  const [editingEstado, setEditingEstado] = useState(viewModel.getEditingEstado());
  const [editingMunicipio, setEditingMunicipio] = useState(viewModel.getEditingMunicipio());

  useEffect(() => {
    const unsubscribe = viewModel.subscribe(() => {
      setEmail(viewModel.getEmail());
      setIsLoading(viewModel.getIsLoading());
      setError(viewModel.getError());
      setIsEditing(viewModel.getIsEditing());
      setIsSaving(viewModel.getIsSaving());
      setEditingEstado(viewModel.getEditingEstado());
      setEditingMunicipio(viewModel.getEditingMunicipio());
    });

    viewModel.fetchEmailDetails(id);
    return unsubscribe;
  }, [id, viewModel]);

  const refetch = useCallback(() => viewModel.fetchEmailDetails(id), [id, viewModel]);

  return { email, isLoading, error, refetch, isEditing, isSaving, editingEstado, editingMunicipio, viewModel };
}