/*
  Warnings:

  - Added the required column `name` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "name" TEXT NOT NULL;
