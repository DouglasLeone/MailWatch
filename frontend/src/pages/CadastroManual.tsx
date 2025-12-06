// Página de Cadastro Manual - Design Premium (MVVM) + API Real

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User, FileText, MapPin, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MainLayout } from '@/layouts/MainLayout';
import { PageHeader } from '@/components/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { useCadastroManualForm } from '@/hooks/useFormViewModels';
import { fetchEstados, fetchMunicipiosPorEstado } from '@/services/locationService';

// Interfaces para os dados de localização
interface Estado { id?: number; sigla: string; nome: string; codigo?: number; codigo_ibge?: number }
interface Municipio { nome: string; }

export default function CadastroManual() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados de localização
  const [estados, setEstados] = useState([] as Estado[]);
  const [municipiosCache, setMunicipiosCache] = useState({} as Record<string, Municipio[]>);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null as string | null);

  // Hook do Formulário
  const { 
    formData, 
    errors, 
    isLoading: isFormSubmitting, 
    handleChange, 
    handleSubmit, 
    resetForm 
  } = useCadastroManualForm();

  // Carrega estados ao montar o componente
  useEffect(() => {
    async function loadLocationData() {
      try {
        const fetchedEstados = await fetchEstados();
        setEstados(fetchedEstados);
        setLocationError(null);
      } catch (e) {
        console.error('Erro ao carregar estados:', e);
        setLocationError('Não foi possível carregar a lista de estados do IBGE.');
      } finally {
        setIsLocationLoading(false);
      }
    }
    loadLocationData();
  }, []);

  // Carrega municípios com cache. Tenta usar a sigla, mas se o objeto de estado
  // conter `id` (como vem do IBGE), usamos esse id na chamada para evitar falhas
  // quando a API espera o identificador numérico.
  const loadAndCacheMunicipios = async (estadoSigla: string) => {
    // evita refazer fetch se já cacheado
    if (municipiosCache[estadoSigla]) return;

    setIsLocationLoading(true);
    try {
      // procura o objeto de estado para pegar um possível `id`
      const estadoObj = estados.find((s: any) => s.sigla === estadoSigla);
      const ufParam = estadoObj && (estadoObj.id || estadoObj.codigo || estadoObj.codigo_ibge) ? (estadoObj.id ?? estadoObj.codigo ?? estadoObj.codigo_ibge) : estadoSigla;

      const fetchedMunicipios = await fetchMunicipiosPorEstado(String(ufParam));

      setMunicipiosCache((prev: Record<string, Municipio[]>) => ({
        ...prev,
        [estadoSigla]: fetchedMunicipios,
      }));
      setLocationError(null);
    } catch (e) {
      console.error(`Erro ao carregar municípios para ${estadoSigla}:`, e);
      setLocationError(`Não foi possível carregar os municípios para ${estadoSigla}.`);
      toast({
        title: 'Erro de Localização',
        description: `Não foi possível carregar os municípios para ${estadoSigla}.`,
        variant: 'destructive',
      });
    } finally {
      setIsLocationLoading(false);
    }
  };
  
  // Obtém municípios do cache
  const currentMunicipios = useMemo(() => {
    return municipiosCache[formData.estado] || [];
  }, [municipiosCache, formData.estado]);

  // Handler para mudança de estado
  const handleEstadoChange = (estadoSigla: string) => {
    handleChange('estado', estadoSigla);
    handleChange('municipio', '');
    
    if (estadoSigla) {
      loadAndCacheMunicipios(estadoSigla);
    }
  };

  // Handler de submissão com integração à API
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormSubmitting) return;
    
    try {
      const result = await handleSubmit();
      const success = typeof result === 'object' ? result.ok : Boolean(result);
      const errorMessage = typeof result === 'object' ? result.error : undefined;
      if (success) {
        toast({
          title: 'E-mail cadastrado!',
          description: 'O registro foi salvo com sucesso na API.',
        });
        resetForm();
        navigate('/lista-geral');
      } else {
        toast({
          title: 'Erro ao cadastrar',
          description: errorMessage || 'Verifique os dados e tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro durante submissão:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao tentar salvar. Tente novamente.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <MainLayout>
      <PageHeader 
        title="Novo E-mail Manual" 
        description="Preencha as informações do e-mail para registro no sistema"
      />

      {locationError && (
        <div className="p-4 mb-6 text-center bg-destructive/10 border border-destructive/30 rounded-lg max-w-2xl mx-auto">
          <AlertCircle className="h-5 w-5 text-destructive inline mr-2" />
          <p className="text-sm text-destructive font-medium">{locationError}</p>
        </div>
      )}

      <Card className="max-w-2xl mx-auto border-border/50 shadow-card animate-slide-up">
        <CardContent className="pt-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Section: Informações do E-mail */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Mail className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Informações do E-mail</h3>
              </div>
              
              {/* Remetente */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Remetente <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="remetente@empresa.com"
                    value={formData.remetente}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('remetente', e.target.value)}
                    disabled={isFormSubmitting}
                    className="pl-10 h-11 bg-muted/50 border-border/50"
                  />
                </div>
                {errors.remetente && (
                  <p className="text-xs text-destructive">{errors.remetente}</p>
                )}
              </div>

              {/* Destinatário */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Destinatário <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="destinatario@email.com"
                    value={formData.destinatario}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('destinatario', e.target.value)}
                    disabled={isFormSubmitting}
                    className="pl-10 h-11 bg-muted/50 border-border/50"
                  />
                </div>
                {errors.destinatario && (
                  <p className="text-xs text-destructive">{errors.destinatario}</p>
                )}
              </div>

              {/* Data e Hora */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Data</label>
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('data', e.target.value)}
                    disabled={isFormSubmitting}
                    className="h-11 bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Hora</label>
                  <Input
                    type="time"
                    value={formData.hora}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('hora', e.target.value)}
                    disabled={isFormSubmitting}
                    className="h-11 bg-muted/50 border-border/50"
                  />
                </div>
              </div>
            </div>

            {/* Section: Conteúdo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Conteúdo</h3>
              </div>

              {/* Assunto */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Assunto <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Assunto do e-mail"
                  value={formData.assunto}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('assunto', e.target.value)}
                  disabled={isFormSubmitting}
                  className="h-11 bg-muted/50 border-border/50"
                />
                {errors.assunto && (
                  <p className="text-xs text-destructive">{errors.assunto}</p>
                )}
              </div>

              {/* Corpo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Corpo da mensagem <span className="text-destructive">*</span>
                </label>
                <textarea
                  placeholder="Digite o conteúdo do e-mail..."
                  value={formData.corpo}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('corpo', e.target.value)}
                  disabled={isFormSubmitting}
                  rows={5}
                  className="flex w-full rounded-xl border border-border/50 bg-muted/50 px-4 py-3 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
                {errors.corpo && (
                  <p className="text-xs text-destructive">{errors.corpo}</p>
                )}
              </div>
            </div>

            {/* Section: Localização */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Localização</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Estado */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Estado (UF) <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => handleEstadoChange(e.target.value)}
                    disabled={isFormSubmitting || isLocationLoading}
                    className="flex w-full rounded-xl border border-border/50 bg-muted/50 px-4 py-3 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecione um estado...</option>
                    {estados.map((estado) => (
                      <option key={estado.sigla} value={estado.sigla}>
                        {estado.nome}
                      </option>
                    ))}
                  </select>
                  {errors.estado && (
                    <p className="text-xs text-destructive">{errors.estado}</p>
                  )}
                </div>

                {/* Município */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Município <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.municipio}
                    onChange={(e) => handleChange('municipio', e.target.value)}
                    disabled={isFormSubmitting || !formData.estado || isLocationLoading}
                    className="flex w-full rounded-xl border border-border/50 bg-muted/50 px-4 py-3 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLocationLoading ? (
                      <option value="">Carregando municípios...</option>
                    ) : currentMunicipios.length === 0 ? (
                      <option value="">Nenhum município encontrado</option>
                    ) : (
                      <>
                        <option value="">Selecione um município...</option>
                        {currentMunicipios.map((municipio) => (
                          <option key={municipio.nome} value={municipio.nome}>
                            {municipio.nome}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {errors.municipio && (
                    <p className="text-xs text-destructive">{errors.municipio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button 
                type="submit" 
                disabled={isFormSubmitting}
                className="h-11 px-6 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
              >
                {isFormSubmitting ? 'Salvando...' : 'Salvar E-mail'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                disabled={isFormSubmitting}
                className="h-11"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
