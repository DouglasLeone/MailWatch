import  Router  from 'express';
import { EmailController } from '../controllers/EmailController.js';
import { checkApiKey } from '../middlewares/AuthMiddleware.js';
import { EmailService } from '../services/EmailService.js';
import { checkMailgunSignature } from '../middlewares/WebHookMiddleware.js';

const router = Router();

// Criação de dependêcia
const emailService: EmailService = new EmailService();

// Injeção de dependência no controller
const emailController = new EmailController(emailService);

// Rota : Captura Automática (Mailgun Webhook)
router.post('/webhook/inbound-email', checkMailgunSignature, emailController.handleInboundWebhook.bind(emailController));

// Rota: Criar email manual
router.post('/emails/manual', checkApiKey, emailController.createManualEmail.bind(emailController));

// Rota : Visualizar E-mails Pendentes (Tela 2)
router.get('/emails/pendentes', checkApiKey, emailController.listPendingEmails.bind(emailController));

// Rota : Visualizar E-mail por id
router.get('/emails/:id', checkApiKey, emailController.getEmailById.bind(emailController));

// Rota : Visualizar todos os E-mails
router.get('/emails/', checkApiKey, emailController.getAllEmails.bind(emailController));

// Rota : Classificar E-mail (Tela 2 - Ação de Salvar/Atualizar)
router.put('/emails/classificar/:id', checkApiKey, emailController.updateClassification.bind(emailController));

// Rota: Deletar E-mail
router.delete('/emails/:id', checkApiKey, emailController.deleteEmail.bind(emailController));

export default router;