-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "EmployeePosition" AS ENUM ('ASSOCIATE', 'MANAGER', 'DIRECTOR', 'ADMIN');

-- CreateTable
CREATE TABLE "Client" (
    "id" VARCHAR(40) NOT NULL,
    "legalName" VARCHAR(50) NOT NULL,
    "name" VARCHAR(25),
    "sex" "Sex" NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "requiresStaff" BOOLEAN,
    "houseId" VARCHAR(45),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" VARCHAR(40) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "sex" "Sex" NOT NULL,
    "email" VARCHAR(65) NOT NULL,
    "password" VARCHAR(65) NOT NULL,
    "position" "EmployeePosition" NOT NULL DEFAULT 'ASSOCIATE',
    "hireDate" DATE NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "House" (
    "id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(25) NOT NULL,
    "street1" VARCHAR(50) NOT NULL,
    "street2" VARCHAR(25),
    "city" VARCHAR(30) NOT NULL,
    "state" VARCHAR(25) NOT NULL,
    "maxClients" INTEGER NOT NULL,
    "femaleEmployeeOnly" BOOLEAN NOT NULL,
    "primaryManagerId" VARCHAR(40),
    "secondaryManagerId" VARCHAR(40),

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "House_name_key" ON "House"("name");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_primaryManagerId_fkey" FOREIGN KEY ("primaryManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_secondaryManagerId_fkey" FOREIGN KEY ("secondaryManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
