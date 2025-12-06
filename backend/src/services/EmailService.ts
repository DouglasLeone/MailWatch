import { EmailRepository } from '../repositories/EmailRepository.js';
import type { Email } from '../../generated/prisma/client.js';
import type { InboundEmailData } from '../types/emailTypes/InboundEmailData.js';
import type { ClassificationData } from '../types/emailTypes/ClassificationData.js';
import type { ManualEmailData } from '../types/emailTypes/ManualEmailData.js';
import type { ManualEmailDataWithSystemsFields } from '../types/emailTypes/ManualEmailData.js';

export class EmailService {
    private emailRepository: EmailRepository;

    constructor() {
        this.emailRepository = new EmailRepository();
    }

    public async processInboundEmail(data: InboundEmailData): Promise<Email> {
        return this.emailRepository.createInboundEmail(data);
    }

    public async saveManualEmail(data: ManualEmailData): Promise<Email> {
        // Adicionar campos de sistema 
        const emailToSave: ManualEmailDataWithSystemsFields = {
            ...data,
            dataEnvio: new Date(), // Data/Hora atual do servidor
            status: 'PENDENTE',    // Status inicial para todos os e-mails manuais
        };

        // Chamar o Repository para salvar
        const savedEmail = await this.emailRepository.createManualEmail(emailToSave);

        return savedEmail;
    }

    public async getAllEmails(): Promise<Email[]> {
        return this.emailRepository.findAllEmails();
    }

    public async findEmailById(id: string): Promise<Email | null> {
        const email = await this.emailRepository.findEmailById(id);

        if (!email || email == null) {
            throw new Error('Email não encontrado.');
        }
        return email;
    }

    public async getPendingEmails(): Promise<Email[]> {
        return this.emailRepository.findPendingEmails();
    }

    public async classifyEmail(id: string, data: ClassificationData): Promise<Email> {
        if (!data.estado || !data.municipio) {
            throw new Error('Estado e Município são obrigatórios para classificação.');
        }
        return this.emailRepository.classifyEmail(id, data);
    }

    public async deleteEmailById(id: string): Promise<void> {
        await this.emailRepository.deleteEmailById(id);
    }

}