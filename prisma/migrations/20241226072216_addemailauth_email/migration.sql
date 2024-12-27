-- CreateTable
CREATE TABLE `emailauth` (
    `authid` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `authCode` VARCHAR(191) NULL,
    `authTime` DATETIME(3) NULL,

    PRIMARY KEY (`authid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
