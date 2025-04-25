-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "clientId" VARCHAR(40) NOT NULL,
    "legalName" VARCHAR(50) NOT NULL,
    "name" VARCHAR(25),
    "dateOfBirth" DATE NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_clientId_key" ON "Client"("clientId");
