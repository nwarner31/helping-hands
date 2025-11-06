-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "EmployeePosition" AS ENUM ('ASSOCIATE', 'MANAGER', 'DIRECTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WORK', 'MEDICAL', 'SOCIAL', 'OTHER');

-- CreateTable
CREATE TABLE "Client" (
    "id" VARCHAR(40) NOT NULL,
    "legalName" VARCHAR(50) NOT NULL,
    "name" VARCHAR(25),
    "sex" "Sex" NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "requiresStaff" BOOLEAN NOT NULL DEFAULT false,
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
CREATE TABLE "Event" (
    "id" VARCHAR(40) NOT NULL,
    "type" "EventType" NOT NULL,
    "description" TEXT NOT NULL,
    "beginDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "beginTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "numberStaffRequired" INTEGER NOT NULL,
    "clientId" VARCHAR(40) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalEvent" (
    "id" VARCHAR(40) NOT NULL,
    "recordNumber" VARCHAR(10) NOT NULL,
    "recordPrintedDate" DATE,
    "recordPrintedEmpId" VARCHAR(40),
    "recordTakenToHouseDate" DATE,
    "recordTakenEmpId" VARCHAR(40),
    "appointmentCompletedByEmpId" VARCHAR(40),
    "recordFiledDate" DATE,
    "recordFiledEmpId" VARCHAR(40),
    "doctor" VARCHAR(60) NOT NULL,
    "doctorType" VARCHAR(30) NOT NULL,
    "appointmentForCondition" VARCHAR(50) NOT NULL,
    "appointmentResults" TEXT,

    CONSTRAINT "MedicalEvent_pkey" PRIMARY KEY ("id")
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
ALTER TABLE "Event" ADD CONSTRAINT "Event_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalEvent" ADD CONSTRAINT "MedicalEvent_recordPrintedEmpId_fkey" FOREIGN KEY ("recordPrintedEmpId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalEvent" ADD CONSTRAINT "MedicalEvent_recordTakenEmpId_fkey" FOREIGN KEY ("recordTakenEmpId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalEvent" ADD CONSTRAINT "MedicalEvent_appointmentCompletedByEmpId_fkey" FOREIGN KEY ("appointmentCompletedByEmpId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalEvent" ADD CONSTRAINT "MedicalEvent_recordFiledEmpId_fkey" FOREIGN KEY ("recordFiledEmpId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalEvent" ADD CONSTRAINT "MedicalEvent_id_fkey" FOREIGN KEY ("id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_primaryManagerId_fkey" FOREIGN KEY ("primaryManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_secondaryManagerId_fkey" FOREIGN KEY ("secondaryManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
