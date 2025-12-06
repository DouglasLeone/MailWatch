import type { Email } from '../types/email';

const API_URL = "https://api-webhook-1jd2.onrender.com";
const API_KEY = import.meta.env.VITE_API_KEY;

const headers = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY
};

/**
 * Mapeia o objeto retornado pela API para o modelo Email do frontend
 */
function mapApiToEmail(data: any): Email {
  const id = String(data.id ?? '');
  const remetente = String(data.remetente ?? data.from ?? '');
  const destinatario = String(data.destinatario ?? data.to ?? '');
  const assunto = String(data.assunto ?? '');

  // 🎯 Corpo REAL vindo da sua API
  const corpo = String(
    data.corpoMensagem ??      // principal
    data.corpo ??              // fallback
    data.body ??               // fallback
    data.content ??            // fallback
    data.message ??            // fallback
    data.text ??               // fallback
    ""
  );

  // Datas
  let dataStr = "";
  let horaStr = "";
  const createdAt = data.createdAt ?? data.dataEnvio;

  if (createdAt) {
    const dt = new Date(String(createdAt));
    // store date as ISO YYYY-MM-DD so UI formatting functions can reliably parse it
    dataStr = dt.toISOString().slice(0, 10);
    // keep localized hour for display
    horaStr = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  // Normalize estado to 2-letter UF where possible
  const rawEstado = data.estado ?? data.uf ?? null;
  const normalizedEstado = normalizeEstado(String(rawEstado ?? '').trim() || null);

  return {
    id,
    remetente,
    destinatario,
    assunto,
    corpo,
    data: dataStr,
    hora: horaStr,
    estado: normalizedEstado,
    municipio: data.municipio ?? null,
    classificado: data.status === 'CLASSIFICADO' || Boolean(data.classificado)
  };
}

/* ============================================================
   ======================   FETCHERS   =========================
   ============================================================ */
// Map full state names to their UF codes
const STATE_NAME_TO_UF: Record<string, string> = {
  'acre': 'AC','alagoas': 'AL','amapa': 'AP','amazonas': 'AM','bahia': 'BA','ceara': 'CE','ceará': 'CE','distrito federal': 'DF','espirito santo': 'ES','espírito santo': 'ES','goias': 'GO','goiás': 'GO','maranhao': 'MA','maranhão': 'MA','mato grosso': 'MT','mato grosso do sul': 'MS','minas gerais': 'MG','para': 'PA','pará': 'PA','paraiba': 'PB','paraíba': 'PB','parana': 'PR','paraná': 'PR','pernambuco': 'PE','piaui': 'PI','piauí': 'PI','rio de janeiro': 'RJ','rio grande do norte': 'RN','rio grande do sul': 'RS','rondonia': 'RO','rondônia': 'RO','roraima': 'RR','santa catarina': 'SC','sao paulo': 'SP','são paulo': 'SP','sergipe': 'SE','tocantins': 'TO'
};

function normalizeEstado(value: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (v.length === 2) return v.toUpperCase();
  const lower = v.toLowerCase();
  // remove accents and normalize common variations
  const simple = lower.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  if (STATE_NAME_TO_UF[simple]) return STATE_NAME_TO_UF[simple];
  // also handle cases like 'Piauí, PI' or 'PI - Piauí'
  const match = v.match(/([A-Za-z]{2})\b/);
  if (match) return match[1].toUpperCase();
  return null;
}

function parseIsoDateToLocal(dateStr: string): Date | null {
  if (!dateStr) return null;
  // if format is YYYY-MM-DD, construct local date to avoid timezone shift
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const day = parseInt(m[3], 10);
    return new Date(year, month, day);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d;
}

/** Buscar histórico completo */
export async function fetchHistorico(): Promise<Email[]> {
  const res = await fetch(`${API_URL}/api/emails`, { headers });
  if (!res.ok) throw new Error("Erro ao buscar histórico");

  const data = await res.json();
  return Array.isArray(data) ? data.map(mapApiToEmail) : [];
}

/** Buscar e-mails pendentes */
export async function fetchPendentes(): Promise<Email[]> {
  const res = await fetch(`${API_URL}/api/emails/pendentes`, { headers });
  if (!res.ok) throw new Error("Erro ao buscar pendentes");

  const data = await res.json();
  return Array.isArray(data) ? data.map(mapApiToEmail) : [];
}

/** Buscar e-mail por ID */
export async function fetchEmail(id: string): Promise<Email> {
  const res = await fetch(`${API_URL}/api/emails/${id}`, { headers });
  if (!res.ok) throw new Error("Erro ao buscar e-mail");

  const data = await res.json();
  return mapApiToEmail(data);
}

/** Classificar e-mail */
type ClassificationPayload = { estado?: string; municipio?: string };

export async function classificarEmail(id: string, payload: ClassificationPayload): Promise<Email> {
  const res = await fetch(`${API_URL}/api/emails/classificar/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Erro ao classificar e-mail");

  const data = await res.json();
  return mapApiToEmail(data);
}

/** Classificar vários e-mails */
export async function saveMultipleClassifications(updates: { id: string, estado: string, municipio: string }[]): Promise<void> {
  for (const update of updates) {
    await classificarEmail(update.id, {
      estado: update.estado,
      municipio: update.municipio,
    });
  }
}

/** Criar e-mail manualmente */
export async function criarEmail(data: Omit<Email, "id">): Promise<Email> {
  const res = await fetch(`${API_URL}/api/emails/manual`, {
    method: "POST",
    headers,
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Erro ao criar email: ${res.status} ${txt}`);
  }

  const payload = await res.json();
  return mapApiToEmail(payload);
}

/** Dashboard (agregação local caso API não tenha endpoint) */
export async function getDashboardData() {
  try {
    const res = await fetch(`${API_URL}/api/dashboard`, { headers });
    if (res.ok) return await res.json();
  } catch (_err) {
     console.debug("Dashboard API indisponível, usando fallback.", _err);
  }

  // Fallback: buscar todos os e-mails e agregar localmente
  try {
    const emailsRes = await fetch(`${API_URL}/api/emails`, { headers });
    if (!emailsRes.ok) {
      throw new Error("Erro ao buscar e-mails para agregação");
    }

    const emailsData = await emailsRes.json();
    const emails: Email[] = Array.isArray(emailsData) ? emailsData.map(mapApiToEmail) : [];

    // Agregar dados
    const total = emails.length;
    const classificados = emails.filter(e => e.classificado).length;
    const pendentes = total - classificados;

    // Agrupar por estado (normaliza variações como 'Piauí' / 'PI')
    const removeDiacritics = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

    const fullNameToSigla: Record<string, string> = {
      'acre': 'AC','alagoas': 'AL','amapa': 'AP','amazonas': 'AM','bahia': 'BA','ceara': 'CE','distrito federal': 'DF','espirito santo': 'ES','goias': 'GO','maranhao': 'MA','mato grosso': 'MT','mato grosso do sul': 'MS','minas gerais': 'MG','para': 'PA','paraiba': 'PB','parana': 'PR','pernambuco': 'PE','piaui': 'PI','rio de janeiro': 'RJ','rio grande do norte': 'RN','rio grande do sul': 'RS','rondonia': 'RO','roraima': 'RR','santa catarina': 'SC','sao paulo': 'SP','sergipe': 'SE','tocantins': 'TO'
    };

    const emailsPorEstado: Record<string, number> = {};
    emails.forEach(email => {
      if (!email.estado) return;
      const raw = String(email.estado).trim();
      const normalized = removeDiacritics(raw);

      let sigla = '';
      // Se já for sigla (2 letras), usa uppercase
      if (/^[a-z]{2}$/.test(normalized)) {
        sigla = normalized.toUpperCase();
      } else if (fullNameToSigla[normalized]) {
        sigla = fullNameToSigla[normalized];
      } else {
        // tenta extrair possível sigla do início (ex: 'Piauí (PI)')
        const m = raw.match(/\(([A-Za-z]{2})\)/);
        if (m) sigla = m[1].toUpperCase();
        else sigla = raw; // fallback: usa o valor original
      }

      emailsPorEstado[sigla] = (emailsPorEstado[sigla] || 0) + 1;
    });

  const total = emails.length;
  const classificados = emails.filter(e => e.classificado || (e.estado && e.municipio)).length;
  const pendentes = total - classificados;

  const emailsPorEstado: Record<string, number> = {};
  emails.forEach(email => {
    if (!email.estado) return;
    emailsPorEstado[email.estado] = (emailsPorEstado[email.estado] || 0) + 1;
  });

  // Tendência últimos 7 dias (inicializa mapa de dias)
  const tendencia: { dia: string; quantidade: number }[] = [];
  const map: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const key = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    map[key] = 0;
  }

  // Conta por dia usando parseIsoDateToLocal to avoid timezone shifts
  emails.forEach(email => {
    const parsed = parseIsoDateToLocal(email.data) || (email.data ? new Date(String(email.data)) : null);
    if (!parsed) return;
    const dateStr = parsed.toLocaleDateString('pt-BR', { month: 'short', day: '2-digit' });
    if (dateStr in map) map[dateStr]++;
  });

  for (const k of Object.keys(map)) {
    tendencia.push({ dia: k, quantidade: map[k] });
  }

  // Top destinatários
  const destMap: Record<string, number> = {};
  for (const e of emails) {
    destMap[e.destinatario] = (destMap[e.destinatario] || 0) + 1;
  }

  const topDestinatarios = Object.entries(destMap)
    .map(([destinatario, quantidade]) => ({ destinatario, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  return {
    stats: { total, classificados, pendentes },
    emailsPorEstado: Object.entries(emailsPorEstado)
      .map(([estado, quantidade]) => ({ estado, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade),
    tendencia,
    topDestinatarios
  };
}