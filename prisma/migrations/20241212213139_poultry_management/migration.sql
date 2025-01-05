-- AlterTable
ALTER TABLE "BirdLog" ALTER COLUMN "mortality" SET DEFAULT 0,
ALTER COLUMN "birdsBought" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "BirdExpense" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DOUBLE PRECISION NOT NULL,
    "amount" INTEGER NOT NULL,
    "birdLogId" INTEGER NOT NULL,

    CONSTRAINT "BirdExpense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BirdExpense" ADD CONSTRAINT "BirdExpense_birdLogId_fkey" FOREIGN KEY ("birdLogId") REFERENCES "BirdLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
