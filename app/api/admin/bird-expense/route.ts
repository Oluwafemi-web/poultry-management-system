import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma"; // Update the path to your Prisma client

// POST method handler
export async function POST(req: NextRequest) {
  try {
    const { amount, price } = await req.json();
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    if (!amount || !price) {
      return NextResponse.json(
        { error: "Amount and price are required" },
        { status: 400 }
      );
    }

    // Create BirdExpense entry with a linked BirdLog entry
    const birdExpense = await prisma.birdExpense.create({
      data: {
        amount,
        price,
        formattedDate: formattedDate,
        birdLog: {
          create: {
            birdsBought: amount,
            birdsAvailable: amount,
            formattedDate: formattedDate,
            mortality: 0, // Default value
          },
        },
      },
      include: { birdLog: true },
    });

    return NextResponse.json({
      message: "Bird record saved successfully",
      birdExpense,
    });
  } catch (error) {
    console.error("Error saving bird record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
