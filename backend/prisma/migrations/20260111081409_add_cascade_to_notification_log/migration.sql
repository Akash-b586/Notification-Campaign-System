-- DropForeignKey
ALTER TABLE `notificationlog` DROP FOREIGN KEY `NotificationLog_campaignId_fkey`;

-- DropForeignKey
ALTER TABLE `notificationlog` DROP FOREIGN KEY `NotificationLog_userId_fkey`;

-- AddForeignKey
ALTER TABLE `NotificationLog` ADD CONSTRAINT `NotificationLog_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationLog` ADD CONSTRAINT `NotificationLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
