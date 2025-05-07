-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('M', 'F');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "houseId" VARCHAR(45),
ADD COLUMN     "requiresStaff" BOOLEAN,
ADD COLUMN     "sex" "Sex";

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "sex" "Sex";

-- CreateTable
CREATE TABLE "House" (
    "id" TEXT NOT NULL,
    "houseId" VARCHAR(20) NOT NULL,
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
CREATE UNIQUE INDEX "House_houseId_key" ON "House"("houseId");

-- CreateIndex
CREATE UNIQUE INDEX "House_name_key" ON "House"("name");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_primaryManagerId_fkey" FOREIGN KEY ("primaryManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_secondaryManagerId_fkey" FOREIGN KEY ("secondaryManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
