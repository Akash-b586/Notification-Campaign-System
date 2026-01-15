/*
  Warnings:

  - The values [NEWSLETTER] on the enum `NotificationLog_notificationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [NEWSLETTER] on the enum `NotificationLog_notificationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [NEWSLETTER] on the enum `NotificationLog_notificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `campaign` MODIFY `notificationType` ENUM('OFFERS', 'ORDER_UPDATES') NOT NULL;

-- AlterTable
ALTER TABLE `notificationlog` MODIFY `notificationType` ENUM('OFFERS', 'ORDER_UPDATES') NOT NULL;

-- AlterTable
ALTER TABLE `notificationpreference` MODIFY `notificationType` ENUM('OFFERS', 'ORDER_UPDATES') NOT NULL;
