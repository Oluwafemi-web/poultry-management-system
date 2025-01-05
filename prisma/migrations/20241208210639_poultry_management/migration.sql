-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedInventory" (
    "id" SERIAL NOT NULL,
    "feedType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "bagsAvailable" INTEGER NOT NULL,
    "cost" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datePurchased" TIMESTAMP(3) NOT NULL,
    "bagsUsed" INTEGER NOT NULL,
    "bagsPurchased" INTEGER NOT NULL DEFAULT 0,
    "totalBagsUsed" INTEGER NOT NULL DEFAULT 0,
    "totalBagsPurchased" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FeedInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EggsInventory" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "dateCollected" TIMESTAMP(3) NOT NULL,
    "crates" INTEGER NOT NULL DEFAULT 0,
    "pricePerCrate" DECIMAL(65,30) NOT NULL,
    "cratesAvailable" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EggsInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EggsSales" (
    "id" SERIAL NOT NULL,
    "eggsInventoryId" INTEGER NOT NULL,
    "cratesSold" INTEGER NOT NULL,
    "totalSaleAmount" DECIMAL(65,30) NOT NULL,
    "dateSold" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cratesAvailableBefore" INTEGER NOT NULL,
    "cratesAvailableAfter" INTEGER NOT NULL,

    CONSTRAINT "EggsSales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BirdLog" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mortality" INTEGER NOT NULL,
    "birdsBought" INTEGER NOT NULL,
    "birdsAvailable" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BirdLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" SERIAL NOT NULL,
    "salary" DECIMAL(65,30) NOT NULL,
    "dateHired" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "EggsSales" ADD CONSTRAINT "EggsSales_eggsInventoryId_fkey" FOREIGN KEY ("eggsInventoryId") REFERENCES "EggsInventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

