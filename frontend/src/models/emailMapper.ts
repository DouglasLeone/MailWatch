import type { Email } from '@/types/email';
import { normalizeEstado, parseIsoDateToLocal } from '@/utils/emailUtils';

function pad(n: number) { return n.toString().padStart(2, '0'); }

export function mapApiToEmail(data): Email {
  const id = String(data.id ?? '');
  const remetente = String(data.remetente ?? data.from ?? '');
  const destinatario = String(data.destinatario ?? data.to ?? '');
  const assunto = String(data.assunto ?? '');

  const corpo = String(
    data.corpoMensagem ?? data.corpo ?? data.body ?? data.content ?? data.message ?? data.text ?? ''
  );

  // Dates: prefer explicit fields `data` + `hora`, fallback to createdAt/dataEnvio
  let dataStr = '';
  let horaStr = '';
  const createdAt = data.createdAt ?? data.dataEnvio;

  if (data.data) {
    const parsed = parseIsoDateToLocal(String(data.data));
    if (parsed) {
      dataStr = `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
      horaStr = data.hora ? String(data.hora) : parsed.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
  } else if (createdAt) {
    const parsed = parseIsoDateToLocal(String(createdAt)) || new Date(String(createdAt));
    if (!isNaN(parsed.getTime())) {
      dataStr = `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
      horaStr = parsed.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
  }

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
