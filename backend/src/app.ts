import express from 'express';
import emailRoutes from './routes/EmailRoutes.js';
import { configDotenv } from 'dotenv';
import cors from 'cors';    
import bodyParser from "body-parser"

configDotenv();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

const allowedOrigins: Array<string> = [];

if (process.env.URL_LOCAL) {
    allowedOrigins.push(process.env.URL_LOCAL);
}

if (process.env.URL_PROD) {
    allowedOrigins.push(process.env.URL_PROD);
}

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Se a origem for permitida ou se a requisição não tiver origem (ex: Postman), permite.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Acesso não permitido pelo CORS'));
        }
    },
    // Métodos HTTP que a API aceita
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    // Headers que o frontend pode enviar (crucial para API Key)
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'], 
    credentials: true // Permite o envio de cookies/headers de autenticação
};

app.use(cors(corsOptions));

// Define a rota base /api e anexa o router de e-mails
app.use('/api', emailRoutes); 

// ... (Configuração de porta e app.listen) ...

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server is running in port " + PORT);
});