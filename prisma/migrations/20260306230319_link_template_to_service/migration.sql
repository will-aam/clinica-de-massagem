/*
  Warnings:

  - You are about to drop the column `is_active` on the `package_templates` table. All the data in the column will be lost.
  - You are about to drop the column `validity_days` on the `package_templates` table. All the data in the column will be lost.
  - Added the required column `service_id` to the `package_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "package_templates" DROP COLUMN "is_active",
DROP COLUMN "validity_days",
ADD COLUMN     "service_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "package_templates" ADD CONSTRAINT "package_templates_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
