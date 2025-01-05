import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

// Handle GET request
export async function GET() {
  try {
    const eggData = await prisma.eggsInventory.findMany(); // Fetch egg data from your database
    const eggSales = await prisma.eggsSales.findMany();

    return NextResponse.json({ data: eggData, sales: eggSales });
  } catch (error) {
    console.error("Error fetching egg data:", error);
    return NextResponse.json(
      { error: "Failed to fetch egg data" },
      { status: 500 }
    );
  }
}
