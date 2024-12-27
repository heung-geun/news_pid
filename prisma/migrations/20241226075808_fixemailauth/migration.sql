/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `emailauth` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `emailauth_email_key` ON `emailauth`(`email`);
