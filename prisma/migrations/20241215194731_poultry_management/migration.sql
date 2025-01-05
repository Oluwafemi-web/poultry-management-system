/*
  Warnings:

  - Added the required column `formattedDate` to the `BirdExpense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formattedDate` to the `BirdLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formattedDate` to the `EggsInventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formattedDate` to the `EggsSales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formattedDate` to the `FeedInventory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BirdExpense" ADD COLUMN     "formattedDate" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BirdLog" ADD COLUMN     "formattedDate" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EggsInventory" ADD COLUMN     "formattedDate" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EggsSales" ADD COLUMN     "formattedDate" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FeedInventory" ADD COLUMN     "formattedDate" TEXT NOT NULL;
