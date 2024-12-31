-- AlterTable
ALTER TABLE `User` ADD COLUMN `profileimage` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `commentLike` (
    `commentLikeid` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `commentid` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `commentLike_userId_commentid_key`(`userId`, `commentid`),
    PRIMARY KEY (`commentLikeid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `commentLike` ADD CONSTRAINT `commentLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commentLike` ADD CONSTRAINT `commentLike_commentid_fkey` FOREIGN KEY (`commentid`) REFERENCES `Comment`(`commentid`) ON DELETE RESTRICT ON UPDATE CASCADE;
