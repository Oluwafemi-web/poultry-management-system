import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { feed, eggs, birds } = body;

    // Today's date (without time) for comparison
    // const getTodayDate = () => {
    //   const today = new Date();
    //   return today.toISOString().split("T")[0];
    // };
    const today = new Date();
    console.log(today);
    const formattedDate = today.toISOString().split("T")[0];

    // Check if entries already exist for today
    const [existingEggsLog, existingFeedLog, existingBirdLog] =
      await Promise.all([
        prisma.eggsInventory.findFirst({
          where: { formattedDate: formattedDate },
        }),
        prisma.feedInventory.findFirst({
          where: { formattedDate: formattedDate },
        }),
        prisma.birdLog.findFirst({
          where: { formattedDate: formattedDate },
        }),
      ]);

    if (existingEggsLog || existingFeedLog || existingBirdLog) {
      return NextResponse.json(
        {
          message:
            "Daily logs already exist for today. You can only log once per day.",
        },
        { status: 400 }
      );
    }

    // Continue with the existing logic since no entries exist for today

    const cratesLaid = Math.floor(eggs.laid / 30);
    const cratesSold = Math.floor(eggs.sold / 30);

    const latestInventory = await prisma.eggsInventory.findFirst({
      orderBy: { dateCollected: "desc" },
    });
    const lastBirdLog = await prisma.birdLog.findFirst({
      orderBy: {
        date: "desc",
      },
    });

    const newBirdsAvailable =
      (lastBirdLog?.birdsAvailable || 0) - birds.mortality;

    const previousCratesAvailable = latestInventory?.cratesAvailable ?? 0;
    const newCratesAvailable =
      previousCratesAvailable + cratesLaid - cratesSold;

    if (newCratesAvailable < 0) {
      return NextResponse.json(
        { error: "Insufficient crates available for sale." },
        { status: 400 }
      );
    }

    const pricePerCrate =
      latestInventory?.pricePerCrate.toNumber() ?? new Decimal(0).toNumber();

    const createdInventory = await prisma.eggsInventory.create({
      data: {
        quantity: eggs.laid,
        dateCollected: today,
        formattedDate: formattedDate,
        crates: cratesLaid,
        cratesAvailable: previousCratesAvailable + cratesLaid,
        pricePerCrate: eggs.price,
      },
    });

    if (cratesSold > 0) {
      await prisma.eggsSales.create({
        data: {
          eggsInventoryId: createdInventory.id,
          cratesSold,
          totalSaleAmount: cratesSold * eggs.price,
          dateSold: today,
          formattedDate: formattedDate,
          cratesAvailableBefore: previousCratesAvailable + cratesLaid,
          cratesAvailableAfter: newCratesAvailable,
        },
      });

      await prisma.eggsInventory.update({
        where: { id: createdInventory.id },
        data: {
          cratesAvailable: newCratesAvailable,
        },
      });
    }

    const latestFeedInventory = await prisma.feedInventory.findFirst({
      orderBy: { datePurchased: "desc" },
    });

    const previousBagsAvailable = latestFeedInventory?.bagsAvailable ?? 0;
    const previousTotalBagsPurchased =
      latestFeedInventory?.totalBagsPurchased ?? 0;
    const previousTotalBagsUsed = latestFeedInventory?.totalBagsUsed ?? 0;

    await Promise.all([
      prisma.feedInventory.create({
        data: {
          feedType: "",
          bagsUsed: feed.used,
          bagsPurchased: feed.purchased,
          cost: feed.cost,
          datePurchased: today,
          formattedDate: formattedDate,
          bagsAvailable: previousBagsAvailable + feed.purchased - feed.used,
          totalBagsUsed: previousTotalBagsUsed + feed.used,
          totalBagsPurchased: previousTotalBagsPurchased + feed.purchased,
        },
      }),
      prisma.birdLog.create({
        data: {
          date: today,
          formattedDate: formattedDate,
          mortality: birds.mortality,
          birdsBought: 0,
          birdsAvailable: newBirdsAvailable,
        },
      }),
    ]);

    return NextResponse.json({ message: "Daily logs updated successfully!" });
  } catch (error: any) {
    console.error("Error updating daily logs:", error.message);
    return NextResponse.json(
      { error: "Failed to update daily logs." },
      { status: 500 }
    );
  }
}
