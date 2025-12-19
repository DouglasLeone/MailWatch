import { useState, useEffect, useCallback } from 'react';
import type { Email, DashboardData } from '@/types/email';
import { 
  emailsViewModel, 
  pendingEmailsViewModel, 
  dashboardViewModel,
  createEmailDetailsViewModel,
  type EmailDetailsViewModel
} from '@/viewmodels';
import * as locationService from '@/services/locationService';

interface UsePendingEmailsResult {
  emails: Email[];
  isLoading: boolean;
  error: string | null;
  localUpdates: Record<string, { estado: string, municipio: string }>;
  pendingCount: number;
  refetch: () => Promise<void>;
  updateLocalEmail: (id: string, estado?: string, municipio?: string) => void;
}

interface UsePendingEmailsResultExtended extends UsePendingEmailsResult {
  filteredEmails: Email[];
  setFilter: (term: string, date: string, statusOrEstado?: string, municipio?: string) => void;
  searchTerm: string;
  dateFilter: string;
  estadoFilter?: string;
  municipioFilter?: string;
  saveAllClassifications: () => Promise<boolean> | boolean;
  deleteEmail: (id: string) => Promise<boolean> | boolean;
}

// Lista de e-mails
export function useEmails() {
  const [emails, setEmails] = useState<Email[]>(emailsViewModel.getEmails());
  const [isLoading, setIsLoading] = useState(emailsViewModel.getIsLoading());
  const [error, setError] = useState(emailsViewModel.getError());
  const [filteredEmails, setFilteredEmails] = useState<Email[]>(emailsViewModel.getFilteredEmails ? emailsViewModel.getFilteredEmails() : emailsViewModel.getEmails());
  const [searchTerm, setSearchTerm] = useState(emailsViewModel.getSearchTerm ? emailsViewModel.getSearchTerm() : '');
  const [dateFilter, setDateFilter] = useState(emailsViewModel.getDateFilter ? emailsViewModel.getDateFilter() : '');
  const [statusFilter, setStatusFilter] = useState<'all'|'pendentes'|'classificados'>(emailsViewModel.getStatusFilter ? emailsViewModel.getStatusFilter() : 'all');
  const [estadoFilter, setEstadoFilter] = useState(emailsViewModel.getEstadoFilter ? emailsViewModel.getEstadoFilter() : '');
  const [municipioFilter, setMunicipioFilter] = useState(emailsViewModel.getMunicipioFilter ? emailsViewModel.getMunicipioFilter() : '');

  useEffect(() => {
    const unsubscribe = emailsViewModel.subscribe(() => {
      setEmails(emailsViewModel.getEmails());
      setIsLoading(emailsViewModel.getIsLoading());
      setError(emailsViewModel.getError());
      setFilteredEmails(emailsViewModel.getFilteredEmails ? emailsViewModel.getFilteredEmails() : emailsViewModel.getEmails());
      setSearchTerm(emailsViewModel.getSearchTerm ? emailsViewModel.getSearchTerm() : '');
      setDateFilter(emailsViewModel.getDateFilter ? emailsViewModel.getDateFilter() : '');
      setStatusFilter(emailsViewModel.getStatusFilter ? emailsViewModel.getStatusFilter() : 'all');
      setEstadoFilter(emailsViewModel.getEstadoFilter ? emailsViewModel.getEstadoFilter() : '');
      setMunicipioFilter(emailsViewModel.getMunicipioFilter ? emailsViewModel.getMunicipioFilter() : '');
    });

    emailsViewModel.fetchEmails();
    return unsubscribe;
  }, []);

  const refetch = useCallback(() => emailsViewModel.fetchEmails(), []);

  const setFilter = useCallback((term: string, date: string, statusOrEstado: string = 'all', municipio?: string) => {
    // If statusOrEstado is one of the status keywords, treat as status filter
    const statusKeywords = ['all','pendentes','classificados'];
    emailsViewModel.setSearchTerm(term);
    emailsViewModel.setDateFilter(date);
    if (statusKeywords.includes(statusOrEstado)) {
      emailsViewModel.setStatusFilter(statusOrEstado as 'all'|'pendentes'|'classificados');
      emailsViewModel.setEstadoFilter('');
      emailsViewModel.setMunicipioFilter('');
    } else {
      // treat as estado
      emailsViewModel.setStatusFilter('all');
      emailsViewModel.setEstadoFilter(statusOrEstado || '');
      emailsViewModel.setMunicipioFilter(municipio || '');
    }
  }, []);

  const deleteEmail = useCallback((id: string) => emailsViewModel.deleteEmail(id), []);

  return { emails, filteredEmails, isLoading, error, refetch, setFilter, searchTerm, dateFilter, statusFilter, deleteEmail };
}

// E-mails pendentes
export function usePendingEmails(): UsePendingEmailsResultExtended {
  const [emails, setEmails] = useState<Email[]>(pendingEmailsViewModel.getEmails());
  const [isLoading, setIsLoading] = useState(pendingEmailsViewModel.getIsLoading());
  const [error, setError] = useState(pendingEmailsViewModel.getError());
  const [localUpdates, setLocalUpdates] = useState(pendingEmailsViewModel.getLocalUpdates());
  const [pendingCount, setPendingCount] = useState(pendingEmailsViewModel.getPendingCount());
  const [filteredEmails, setFilteredEmails] = useState<Email[]>(pendingEmailsViewModel.getFilteredEmails());
  const [searchTerm, setSearchTerm] = useState(pendingEmailsViewModel.getSearchTerm());
  const [dateFilter, setDateFilter] = useState(pendingEmailsViewModel.getDateFilter());
  const [estadoFilter, setEstadoFilter] = useState(pendingEmailsViewModel.getEstadoFilter ? pendingEmailsViewModel.getEstadoFilter() : '');
  const [municipioFilter, setMunicipioFilter] = useState(pendingEmailsViewModel.getMunicipioFilter ? pendingEmailsViewModel.getMunicipioFilter() : '');

  useEffect(() => {
    const unsubscribe = pendingEmailsViewModel.subscribe(() => {
      setEmails(pendingEmailsViewModel.getEmails());
      setIsLoading(pendingEmailsViewModel.getIsLoading());
      setError(pendingEmailsViewModel.getError());
      setLocalUpdates(pendingEmailsViewModel.getLocalUpdates());
      setPendingCount(pendingEmailsViewModel.getPendingCount());
      setFilteredEmails(pendingEmailsViewModel.getFilteredEmails());
      setSearchTerm(pendingEmailsViewModel.getSearchTerm());
      setDateFilter(pendingEmailsViewModel.getDateFilter());
      setEstadoFilter(pendingEmailsViewModel.getEstadoFilter ? pendingEmailsViewModel.getEstadoFilter() : '');
      setMunicipioFilter(pendingEmailsViewModel.getMunicipioFilter ? pendingEmailsViewModel.getMunicipioFilter() : '');
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

  const setFilter = useCallback((term: string, date: string) => {
    pendingEmailsViewModel.setSearchTerm(term);
    pendingEmailsViewModel.setDateFilter(date);
  }, []);
  
  // extended setFilter supporting estado/municipio
  const setFilterWithLocation = useCallback((term: string, date: string, estado?: string, municipio?: string) => {
    pendingEmailsViewModel.setSearchTerm(term);
    pendingEmailsViewModel.setDateFilter(date);
    pendingEmailsViewModel.setEstadoFilter(estado || '');
    pendingEmailsViewModel.setMunicipioFilter(municipio || '');
  }, []);

  const refetch = useCallback(() => pendingEmailsViewModel.fetchPendingEmails(), []);

    const saveAllClassifications = useCallback(() => pendingEmailsViewModel.saveAllClassifications(), []);

    const deleteEmail = useCallback((id: string) => pendingEmailsViewModel.deleteEmail(id), []);

    return { emails, filteredEmails, isLoading, error, refetch, updateLocalEmail, localUpdates, pendingCount, setFilter: setFilterWithLocation, searchTerm, dateFilter, estadoFilter, municipioFilter, saveAllClassifications, deleteEmail };
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
  const [estados, setEstados] = useState<Array<{ sigla: string; nome: string }>>([]);
  const [municipios, setMunicipios] = useState<Array<{ nome: string }>>([]);

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
    // load estados on mount for the select
    (async () => {
      try {
        const fetched = await locationService.fetchEstados();
        setEstados(fetched as Array<{ sigla: string; nome: string }>);
      } catch (e) {
        // ignore: components will show loading state or message
      }
    })();
    return unsubscribe;
  }, [id, viewModel]);

  const refetch = useCallback(() => viewModel.fetchEmailDetails(id), [id, viewModel]);

  // fetch municipios whenever editingEstado changes
  useEffect(() => {
    let cancelled = false;
    if (!editingEstado) {
      setMunicipios([]);
      return;
    }

    (async () => {
      try {
        const fetched = await locationService.fetchMunicipiosPorEstado(editingEstado);
        if (!cancelled) setMunicipios(fetched as Array<{ nome: string }>);
      } catch (e) {
        if (!cancelled) setMunicipios([]);
      }
    })();

    return () => { cancelled = true; };
  }, [editingEstado]);

  return { email, isLoading, error, refetch, isEditing, isSaving, editingEstado, editingMunicipio, viewModel, municipios, estados };
}