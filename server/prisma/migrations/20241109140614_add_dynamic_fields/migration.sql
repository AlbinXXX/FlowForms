/*
  Warnings:

  - You are about to drop the column `formId` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_formId_fkey";

-- DropIndex
DROP INDEX "Project_formId_key";

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "projectId" INTEGER;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "formId",
ADD COLUMN     "description" TEXT;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
