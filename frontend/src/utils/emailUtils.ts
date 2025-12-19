export function normalizeEstado(value: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (v.length === 2) return v.toUpperCase();
  const lower = v.toLowerCase();
  const simple = lower.normalize('NFD').replace(/\p{Diacritic}/gu, '');

  const STATE_NAME_TO_UF: Record<string, string> = {
    'acre': 'AC','alagoas': 'AL','amapa': 'AP','amazonas': 'AM','bahia': 'BA','ceara': 'CE','ceará': 'CE','distrito federal': 'DF','espirito santo': 'ES','espírito santo': 'ES','goias': 'GO','goiás': 'GO','maranhao': 'MA','maranhão': 'MA','mato grosso': 'MT','mato grosso do sul': 'MS','minas gerais': 'MG','para': 'PA','pará': 'PA','paraiba': 'PB','paraíba': 'PB','parana': 'PR','paraná': 'PR','pernambuco': 'PE','piaui': 'PI','piauí': 'PI','rio de janeiro': 'RJ','rio grande do norte': 'RN','rio grande do sul': 'RS','rondonia': 'RO','rondônia': 'RO','roraima': 'RR','santa catarina': 'SC','sao paulo': 'SP','são paulo': 'SP','sergipe': 'SE','tocantins': 'TO'
  };

  if (STATE_NAME_TO_UF[simple]) return STATE_NAME_TO_UF[simple];
  const match = v.match(/([A-Za-z]{2})\b/);
  if (match) return match[1].toUpperCase();
  return null;
}

export function parseIsoDateToLocal(dateStr: string): Date | null {
  if (!dateStr) return null;
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
