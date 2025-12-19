// Página Lista Geral - Design Premium estilo Notion/Linear
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Calendar, Eye, Mail, MapPin, ChevronRight, Inbox, Trash2, Download } from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { PageHeader } from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEmails } from '@/hooks/useEmails';
import * as locationService from '@/services/locationService';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function ListaGeral() {
  const navigate = useNavigate();
  const { emails, filteredEmails, isLoading, refetch, setFilter, searchTerm, dateFilter, statusFilter, deleteEmail } = useEmails();
  const { toast } = useToast();
  
  // filters are managed by the ViewModel
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [localDateFilter, setLocalDateFilter] = useState(dateFilter);
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);
  const [localEstadoFilter, setLocalEstadoFilter] = useState('');
  const [localMunicipioFilter, setLocalMunicipioFilter] = useState('');
  const [estados, setEstados] = useState<Array<{ sigla: string; nome: string }>>([]);
  const [municipios, setMunicipios] = useState<Array<{ nome: string }>>([]);

  // sync from ViewModel
  useEffect(() => setLocalSearch(searchTerm), [searchTerm]);
  useEffect(() => setLocalDateFilter(dateFilter), [dateFilter]);
  useEffect(() => setLocalStatusFilter(statusFilter), [statusFilter]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fetched = await locationService.fetchEstados();
        if (!cancelled) setEstados(fetched as Array<{ sigla: string; nome: string }>);
      } catch (e) {
        if (!cancelled) setEstados([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Read URL params to apply deep links from Dashboard
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const uf = params.get('estado');
    const municipio = params.get('municipio');

    if (status) {
      setLocalStatusFilter(status as any);
      setFilter('', '', status as any);
    } else if (uf) {
      setLocalEstadoFilter(uf);
      // fetch municipios and then set filter
      (async () => {
        try {
          const fetched = await locationService.fetchMunicipiosPorEstado(uf);
          setMunicipios(fetched as Array<{ nome: string }>);
        } catch (e) {
          setMunicipios([]);
        }
        setFilter('', '', uf, municipio || '');
      })();
    }
  }, [location.search]);
  const filtered = filteredEmails;

  const formatDate = (dateStr: string, hora?: string) => {
    // Preferir data+hora quando disponível para evitar erros de timezone
    let date: Date;
    if (hora) {
      // Construímos uma string compatível ISO sem timezone, o construtor interpretará como local
      date = new Date(`${dateStr}T${hora}:00`);
      if (isNaN(date.getTime())) {
        // Fallback: força parse local substituindo '-' por '/'
        date = new Date(dateStr.replace(/-/g, '/'));
      }
    } else {
      date = new Date(dateStr.replace(/-/g, '/'));
    }

    // Calcular diferença em dias considerando apenas a parte de data (meia-noite local)
    const now = new Date();
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateMid = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((todayMid.getTime() - dateMid.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getLocalDisplay = (estado: string | null, municipio: string | null) => {
    if (!estado && !municipio) return null;
    if (estado && municipio) return `${estado} / ${municipio}`;
    return estado || municipio;
  };

  const handleViewDetails = (id: string) => {
    navigate(`/detalhes/${id}`);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const openDeleteDialog = (id: string) => {
    setSelectedDeleteId(id);
    setConfirmOpen(true);
  };

  const handleExport = () => {
    const rows = [
      ['Remetente', 'Destinatário', 'Assunto', 'Data', 'Estado', 'Município', 'Corpo'].join(';'),
      ...filtered.map(e => [
        e.remetente,
        e.destinatario,
        e.assunto,
        e.data,
        e.estado || '',
        e.municipio || '',
        (e.corpo || '').toString().replace(/\n/g, '\\n')
      ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(';'))
    ].join('\n');

    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const onConfirmDelete = async () => {
    if (!selectedDeleteId) return;
    try {
      const ok = await deleteEmail(selectedDeleteId);
      if (ok) {
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

  return (
    <MainLayout>
      <PageHeader 
        title="Histórico de E-mails" 
        description="Visualize e gerencie todos os e-mails registrados no sistema"
        badge={{ text: `${emails.length} registros`, variant: 'primary' }}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} className="h-10">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        }
      />

      {/* Search & Filters */}
      <Card className="mb-6 border-border/50 shadow-card animate-fade-in">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por remetente, destinatário ou assunto..."
              value={localSearch}
              onChange={(e) => {
                const v = e.target.value;
                setLocalSearch(v);
                setFilter(v, localDateFilter, localStatusFilter);
              }}
              className="pl-10 h-10 bg-muted/50 border-border/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Button
                size="sm"
                variant={localStatusFilter === 'all' ? 'default' : 'ghost'}
                className="h-8 px-3"
                onClick={() => { setLocalStatusFilter('all'); setFilter(localSearch, localDateFilter, 'all'); }}
              >
                Todos
              </Button>
              <Button
                size="sm"
                variant={localStatusFilter === 'pendentes' ? 'default' : 'ghost'}
                className="h-8 px-3"
                onClick={() => { setLocalStatusFilter('pendentes'); setFilter(localSearch, localDateFilter, 'pendentes'); }}
              >
                Pendentes
              </Button>
              <Button
                size="sm"
                variant={localStatusFilter === 'classificados' ? 'default' : 'ghost'}
                className="h-8 px-3"
                onClick={() => { setLocalStatusFilter('classificados'); setFilter(localSearch, localDateFilter, 'classificados'); }}
              >
                Classificados
              </Button>
            </div>
            {/* Estado / Município filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
                <select
                  className="h-10 w-full sm:w-28 rounded-md border bg-muted/50 px-2 text-sm"
                  value={localEstadoFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLocalEstadoFilter(v);
                    setLocalMunicipioFilter('');
                    // fetch municipios for this estado
                    if (v) {
                      locationService.fetchMunicipiosPorEstado(v).then(setMunicipios).catch(() => setMunicipios([]));
                    } else {
                      setMunicipios([]);
                    }
                    setFilter(localSearch, localDateFilter, v, '');
                  }}
                >
                  <option value="">UF</option>
                  {estados.map((e) => (
                    <option key={e.sigla} value={e.sigla}>{e.sigla}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
                <select
                  className="h-10 w-full sm:w-40 rounded-md border bg-muted/50 px-2 text-sm"
                  value={localMunicipioFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLocalMunicipioFilter(v);
                    setFilter(localSearch, localDateFilter, localEstadoFilter, v);
                  }}
                  disabled={!localEstadoFilter}
                >
                  <option value="">Município</option>
                  {municipios.map(m => <option key={m.nome} value={m.nome}>{m.nome}</option>)}
                </select>
              </div>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={localDateFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setLocalDateFilter(v);
                  setFilter(localSearch, v, localStatusFilter, localMunicipioFilter || localEstadoFilter);
                }}
                className="pl-10 h-10 w-full sm:w-44 bg-muted/50 border-border/50"
              />
            </div>
            {localDateFilter && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => { setLocalDateFilter(''); setFilter(localSearch, '', localStatusFilter); }}
                className="h-10 px-3"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Email List - Card Style */}
      <div className="space-y-2 animate-slide-up">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-border/50">
                <div className="p-4">
                  <div className="h-16 animate-shimmer rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredEmails.length === 0 ? (
          <Card className="border-border/50 shadow-card">
            <div className="p-12 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Inbox className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Nenhum e-mail encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Tente ajustar os filtros de busca ou cadastre um novo e-mail
              </p>
            </div>
          </Card>
        ) : (
          filteredEmails.map((email, index) => {
            const location = getLocalDisplay(email.estado, email.municipio);
            return (
              <Card 
                key={email.id} 
                className="group border-border/50 shadow-xs hover:shadow-card hover:border-border transition-all duration-200 cursor-pointer animate-fade-in overflow-hidden"
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => handleViewDetails(email.id)}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {email.assunto}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span className="truncate">{email.remetente}</span>
                            <span>→</span>
                            <span className="truncate">{email.destinatario}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(email.data, email.hora)}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(email.id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog(email.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center gap-3 mt-3">
                        {location ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {location}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                            Pendente
                          </span>
                        )}
                        {email.classificado && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                            Classificado
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 hidden sm:block" />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Footer Counter */}
      {!isLoading && filteredEmails.length > 0 && (
        <div className="mt-6 text-center">
          <span className="text-sm text-muted-foreground">
            Exibindo {filteredEmails.length} de {emails.length} e-mails
          </span>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir e-mail"
        description="Tem certeza que deseja excluir este e-mail? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={onConfirmDelete}
      />
    </MainLayout>
  );
}
