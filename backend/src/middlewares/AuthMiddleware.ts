import type { Request, Response, NextFunction } from "express";

const API_SECRET_KEY = process.env.API_SECRET_KEY;

export function checkApiKey(req: Request, res: Response, next: NextFunction) {
    // 1. Tenta obter a chave do cabeçalho 'x-api-key'
    const apiKey = req.header('x-api-key'); 

    // Verifica se a chave secreta foi definida no .env (Guardrail)
    if (!API_SECRET_KEY) {
        console.error("ERRO DE CONFIGURAÇÃO: KEY não definida.");
        return res.status(500).json({ error: 'Configuração de segurança incompleta.' });
    }

    // 2. Compara a chave enviada com a chave do ambiente
    if (apiKey && apiKey === API_SECRET_KEY) {
        // Chave válida: Permite a requisição prosseguir para o Controller
        return next();
    }
    
    // 3. Chave inválida ou ausente
    // Retorna 403 Forbidden para indicar acesso negado por falta de autorização.
    return res.status(403).json({ error: 'Acesso negado. Credenciais inválidas ou ausentes.' });
}