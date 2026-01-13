-- DropForeignKey
ALTER TABLE `NotificationLog` DROP FOREIGN KEY `NotificationLog_campaignId_fkey`;

-- DropForeignKey
ALTER TABLE `NotificationLog` DROP FOREIGN KEY `NotificationLog_userId_fkey`;

-- AlterTable
ALTER TABLE `Preference` MODIFY `offers` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `orderUpdates` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `newsletter` BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE `NotificationLog` ADD CONSTRAINT `NotificationLog_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationLog` ADD CONSTRAINT `NotificationLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
