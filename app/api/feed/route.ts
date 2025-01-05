import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

// Handle GET request
export async function GET() {
  try {
    const feedData = await prisma.feedInventory.findMany(); // Fetch feed data from your database
    return NextResponse.json({ data: feedData });
  } catch (error) {
    console.error("Error fetching feed data:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed data" },
      { status: 500 }
    );
  }
}
