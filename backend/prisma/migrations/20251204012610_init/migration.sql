-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "remetente" TEXT NOT NULL,
    "destinatario" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "corpoMensagem" TEXT NOT NULL,
    "dataEnvio" TIMESTAMP(3) NOT NULL,
    "estado" TEXT,
    "municipio" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);
