/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sex` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "dateOfBirth",
DROP COLUMN "sex",
ADD COLUMN     "birthDay" TIMESTAMP(3),
ADD COLUMN     "gender" "SexOptions" NOT NULL DEFAULT 'MALE';
