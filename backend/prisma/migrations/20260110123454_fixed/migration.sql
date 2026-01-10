/*
  Warnings:

  - The primary key for the `SystemUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `SystemUser` table. All the data in the column will be lost.
  - The required column `userId` was added to the `SystemUser` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE `Campaign` DROP FOREIGN KEY `Campaign_createdById_fkey`;

-- AlterTable
ALTER TABLE `SystemUser` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`userId`);

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `SystemUser`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
