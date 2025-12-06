// Página Lista Geral - Design Premium estilo Notion/Linear
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Eye, Mail, MapPin, ChevronRight, Inbox } from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { PageHeader } from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEmails } from '@/hooks/useEmails';

export default function ListaGeral() {
  const navigate = useNavigate();
  const { emails, isLoading } = useEmails();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendentes' | 'classificados'>('all');
  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      const matchesSearch = 
        email.remetente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.destinatario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.assunto.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateFilter || email.data === dateFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pendentes' && !email.classificado) ||
        (statusFilter === 'classificados' && !!email.classificado);

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [emails, searchTerm, dateFilter, statusFilter]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
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

  return (
    <MainLayout>
      <PageHeader 
        title="Histórico de E-mails" 
        description="Visualize e gerencie todos os e-mails registrados no sistema"
        badge={{ text: `${emails.length} registros`, variant: 'primary' }}
      />

      {/* Search & Filters */}
      <Card className="mb-6 border-border/50 shadow-card animate-fade-in">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por remetente, destinatário ou assunto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-muted/50 border-border/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Button
                size="sm"
                variant={statusFilter === 'all' ? 'default' : 'ghost'}
                className="h-8 px-3"
                onClick={() => setStatusFilter('all')}
              >
                Todos
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'pendentes' ? 'default' : 'ghost'}
                className="h-8 px-3"
                onClick={() => setStatusFilter('pendentes')}
              >
                Pendentes
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'classificados' ? 'default' : 'ghost'}
                className="h-8 px-3"
                onClick={() => setStatusFilter('classificados')}
              >
                Classificados
              </Button>
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
                            {formatDate(email.data)}
                          </span>
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
    </MainLayout>
  );
}
