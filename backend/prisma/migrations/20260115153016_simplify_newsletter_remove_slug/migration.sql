/*
  Warnings:

  - You are about to drop the column `slug` on the `newsletter` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `Newsletter` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Newsletter` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Newsletter_slug_key` ON `newsletter`;

-- AlterTable
ALTER TABLE `newsletter` DROP COLUMN `slug`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Newsletter_title_key` ON `Newsletter`(`title`);
