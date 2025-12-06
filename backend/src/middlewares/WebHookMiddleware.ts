import * as crypto from "crypto"
import type { Request, Response, NextFunction } from "express"

const MAILGUN_SIGNING_KEY = process.env.MAILGUN_SIGNING_KEY;

export const checkMailgunSignature = (req: Request, res: Response, next: NextFunction) => {
    
    if(!req.body) {
        return res.status(400).json({ error: 'Corpo da requisição vazio.' });
    }

    // Envia os dados de segurança no corpo (body)
    const { signature, timestamp, token } = req.body;

    if (!MAILGUN_SIGNING_KEY || !signature || !timestamp || !token) {
        // Log de tentativa de acesso não autorizada
        return res.status(403).json({ error: 'Acesso negado: dados de webhook ausentes.' });
    }

    // A assinatura é feita concatenando timestamp e token
    const hash = crypto.createHmac('sha256', MAILGUN_SIGNING_KEY)
                       .update(timestamp + token)
                       .digest('hex');

    // Compara a assinatura calculada com a assinatura enviada pelo webhook
    if (hash === signature) {
        // Se a assinatura for válida, a requisição é autêntica
        next(); 
    } else {
        // Se não for igual, é uma requisição falsa
        res.status(406).json({ error: 'Assinatura de Webhook inválida. Acesso negado.' });
    }
};