// Página Dashboard - Design Premium
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Users,
  Activity,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { MainLayout } from '@/layouts/MainLayout';
import { StatsCard } from '@/components/StatsCard';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/hooks/useEmails';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm px-3 py-2 shadow-lg">
          <p className="text-xs font-medium text-foreground">{label}</p>
          <p className="text-sm font-bold text-primary">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Dashboard" 
        description={`Bem-vindo de volta! Aqui está o resumo de hoje, ${today}`}
      />

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total de E-mails"
          value={isLoading ? '...' : data?.stats.total || 0}
          icon={<Mail className="h-5 w-5" />}
          variant="primary"
          delay={0}
          subtitle="Registros no sistema"
        />
        <StatsCard
          title="Classificados"
          value={isLoading ? '...' : data?.stats.classificados || 0}
          icon={<CheckCircle2 className="h-5 w-5" />}
          variant="success"
          delay={100}
          subtitle="vs. semana passada"
        />
        <StatsCard
          title="Pendentes"
          value={isLoading ? '...' : data?.stats.pendentes || 0}
          icon={<Clock className="h-5 w-5" />}
          variant="warning"
          delay={200}
          subtitle="Aguardando classificação"
        />
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Bar Chart - E-mails por Estado */}
        <Card className="border-border/50 shadow-card animate-slide-up overflow-hidden" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-base font-semibold">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                E-mails por Estado
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-40 w-full animate-shimmer rounded-lg" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.emailsPorEstado || []} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="estado" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                    <Bar 
                      dataKey="quantidade" 
                      fill="hsl(var(--primary))" 
                      radius={[6, 6, 0, 0]}
                      name="Quantidade"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Area Chart - Tendência */}
        <Card className="border-border/50 shadow-card animate-slide-up overflow-hidden" style={{ animationDelay: '400ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-base font-semibold">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                Tendência - Últimos 7 dias
              </CardTitle>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Atualizado agora
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-40 w-full animate-shimmer rounded-lg" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.tendencia || []}>
                    <defs>
                      <linearGradient id="colorQuantidade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="dia" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="quantidade" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorQuantidade)"
                      name="E-mails"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Destinatários */}
        <Card className="lg:col-span-2 border-border/50 shadow-card animate-slide-up" style={{ animationDelay: '500ms' }}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-base font-semibold">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/10">
                  <Users className="h-4 w-4 text-warning" />
                </div>
                Top 3 Destinatários
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-shimmer rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data?.topDestinatarios.map((dest, index) => (
                  <div
                    key={dest.destinatario}
                    className="group flex items-center gap-4 rounded-xl border border-border/50 bg-muted/30 p-4 transition-all duration-200 hover:bg-muted/50 hover:border-border"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      index === 0 ? 'bg-gradient-to-br from-warning to-warning/70 text-warning-foreground' :
                      index === 1 ? 'bg-muted text-muted-foreground' :
                      'bg-muted/70 text-muted-foreground/70'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{dest.destinatario}</p>
                      <p className="text-xs text-muted-foreground">Destinatário frequente</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
                        {dest.quantidade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50 shadow-card animate-slide-up" style={{ animationDelay: '600ms' }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-base font-semibold">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info/10">
                <Zap className="h-4 w-4 text-info" />
              </div>
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full h-14 justify-between border-border/50 hover:bg-warning/5 hover:border-warning/30 hover:text-warning group transition-all"
              onClick={() => navigate('/pendentes')}
            >
              <span className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-warning" />
                <div className="text-left">
                  <p className="font-medium">Ver Pendentes</p>
                  <p className="text-xs text-muted-foreground">Classificar e-mails</p>
                </div>
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button 
              className="w-full h-14 justify-between bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 group"
              onClick={() => navigate('/cadastro-manual')}
            >
              <span className="flex items-center gap-3">
                <PlusCircle className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Novo E-mail</p>
                  <p className="text-xs opacity-80">Cadastro manual</p>
                </div>
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
