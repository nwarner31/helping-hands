-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WORK', 'MEDICAL', 'SOCIAL', 'OTHER');

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
