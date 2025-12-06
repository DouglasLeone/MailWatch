// Interfaces para garantir a tipagem consistente com o componente Pendentes.tsx
interface Estado {
  sigla: string; // Ex: 'SP', 'RJ'
  nome: string;  // Ex: 'São Paulo', 'Rio de Janeiro'
}

interface Municipio {
  nome: string; // Ex: 'Campinas', 'Niterói'
}

// URL base da API de Localidades do IBGE
const IBGE_API_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades';

/**
 * Busca a lista de todos os estados brasileiros (UF) na API do IBGE.
 * O resultado é ordenado alfabeticamente pelo nome.
 * @returns Uma Promise que resolve para um array de objetos Estado.
 */
export async function fetchEstados(): Promise<Estado[]> {
  try {
    const response = await fetch(`${IBGE_API_URL}/estados?orderBy=nome`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar estados: ${response.statusText}`);
    }

    // A API do IBGE retorna um array de objetos com 'sigla' e 'nome'.
    // Fazemos o cast (as Estado[]) diretamente, pois as chaves do IBGE coincidem com a interface.
    const estadosData: Estado[] = await response.json();
    
    return estadosData;

  } catch (error) {
    console.error('Falha na requisição dos estados do IBGE:', error);
    // Lançar um erro é a melhor prática para que o componente React possa tratá-lo.
    throw new Error('Não foi possível carregar a lista de estados do IBGE.');
  }
}

/**
 * Busca a lista de municípios para um determinado estado (UF).
 * O resultado é ordenado alfabeticamente pelo nome.
 * @param uf A sigla do estado (ex: 'SP').
 * @returns Uma Promise que resolve para um array de objetos Municipio.
 */
export async function fetchMunicipiosPorEstado(uf: string): Promise<Municipio[]> {
  if (!uf) {
    return []; // Retorna um array vazio se o estado não for fornecido
  }

  try {
    // Endpoint: /estados/{UF}/municipios?orderBy=nome
    const response = await fetch(`${IBGE_API_URL}/estados/${uf}/municipios?orderBy=nome`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar municípios para ${uf}: ${response.statusText}`);
    }

    // A API do IBGE retorna objetos de município com uma propriedade 'nome'.
    // Precisamos extrair apenas o nome e garantir que o tipo esteja correto.
    const municipiosData: { nome: string }[] = await response.json();
    
    // Mapeia para o formato simples da interface Municipio
    const municipios: Municipio[] = municipiosData.map(mun => ({
      nome: mun.nome
    }));

    return municipios;

  } catch (error) {
    console.error(`Falha na requisição dos municípios para ${uf}:`, error);
    throw new Error(`Não foi possível carregar os municípios para ${uf}.`);
  }
}