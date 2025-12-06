import type { Request, Response } from 'express';
import type { ManualEmailData } from '../types/emailTypes/ManualEmailData.js';
import { EmailService } from '../services/EmailService.js';
import { extractEmailAddress } from '../utils/NewFormact.js';

export class EmailController {
    private emailService: EmailService;

    constructor(emailService: EmailService) {
        this.emailService = emailService;
    }

    // POST /webhook/inbound-email
    public async handleInboundWebhook(req: Request, res: Response) {
        const corpoMensagem = req.body["body-plain"] ?? "";

        const remetenteBruto = req.body.From;
        const destinatrioBruto = req.body.To;

        const remetenteFormatado = extractEmailAddress(remetenteBruto);
        const destinatarioFormatado = extractEmailAddress(destinatrioBruto);

        try {
            const payload = {
                remetente: remetenteFormatado,
                destinatario: destinatarioFormatado,
                assunto: req.body.subject,
                corpoMensagem: corpoMensagem,
                dataEnvio: req.body.timestamp,
                status: req.body.status
            };

            const result = await this.emailService.processInboundEmail(payload);
            return res.status(200).json(result);

        } catch (error: any) {
            console.error('Erro no webhook:', error);
            return res.status(500).json({ error: 'Falha interna.' });
        }
    }

    public async createManualEmail(req: Request, res: Response) {
        // 1. Receber e Tratar Dados
        const {
            remetente,
            destinatario,
            assunto,
            corpoMensagem
        }: ManualEmailData = req.body;

        // 2. Validação Básica
        if (!remetente || !destinatario || !assunto) {
            return res.status(400).json({
                error: 'Os campos remetente, destinatario e assunto são obrigatórios.'
            });
        }

        // 3. Preparar o payload com fallback garantido
        const payload: ManualEmailData = {
            remetente,
            destinatario,
            assunto,
            // Garante que o corpoMensagem é uma string, mesmo que vazia
            corpoMensagem: corpoMensagem ?? ""
        };

        try {
            // 4. Chamar o Service
            const result = await this.emailService.saveManualEmail(payload);

            return res.status(201).json(result);

        } catch (error) {
            console.error('Erro ao criar email manual:', error);
            return res.status(500).json({ error: 'Falha interna ao salvar o e-mail.' });
        }
    }

    // GET /emails/pendentes
    public async listPendingEmails(req: Request, res: Response) {
        try {
            const emails = await this.emailService.getPendingEmails();
            return res.status(200).json(emails);
        } catch (error: any) {
            console.error('Erro ao listar pendentes:', error);
            return res.status(500).json({ error: 'Falha ao buscar e-mails pendentes.' });
        }
    }

    public async getAllEmails(req: Request, res: Response) {
        try {
            const emails = await this.emailService.getAllEmails();
            return res.status(200).json(emails);
        } catch (error: any) {
            console.error("Erro ao listar emails:", error);
            return res.status(500).json({ error: "Falha ao buscar emails" });
        }
    }

    public async getEmailById(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const email = await this.emailService.findEmailById(id!);
            return res.status(200).json(email);
        } catch (error: any) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: "Falha ao buscar o e-mail." });
        }
    }

    // PUT /emails/classificar/:id
    public async updateClassification(req: Request, res: Response) {
        const { id } = req.params;
        const { estado, municipio } = req.body;

        try {
            const updatedEmail = await this.emailService.classifyEmail(id!, { estado, municipio });
            return res.status(200).json(updatedEmail);
        } catch (error: any) {
            // Tratamento de erro de validação (ex: falta de campo)
            if (error.message.includes('obrigatórios')) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Falha ao classificar e-mail.' });
        }
    }

    public async deleteEmail(req: Request, res: Response) {
        const { id } = req.params;

        try {
            await this.emailService.deleteEmailById(id!);
            return res.status(204).send();
        } catch (error: any) {
            // Prisma not found
            if (error.code === 'P2025' || error.message?.includes('não encontrado')) {
                return res.status(404).json({ error: 'Email não encontrado.' });
            }
            console.error('Erro ao deletar e-mail:', error);
            return res.status(500).json({ error: 'Falha ao deletar e-mail.' });
        }
    }

}