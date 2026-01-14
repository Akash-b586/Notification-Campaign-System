/*
  Warnings:

  - You are about to drop the `Preference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SystemUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `channel` to the `NotificationLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notificationType` to the `NotificationLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Campaign` DROP FOREIGN KEY `Campaign_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `Preference` DROP FOREIGN KEY `Preference_userId_fkey`;

-- AlterTable
ALTER TABLE `NotificationLog` ADD COLUMN `channel` ENUM('EMAIL', 'SMS', 'PUSH') NOT NULL,
    ADD COLUMN `newsletterId` VARCHAR(191) NULL,
    ADD COLUMN `notificationType` ENUM('OFFERS', 'ORDER_UPDATES', 'NEWSLETTER') NOT NULL,
    ADD COLUMN `orderId` VARCHAR(191) NULL,
    MODIFY `campaignId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `role` ENUM('ADMIN', 'CREATOR', 'VIEWER', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER';

-- DropTable
DROP TABLE `Preference`;

-- DropTable
DROP TABLE `SystemUser`;

-- CreateTable
CREATE TABLE `NotificationPreference` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `notificationType` ENUM('OFFERS', 'ORDER_UPDATES', 'NEWSLETTER') NOT NULL,
    `email` BOOLEAN NOT NULL DEFAULT true,
    `sms` BOOLEAN NOT NULL DEFAULT true,
    `push` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NotificationPreference_userId_notificationType_key`(`userId`, `notificationType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Newsletter` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Newsletter_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NewsletterSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `newsletterId` VARCHAR(191) NOT NULL,
    `email` BOOLEAN NOT NULL DEFAULT true,
    `sms` BOOLEAN NOT NULL DEFAULT false,
    `push` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NewsletterSubscription_userId_newsletterId_key`(`userId`, `newsletterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'CREATED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NotificationPreference` ADD CONSTRAINT `NotificationPreference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NewsletterSubscription` ADD CONSTRAINT `NewsletterSubscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NewsletterSubscription` ADD CONSTRAINT `NewsletterSubscription_newsletterId_fkey` FOREIGN KEY (`newsletterId`) REFERENCES `Newsletter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationLog` ADD CONSTRAINT `NotificationLog_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationLog` ADD CONSTRAINT `NotificationLog_newsletterId_fkey` FOREIGN KEY (`newsletterId`) REFERENCES `Newsletter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
