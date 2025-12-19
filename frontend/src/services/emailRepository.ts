import type { Email } from '@/types/email';
import { mapApiToEmail } from '@/models/emailMapper';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY
};

export async function fetchHistorico(): Promise<Email[]> {
  const res = await fetch(`${API_URL}/api/emails`, { headers });
  if (!res.ok) throw new Error('Erro ao buscar histórico');
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapApiToEmail) : [];
}

export async function fetchPendentes(): Promise<Email[]> {
  const res = await fetch(`${API_URL}/api/emails/pendentes`, { headers });
  if (!res.ok) throw new Error('Erro ao buscar pendentes');
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapApiToEmail) : [];
}

export async function fetchEmail(id: string): Promise<Email> {
  const res = await fetch(`${API_URL}/api/emails/${id}`, { headers });
  if (!res.ok) throw new Error('Erro ao buscar e-mail');
  const data = await res.json();
  return mapApiToEmail(data);
}

type ClassificationPayload = { estado?: string; municipio?: string };

export async function classificarEmail(id: string, payload: ClassificationPayload): Promise<Email> {
  const res = await fetch(`${API_URL}/api/emails/classificar/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erro ao classificar e-mail');
  const data = await res.json();
  return mapApiToEmail(data);
}

export async function saveMultipleClassifications(updates: { id: string; estado: string; municipio: string }[]): Promise<void> {
  for (const update of updates) {
    await classificarEmail(update.id, { estado: update.estado, municipio: update.municipio });
  }
}

export async function criarEmail(data: Omit<Email, 'id'>): Promise<Email> {
  const payload = {
    remetente: data.remetente,
    destinatario: data.destinatario,
    assunto: data.assunto,
    corpo: data.corpo,
    estado: data.estado,
    municipio: data.municipio,
    classificado: data.classificado,
    data: data.data,
    hora: data.hora,
    corpoMensagem: data.corpo,
    body: data.corpo,
    message: data.corpo,
    uf: data.estado,
  };

  const res = await fetch(`${API_URL}/api/emails/manual`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Erro ao criar email: ${res.status} ${txt}`);
  }

  const response = await res.json();
  return mapApiToEmail(response);
}

export async function deleteEmail(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/emails/${id}`, { method: 'DELETE', headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Erro ao deletar email: ${res.status} ${txt}`);
  }
}

// Backwards-compatible aliases (many parts of the codebase used these names)
export const getEmailById = fetchEmail;
export const updateEmailLocation = async (id: string, estado: string | null, municipio: string | null) => {
  return classificarEmail(id, { estado: estado ?? undefined, municipio: municipio ?? undefined });
};
