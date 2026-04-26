-- AlterTable
ALTER TABLE `FuelPrice` ADD COLUMN `verificationScore` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `reliabilityScore` DOUBLE NOT NULL DEFAULT 0.5;

-- CreateTable
CREATE TABLE `FuelPriceVote` (
    `id` VARCHAR(191) NOT NULL,
    `fuelPriceId` VARCHAR(191) NOT NULL,
    `voterId` VARCHAR(191) NOT NULL,
    `isAccurate` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FuelPriceVote_fuelPriceId_idx`(`fuelPriceId`),
    INDEX `FuelPriceVote_voterId_idx`(`voterId`),
    UNIQUE INDEX `FuelPriceVote_fuelPriceId_voterId_key`(`fuelPriceId`, `voterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FuelPriceVote` ADD CONSTRAINT `FuelPriceVote_fuelPriceId_fkey` FOREIGN KEY (`fuelPriceId`) REFERENCES `FuelPrice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FuelPriceVote` ADD CONSTRAINT `FuelPriceVote_voterId_fkey` FOREIGN KEY (`voterId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
