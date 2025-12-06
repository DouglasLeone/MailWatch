export interface ManualEmailData {
    remetente: string;
    destinatario: string;
    assunto: string;
    corpoMensagem: string | "";
}

export interface ManualEmailDataWithSystemsFields extends ManualEmailData {
    dataEnvio: Date;
    status: 'PENDENTE' | 'CLASSIFICADO' | string;
}