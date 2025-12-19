// Types para o sistema de gestão de e-mails

export interface Email {
  id: string;
  remetente: string;
  destinatario: string;
  data: string;
  hora: string;
  assunto: string;
  corpo: string;
  estado: string | null;
  municipio: string | null;
  classificado: boolean;
}

export interface DashboardStats {
  total: number;
  classificados: number;
  pendentes: number;
}

export interface EmailsPorEstado {
  estado: string;
  quantidade: number;
}

export interface TendenciaDiaria {
  dia: string;
  quantidade: number;
}

export interface TopDestinatario {
  destinatario: string;
  quantidade: number;
}

export interface DashboardData {
  stats: DashboardStats;
  emailsPorEstado: EmailsPorEstado[];
  tendencia: TendenciaDiaria[];
  topDestinatarios: TopDestinatario[];
}

export interface User {
  id: string;
  email: string;
  password: string;
  nome: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface Estado {
  sigla: string;
  nome: string;
}

export interface Municipio {
  nome: string;
  estado: string;
}
