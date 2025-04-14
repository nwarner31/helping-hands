-- CreateEnum
CREATE TYPE "EmployeePosition" AS ENUM ('ASSOCIATE', 'MANAGER', 'DIRECTOR', 'ADMIN');

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "employeeId" VARCHAR(40) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(65) NOT NULL,
    "password" VARCHAR(65) NOT NULL,
    "position" "EmployeePosition" NOT NULL DEFAULT 'ASSOCIATE',
    "hireDate" DATE NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeId_key" ON "Employee"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
