-- AlterTable
ALTER TABLE `campaign` MODIFY `notificationType` ENUM('OFFERS', 'ORDER_UPDATES', 'NEWSLETTER') NOT NULL;

-- AlterTable
ALTER TABLE `notificationlog` MODIFY `notificationType` ENUM('OFFERS', 'ORDER_UPDATES', 'NEWSLETTER') NOT NULL;

-- AlterTable
ALTER TABLE `notificationpreference` MODIFY `notificationType` ENUM('OFFERS', 'ORDER_UPDATES', 'NEWSLETTER') NOT NULL;
