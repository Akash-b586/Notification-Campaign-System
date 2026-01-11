-- AlterTable
ALTER TABLE `preference` MODIFY `offers` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `orderUpdates` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `newsletter` BOOLEAN NOT NULL DEFAULT true;
