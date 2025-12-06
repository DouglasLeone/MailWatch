import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import * as emailService from '@/services/emailService';
import * as locationService from '@/services/locationService';
import { 
  ArrowLeft, 
  MapPin, 
  Edit2, 
  Save, 
  X, 
  Loader2, 
  Mail, 
  User, 
  Calendar, 
  FileText,
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';

// =================================================================
// 0. DEFINIÇÕES DE TIPOS (TYPESCRIPT INTERFACES)
// =================================================================

interface Estado {
  sigla: string;
  nome: string;
}

interface Municipio {
  nome: string;
}

interface Email {
  id: string;
  remetente: string;
  destinatario: string;
  assunto: string;
  corpo: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
  classificado: boolean;
  estado: string | null;
  municipio: string | null;
}

// Tipagem para props do Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
  children: React.ReactNode;
}

// Tipagem para o Select Context
interface SelectContextType {
    value: string | null;
    onValueChange: (value: string) => void;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    open: boolean;
    disabled?: boolean;
}

// =================================================================
// 1. LISTA DE ESTADOS E MUNICÍPIOS (carregados do IBGE quando necessário)
// =================================================================
const estados: Estado[] = [
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'SC', nome: 'Santa Catarina' },
];

// =================================================================
// 2. MOCKS DE COMPONENTES UI
// =================================================================

const Button: React.FC<ButtonProps> = ({ className = '', variant = 'default', size = 'default', children, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow-md hover:shadow-lg";
  
  const variants: { [key: string]: string } = {
    default: "bg-primary text-white hover:bg-primary/90 bg-blue-600",
    outline: "border border-input bg-background hover:bg-gray-100 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-700 shadow-none",
  };

  const sizes: { [key: string]: string } = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-xl px-3",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-white text-gray-900 rounded-2xl border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

// Contexto com tipagem explícita e valor inicial definido
const SelectContext = createContext<SelectContextType | undefined>(undefined);

const Select: React.FC<{ value: string | null; onValueChange: (value: string) => void; disabled?: boolean; children: React.ReactNode }> = ({ value, onValueChange, disabled, children }) => {
    const [open, setOpen] = useState(false);
    
    const contextValue = useMemo(() => ({
        value,
        onValueChange,
        setOpen,
        open,
        disabled,
    }), [value, onValueChange, open, disabled]);

    return (
        <SelectContext.Provider value={contextValue}>
            <div className="relative">
                {children}
            </div>
        </SelectContext.Provider>
    );
};

const useSelectContext = () => {
    const context = useContext(SelectContext);
    if (context === undefined) {
        throw new Error('useSelectContext must be used within a Select');
    }
    return context;
};

const SelectTrigger: React.FC<{ className?: string; placeholder: string; children: React.ReactNode }> = ({ className = '', placeholder, children }) => {
    const { value, setOpen, disabled } = useSelectContext();
    
    return (
        <button
            // Adicionado data-select-trigger para ajudar no fechamento de cliques externos
            data-select-trigger
            className={`flex h-11 w-full items-center justify-between rounded-xl border border-input bg-white px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed ${disabled ? 'opacity-60 bg-gray-50' : 'hover:border-blue-500' } ${className}`}
            onClick={(e) => { e.preventDefault(); if (!disabled) setOpen(prev => !prev); }}
            disabled={disabled}
        >
            <span className="truncate text-left">
              {value || placeholder}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
    );
};

const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setOpen, open } = useSelectContext();

    // FIX: useEffect é chamado incondicionalmente no topo do componente.
    useEffect(() => {
        // Se não estiver aberto, não precisamos do listener.
        if (!open) return; 

        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Verifica se o clique foi fora do conteúdo e fora do gatilho
            if (!target.closest('.select-content-mock') && !target.closest('button[data-select-trigger]')) {
                setOpen(false);
            }
        };

        // Adiciona o listener
        document.addEventListener('mousedown', handleOutsideClick);
        
        // Remove o listener no cleanup
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [setOpen, open]); 
    
    // O retorno condicional vem DEPOIS do hook, o que está de acordo com as Regras de Hooks.
    if (!open) return null;

    return (
        <div className="select-content-mock absolute z-50 mt-1 w-full rounded-xl border bg-white p-1 text-popover-foreground shadow-2xl animate-in fade-in-80" 
             style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {children}
        </div>
    );
};

const SelectItem: React.FC<{ value: string; children: React.ReactNode; disabled?: boolean }> = ({ value, children, disabled = false }) => {
    const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
    const isSelected = selectedValue === value;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (disabled) return;
        onValueChange(value);
        setOpen(false);
    };

    return (
        <div 
            className={`relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-4 pr-8 text-sm outline-none transition-colors 
            ${isSelected ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'} 
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleClick}
        >
            {children}
            {isSelected && <CheckCircle2 className="ml-auto h-4 w-4 text-blue-700" />}
        </div>
    );
};

const SelectValue: React.FC<{ placeholder: string }> = ({ placeholder }) => <>{placeholder}</>;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {children}
    </div>
  </div>
);

// Mocks para Toast (Notification System)
const useToast = () => {
  const toast = ({ title, description, variant = 'default' }: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
    const style = variant === 'destructive' ? 'Erro' : 'Sucesso';
    // Não usar alert (bloqueante). Apenas logamos para desenvolvimento.
    console.log(`[TOAST - ${title} - ${style}]: ${description}`);
  };
  return { toast };
};

// =================================================================
// 3. HOOKS E VIEWMODEL
// =================================================================

const useParams = (): { id: string | undefined } => {
  // Tenta extrair o ID da URL (ex: /detalhes/12345). Se não encontrar, retorna undefined.
  if (typeof window === 'undefined') return { id: undefined };
  const parts = window.location.pathname.split('/').filter(Boolean);
  const last = parts.length ? parts[parts.length - 1] : undefined;
  return { id: last };
};
const useNavigate = () => {
  return (delta: number) => {
    // Usa a API de histórico do browser quando disponível
    if (typeof window !== 'undefined' && window.history && typeof window.history.go === 'function') {
      try {
        window.history.go(delta);
      } catch (e) {
        console.error('Falha ao navegar no histórico do browser:', e);
      }
      return;
    }

    // Fallback para ambientes sem `window` (tests/SSR)
    console.warn('window.history não disponível — navegação não realizada', delta);
  };
};

interface EmailDetailsHookResult {
  email: Email | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  isSaving: boolean;
  editingEstado: string | null;
  editingMunicipio: string | null;
  municipios: Municipio[];
  estados: Estado[];
  viewModel: {
    startEditing: () => void;
    cancelEditing: () => void;
    setEditingEstado: (value: string) => void;
    setEditingMunicipio: (value: string) => void;
    saveLocation: (emailId: string) => Promise<boolean>;
  };
}

const useEmailDetails = (id: string): EmailDetailsHookResult => {
  const [email, setEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editingEstado, setEditingEstado] = useState<string | null>(null);
  const [editingMunicipio, setEditingMunicipio] = useState<string | null>(null);
  const [municipiosList, setMunicipiosList] = useState<Municipio[]>([]);
  const [estadosList, setEstadosList] = useState<Estado[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetched = await emailService.fetchEmail(id);
        if (!mounted) return;
        setEmail(fetched);
        setEditingEstado(fetched.estado);
        setEditingMunicipio(fetched.municipio);
      } catch (e) {
        console.error('Erro ao buscar e-mail:', e);
        setError('Erro ao carregar detalhes do e-mail.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    if (id) fetchData();
    else {
      setError('ID do e-mail não fornecido.');
      setIsLoading(false);
    }

    return () => { mounted = false; };
  }, [id]);

  // Carrega lista de estados ao montar
  useEffect(() => {
    let mounted = true;
    const loadEstados = async () => {
      try {
        const list = await locationService.fetchEstados();
        if (mounted) setEstadosList(list);
      } catch (e) {
        console.error('Erro ao carregar estados:', e);
        if (mounted) setEstadosList([]);
      }
    };
    loadEstados();
    return () => { mounted = false; };
  }, []);

  // Carrega municípios quando o estado de edição mudar
  useEffect(() => {
    let mounted = true;
    const loadMunicipios = async () => {
      if (!editingEstado) {
        setMunicipiosList([]);
        return;
      }
      try {
        const list = await locationService.fetchMunicipiosPorEstado(editingEstado);
        if (mounted) setMunicipiosList(list);
      } catch (e) {
        console.error('Erro ao carregar municípios:', e);
        if (mounted) setMunicipiosList([]);
      }
    };
    loadMunicipios();
    return () => { mounted = false; };
  }, [editingEstado]);

  const viewModel = useMemo(() => ({
    startEditing: () => {
      if (email) {
        setIsEditing(true);
        setEditingEstado(email.estado);
        setEditingMunicipio(email.municipio);
      }
    },
    cancelEditing: () => {
      setIsEditing(false);
      if (email) {
        setEditingEstado(email.estado);
        setEditingMunicipio(email.municipio);
      }
    },
    setEditingEstado: (value: string) => {
      setEditingEstado(value);
      setEditingMunicipio(null);
    },
    setEditingMunicipio: (value: string) => {
      setEditingMunicipio(value);
    },
    saveLocation: async (emailId: string) => {
      if (!editingEstado) {
        console.error('Estado é obrigatório para salvar a localização.');
        return false;
      }
      setIsSaving(true);
      try {
        const updated = await emailService.classificarEmail(emailId, {
          estado: editingEstado || undefined,
          municipio: editingMunicipio || undefined,
        });

        setEmail(prev => prev ? ({ ...prev, ...updated }) : updated);
        setIsEditing(false);
        setIsSaving(false);
        return true;
      } catch (e) {
        console.error('Falha ao salvar localização:', e);
        setIsSaving(false);
        return false;
      }
    }
  }), [email, editingEstado, editingMunicipio]);

  return {
    email,
    isLoading,
    error,
    isEditing,
    isSaving,
    editingEstado,
    editingMunicipio,
    viewModel,
    municipios: municipiosList,
    estados: estadosList,
  } as EmailDetailsHookResult;
};

// =================================================================
// 4. COMPONENTE PRINCIPAL (DetalhesEmail.tsx)
// =================================================================

export default function DetalhesEmail() {
  // Chamadas de Hooks (ocorrem ANTES de qualquer retorno condicional)
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    email, 
    isLoading, 
    error, 
    isEditing, 
    isSaving,
    editingEstado,
    editingMunicipio,
    viewModel,
    municipios,
    estados
  } = useEmailDetails(id || '');


  const formatDateTime = useCallback((dateStr: string, hora: string): string => {
    try {
      const date = new Date(`${dateStr}T${hora}:00`); 
      if (isNaN(date.getTime())) {
          const dateOnly = new Date(dateStr.replace(/-/g, '/'));
          if (isNaN(dateOnly.getTime())) return "Data/Hora Inválida";
          return `${dateOnly.toLocaleDateString('pt-BR', { 
            weekday: 'long',
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })} às ${hora}`;
      }

      return `${date.toLocaleDateString('pt-BR', { 
        weekday: 'long',
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      })} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return `${dateStr} às ${hora}`;
    }
  }, []);

  const getLocalDisplay = useCallback((estado: string | null, municipio: string | null): string | null => {
    if (!estado && !municipio) return null;
    if (estado && municipio) return `${municipio}, ${estado}`;
    return estado || municipio;
  }, []);

  const handleStartEdit = () => {
    viewModel.startEditing();
  };

  const handleCancelEdit = () => {
    viewModel.cancelEditing();
  };

  const handleSaveLocation = async () => {
    if (!id) return;
    
    if (!editingEstado || !editingMunicipio) {
        toast({
            title: 'Preenchimento obrigatório',
            description: 'Selecione o Estado e o Município antes de salvar.',
            variant: 'destructive',
        });
        return;
    }

    const success = await viewModel.saveLocation(id);
    if (success) {
      toast({
        title: 'Localização atualizada!',
        description: 'As alterações foram salvas com sucesso.',
      });
      // Volta para a página anterior após salvar com sucesso
      try {
        navigate(-1);
      } catch (e) {
        console.error('Erro ao navegar após salvar:', e);
      }
    } else {
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleEstadoChange = (value: string) => {
    viewModel.setEditingEstado(value);
  };

  const handleMunicipioChange = (value: string) => {
    viewModel.setEditingMunicipio(value);
  };

  // Retornos Condicionais (ocorrem DEPOIS das chamadas de Hooks)
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-700">Carregando detalhes...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !email) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <Mail className="h-7 w-7 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">E-mail não encontrado</h3>
          <p className="text-sm text-gray-500 mb-6">{error || 'Este registro não existe ou foi removido'}</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="border-gray-300 hover:bg-gray-100">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </MainLayout>
    );
  }

  const location = getLocalDisplay(email.estado, email.municipio);

  return (
    <MainLayout>
      <div className="mb-6 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-xl hover:bg-gray-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Detalhes do E-mail
          </h1>
        </div>
        
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
          email.classificado 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        } shadow-md`}>
          {email.classificado ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Classificado
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              Pendente
            </>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Conteúdo Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-200 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              {/* Seção de Cabeçalho */}
              <div className="border-b border-gray-200 bg-gray-50/50 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{email.assunto}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Remetente</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{email.remetente}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                      <Mail className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Destinatário</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{email.destinatario}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Data */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-base text-gray-600 font-medium">
                  Recebido em: {formatDateTime(email.data, email.hora)}
                </span>
              </div>
              
              {/* Corpo */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-gray-600">
                    Conteúdo da Mensagem
                  </span>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-6 max-h-[420px] overflow-auto">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base break-words max-w-full">
                    {email.corpo && email.corpo.toString().trim() !== '' ? (
                      email.corpo
                    ) : (
                      <span className="text-gray-500 italic">Nenhuma mensagem</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra Lateral */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-gray-200 shadow-xl sticky top-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                  <MapPin className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-gray-900">Localização</h3>
                  <p className="mb-2 text-sm text-gray-500">Classificação geográfica da demanda</p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Estado (UF)
                    </label>
                    <Select 
                      value={editingEstado} 
                      onValueChange={handleEstadoChange}
                      disabled={isSaving}
                    >
                      <SelectTrigger placeholder="Selecione o Estado">
                        <SelectValue placeholder="Selecione o Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((estado) => (
                          <SelectItem key={estado.sigla} value={estado.sigla}>
                            {estado.sigla} - {estado.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Município
                    </label>
                    <Select 
                      value={editingMunicipio}
                      onValueChange={handleMunicipioChange}
                      disabled={isSaving || !editingEstado}
                    >
                      <SelectTrigger placeholder={editingEstado ? "Selecione o Município" : "Selecione um Estado primeiro"}>
                        <SelectValue placeholder={editingEstado ? "Selecione o Município" : "Selecione um Estado primeiro"} />
                      </SelectTrigger>
                      <SelectContent>
                        {municipios.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500 flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                <span>Nenhum município encontrado.</span>
                            </div>
                        ) : (
                            municipios.map((municipio) => (
                                <SelectItem key={municipio.nome} value={municipio.nome}>
                                    {municipio.nome}
                                </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    {!editingEstado && (
                        <p className="text-xs text-red-500">Selecione um estado para carregar os municípios.</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEdit} 
                      disabled={isSaving}
                      className="text-gray-600 hover:bg-gray-100"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSaveLocation} 
                      disabled={isSaving || !editingEstado || !editingMunicipio}
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-start rounded-xl bg-gray-50 p-4 border border-gray-200">
                    <p className="text-lg font-semibold text-gray-800 leading-snug">
                      {location || <span className="text-gray-500 italic">Localização não classificada.</span>}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleStartEdit}
                      className="shrink-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 ml-4"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 flex items-start gap-2 pt-2">
                    <Info className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                    <span>Edite para classificar a demanda por Estado/Município</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}