/*
  Warnings:

  - You are about to drop the column `authCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `authTime` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `authCode`,
    DROP COLUMN `authTime`;

-- CreateTable
CREATE TABLE `emailauth` (
    `authid` INTEGER NOT NULL AUTO_INCREMENT,
    `authcode` VARCHAR(191) NULL,
    `authtime` DATETIME(3) NULL,

    PRIMARY KEY (`authid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
