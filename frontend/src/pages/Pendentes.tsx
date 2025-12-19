import React, { useState, useMemo, useEffect } from 'react';
import { Save, Download, Search, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { usePendingEmails } from '@/hooks/useEmails'; 
import type { Email } from '@/types/email'; 
// Importamos o novo serviço de localização
import * as locationService from '@/services/locationService';

// Interfaces para os dados de localização
interface Estado { sigla: string; nome: string; }
interface Municipio { nome: string; }


export default function Pendentes() {
  const { toast } = useToast();
  
  // ESTADOS E DADOS DE LOCALIZAÇÃO
  const [estados, setEstados] = useState<Estado[]>([]);
  // Usamos um mapa para armazenar os municípios já carregados para evitar repetição de chamadas
  const [municipiosCache, setMunicipiosCache] = useState<Record<string, Municipio[]>>({});
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [loadingEstados, setLoadingEstados] = useState<Record<string, boolean>>({}); // Rastreia quais estados estão carregando
  // Mapeamentos locais para refletir seleções imediatamente na UI
  const [selectedEstados, setSelectedEstados] = useState<Record<string, string>>({});
  const [selectedMunicipios, setSelectedMunicipios] = useState<Record<string, string>>({});

  // EFEITO PARA CARREGAR OS DADOS DE LOCALIZAÇÃO NA MONTAGEM
  // Este useEffect substitui a importação direta de mockData.ts
  useEffect(() => {
    async function loadLocationData() {
      try {
        const fetchedEstados = await locationService.fetchEstados();
        setEstados(fetchedEstados);
      } catch (e) {
        console.error('Erro ao carregar estados:', e);
        toast({
          title: 'Erro de Localização',
          description: 'Não foi possível carregar a lista de estados.',
          variant: 'destructive',
        });
      } finally {
        setIsLocationLoading(false);
      }
    }
    loadLocationData();
  }, [toast]);
  
  // O hook que gerencia os e-mails e as atualizações locais
  const { 
    emails, 
    filteredEmails,
    isLoading: isEmailsLoading, 
    localUpdates,
    pendingCount,
    error,
    updateLocalEmail,
    refetch,
    setFilter,
    searchTerm,
    dateFilter,
    saveAllClassifications,
    deleteEmail
  } = usePendingEmails();

  // Global location filters
  const [globalEstadoFilter, setGlobalEstadoFilter] = useState('');
  const [globalMunicipioFilter, setGlobalMunicipioFilter] = useState('');
  
  const isLoading = isEmailsLoading || isLocationLoading;
  
  // searchTerm/dateFilter are managed by the ViewModel; reflect them locally
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [localDateFilter, setLocalDateFilter] = useState(dateFilter);

  // Sync local inputs with ViewModel
  useEffect(() => setLocalSearch(searchTerm), [searchTerm]);
  useEffect(() => setLocalDateFilter(dateFilter), [dateFilter]);

  useEffect(() => {
    // whenever global filters change, apply them to the ViewModel
    setFilter(localSearch, localDateFilter, globalEstadoFilter, globalMunicipioFilter);
  }, [globalEstadoFilter, globalMunicipioFilter]);

  // Handlers
  const handleEstadoChange = async (emailId: string, estado: string) => {
    // Atualiza imediatamente a seleção local para resposta instantânea
    setSelectedEstados(prev => ({ ...prev, [emailId]: estado }));
    setSelectedMunicipios(prev => ({ ...prev, [emailId]: '' }));

    // 1. Limpa o município no ViewModel/local
    updateLocalEmail(emailId, estado);

    // 2. Carrega os municípios para o novo estado (Se não estiverem em cache)
    if (!municipiosCache[estado]) {
      setLoadingEstados(prev => ({ ...prev, [estado]: true }));
      try {
        const fetchedMunicipios = await locationService.fetchMunicipiosPorEstado(estado);
        setMunicipiosCache(prev => ({
          ...prev,
          [estado]: fetchedMunicipios,
        }));
        console.debug(`[Pendentes] Municípios carregados para ${estado}:`, fetchedMunicipios.length);
      } catch (e) {
        console.error(`Erro ao carregar municípios para ${estado}:`, e);
        toast({
          title: 'Erro de Localização',
          description: `Não foi possível carregar os municípios para ${estado}.`,
          variant: 'destructive',
        });
      } finally {
        setLoadingEstados(prev => ({ ...prev, [estado]: false }));
      }
    }
  };

  const handleMunicipioChange = (emailId: string, municipio: string) => {
    // Atualiza localmente para resposta instantânea
    setSelectedMunicipios(prev => ({ ...prev, [emailId]: municipio }));
    updateLocalEmail(emailId, undefined, municipio);
  };

  const handleSaveAll = async () => {
    const success = await saveAllClassifications();
    if (success) {
      toast({
        title: 'Salvo com sucesso!',
        description: `${pendingCount} e-mail(s) classificado(s).`,
      });
    } else {
      const executionError = undefined; 
      toast({
        title: 'Erro ao salvar',
        description: executionError || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const openDeleteDialog = (id: string) => {
    setSelectedDeleteId(id);
    setConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!selectedDeleteId) return;
    try {
      const success = await deleteEmail(selectedDeleteId);
      if (success) {
        toast({ title: 'Excluído', description: 'E-mail removido com sucesso.' });
        await refetch();
      } else {
        toast({ title: 'Erro', description: 'Falha ao deletar e-mail', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Erro ao deletar e-mail', err);
      toast({ title: 'Erro', description: (err && err.message) ? err.message : 'Falha ao deletar e-mail', variant: 'destructive' });
    } finally {
      setSelectedDeleteId(null);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Remetente', 'Destinatário', 'Data', 'Estado', 'Município'].join(';'),
      ...filteredEmails.map(email => [
        email.remetente,
        email.destinatario,
        email.data,
        email.estado || '', 
        email.municipio || ''
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pendentes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Exportado!',
      description: 'Arquivo CSV baixado com sucesso.',
    });
  };

  const formatDate = (dateStr: string, hora?: string) => {
    let date: Date;
    if (hora) {
      date = new Date(`${dateStr}T${hora}:00`);
      if (isNaN(date.getTime())) date = new Date(dateStr.replace(/-/g, '/'));
    } else {
      date = new Date(dateStr.replace(/-/g, '/'));
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Exibe erro de carregamento global, se houver
  if (error && !isLoading) {
    return (
      <MainLayout>
        <div className="p-10 text-center bg-destructive/10 border border-destructive/30 rounded-lg m-6">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-destructive">Erro de Carregamento</h3>
          <p className="text-sm text-destructive/80">{error}</p>
          <Button onClick={() => pendingEmailsViewModel.fetchPendingEmails()} className="mt-4" variant="destructive">
            Tentar Novamente
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="E-mails Pendentes" 
        description="Classifique os e-mails por localização para organização do sistema"
        badge={{ text: `${emails.length} pendentes`, variant: 'warning' }}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} className="h-10">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button 
              onClick={handleSaveAll} 
              disabled={isLoading || pendingCount === 0} 
              className="h-10 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {pendingCount > 0 ? `Salvar (${pendingCount})` : 'Salvar tudo'}
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="mb-6 border-border/50 shadow-card animate-fade-in">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por remetente ou destinatário..."
              value={localSearch}
              onChange={(e) => {
                const v = e.target.value;
                setLocalSearch(v);
                setFilter(v, localDateFilter, globalEstadoFilter, globalMunicipioFilter);
              }}
              className="pl-10 h-10 bg-muted/50 border-border/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-10 w-28 rounded-md border bg-muted/50 px-2 text-sm"
              value={globalEstadoFilter}
              onChange={(e) => {
                const v = e.target.value;
                setGlobalEstadoFilter(v);
                setGlobalMunicipioFilter('');
                if (v) {
                  if (!municipiosCache[v]) {
                    // prefetch for global filter
                    locationService.fetchMunicipiosPorEstado(v).then((m) => setMunicipiosCache(prev => ({ ...prev, [v]: m }))).catch(() => {});
                  }
                }
              }}
            >
              <option value="">UF</option>
              {estados.map((e) => <option key={e.sigla} value={e.sigla}>{e.sigla}</option>)}
            </select>

            <select
              className="h-10 w-40 rounded-md border bg-muted/50 px-2 text-sm"
              value={globalMunicipioFilter}
              onChange={(e) => setGlobalMunicipioFilter(e.target.value)}
              disabled={!globalEstadoFilter}
            >
              <option value="">Município</option>
              {(municipiosCache[globalEstadoFilter] || []).map(m => <option key={m.nome} value={m.nome}>{m.nome}</option>)}
            </select>
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={localDateFilter}
              onChange={(e) => {
                const v = e.target.value;
                setLocalDateFilter(v);
                setFilter(localSearch, v);
              }}
              className="pl-10 h-10 w-full sm:w-44 bg-muted/50 border-border/50"
            />
          </div>
          {localDateFilter && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => { setLocalDateFilter(''); setFilter(localSearch, '') }}
              className="h-10"
            >
              Limpar
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="border-border/50 shadow-card overflow-hidden animate-slide-up">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <p className="text-center text-sm text-muted-foreground">Carregando dados de e-mail e localização...</p>
            {/* Skeleton que resolve o carregamento infinito */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Nenhum e-mail encontrado</h3>
            <p className="text-sm text-muted-foreground">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed divide-y divide-border/50">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Remetente
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Destinatário
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Data
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-20 sm:w-28">
                    Estado
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-28 sm:w-40">
                    Município
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredEmails.map((email, index) => {
                  // 'email' JÁ possui o estado e município atualizados
                  const selectedEstado = email.estado || '';
                  const selectedMunicipio = email.municipio || '';
                  // Use seleções locais se o usuário já interagiu com a linha
                  const effectiveEstado = selectedEstados[email.id] ?? selectedEstado;
                  const effectiveMunicipio = selectedMunicipios[email.id] ?? selectedMunicipio;
                  // Usa o cache local para obter a lista de municípios
                  const municipios = municipiosCache[effectiveEstado] || [];
                  const isComplete = Boolean(effectiveEstado && effectiveMunicipio);

                  return (
                    <tr 
                      key={email.id} 
                      className="table-row-hover animate-fade-in transition-colors duration-150"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{email.remetente}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-foreground/80 truncate max-w-[180px]">{email.destinatario}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-muted-foreground">{formatDate(email.data, email.hora)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="min-w-0">
                          <Select 
                            value={selectedEstados[email.id] ?? selectedEstado} 
                            onValueChange={(value) => handleEstadoChange(email.id, value)}
                            // Desabilita o Select de Estado se a lista de estados ainda estiver carregando
                            disabled={isLocationLoading}
                          >
                            <SelectTrigger className="w-full sm:w-28 h-9 bg-muted/50 border-border/50">
                              <SelectValue placeholder={isLocationLoading ? 'Carregando...' : 'UF'} />
                            </SelectTrigger>
                            <SelectContent>
                              {estados.map((estado) => (
                                <SelectItem key={estado.sigla} value={estado.sigla}>
                                  {estado.sigla}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="min-w-0 flex items-center gap-2">
                          <Select 
                            value={selectedMunicipios[email.id] ?? selectedMunicipio}
                            onValueChange={(value) => handleMunicipioChange(email.id, value)}
                            // Desabilita se não houver estado selecionado, se estiver carregando ou se a lista estiver vazia
                            disabled={!effectiveEstado || isLocationLoading || loadingEstados[effectiveEstado] || municipios.length === 0}
                          >
                            <SelectTrigger className="w-full sm:w-40 h-9 bg-muted/50 border-border/50">
                              <SelectValue placeholder={
                                !effectiveEstado ? 'Selecione o estado' : 
                                loadingEstados[effectiveEstado] ? 'Carregando...' : 
                                municipios.length === 0 ? 'Nenhum encontrado' : 
                                'Município'
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {municipios.map((mun) => (
                                <SelectItem key={mun.nome} value={mun.nome}>
                                  {mun.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {isComplete && (
                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-md shadow-green-500/50" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => openDeleteDialog(email.id)}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!isLoading && filteredEmails.length > 0 && (
          <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-muted/20">
            <span className="text-sm text-muted-foreground">
              {filteredEmails.length} {filteredEmails.length === 1 ? 'item' : 'itens'}
            </span>
            {pendingCount > 0 && (
              <span className="text-sm text-primary font-medium">
                {pendingCount} pronto(s) para salvar
              </span>
            )}
          </div>
        )}
      </Card>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir e-mail"
        description="Deseja mesmo excluir este e-mail pendente? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={onConfirmDelete}
      />
    </MainLayout>
  );
}