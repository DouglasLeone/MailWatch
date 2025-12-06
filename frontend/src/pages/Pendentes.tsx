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
import { usePendingEmails } from '@/hooks/useEmails'; 
import { pendingEmailsViewModel } from '@/viewmodels';
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
    isLoading: isEmailsLoading, 
    localUpdates,
    pendingCount,
    error,
    updateLocalEmail 
  } = usePendingEmails();
  
  const isLoading = isEmailsLoading || isLocationLoading;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // 1. PRIMEIRA ETAPA CRÍTICA: Mesclar dados do servidor com atualizações locais
  const mergedEmails = useMemo(() => {
    return emails.map(email => {
      const local = localUpdates[email.id];
      
      // Sobrescreve os campos 'estado' e 'municipio' com o valor local, se existir.
      if (local) {
        return {
          ...email,
          estado: local.estado || email.estado || '', 
          municipio: local.municipio || email.municipio || '',
        } as Email; 
      }
      return email;
    });
  }, [emails, localUpdates]); 

  // 2. SEGUNDA ETAPA: Filtrar APENAS A LISTA MESTRADA
  const filteredEmails = useMemo(() => {
    return mergedEmails.filter((email) => {
      const matchesSearch = 
        email.remetente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.destinatario.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateFilter || email.data === dateFilter;
      return matchesSearch && matchesDate;
    });
  }, [mergedEmails, searchTerm, dateFilter]); 

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
    const success = await pendingEmailsViewModel.saveAllClassifications();
    if (success) {
      toast({
        title: 'Salvo com sucesso!',
        description: `${pendingCount} e-mail(s) classificado(s).`,
      });
    } else {
      const executionError = pendingEmailsViewModel.getError(); 
      toast({
        title: 'Erro ao salvar',
        description: executionError || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-muted/50 border-border/50"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 h-10 w-full sm:w-44 bg-muted/50 border-border/50"
            />
          </div>
          {dateFilter && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setDateFilter('')}
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
            <table className="min-w-full divide-y divide-border/50">
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
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[120px]">
                    Estado
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[150px]">
                    Município
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
                        <span className="text-sm text-muted-foreground">{formatDate(email.data)}</span>
                      </td>
                      <td className="px-4 py-4">
                          <Select 
                            value={selectedEstados[email.id] ?? selectedEstado} 
                            onValueChange={(value) => handleEstadoChange(email.id, value)}
                          // Desabilita o Select de Estado se a lista de estados ainda estiver carregando
                          disabled={isLocationLoading}
                        >
                          <SelectTrigger className="w-28 h-9 bg-muted/50 border-border/50">
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
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Select 
                            value={selectedMunicipios[email.id] ?? selectedMunicipio}
                            onValueChange={(value) => handleMunicipioChange(email.id, value)}
                            // Desabilita se não houver estado selecionado, se estiver carregando ou se a lista estiver vazia
                            disabled={!effectiveEstado || isLocationLoading || loadingEstados[effectiveEstado] || municipios.length === 0}
                          >
                            <SelectTrigger className="w-40 h-9 bg-muted/50 border-border/50">
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
    </MainLayout>
  );
}