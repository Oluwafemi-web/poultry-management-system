import { NextResponse } from "next/server";
import prisma from "../../lib/prisma"; // Adjust the import path to match your project

export async function GET() {
  try {
    // Sum up all the birdsAvailable from the birdLog table
    const totalBirdsAvailable = await prisma.birdLog.findFirst({
      orderBy: {
        date: "desc",
      },
    });

    // Return the total birds available
    return NextResponse.json({
      totalBirds: totalBirdsAvailable?.birdsAvailable || 0,
    });
  } catch (error: any) {
    console.error("Error fetching bird data:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch bird data." },
      { status: 500 }
    );
  }
}
