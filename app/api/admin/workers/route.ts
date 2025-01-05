import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Parse JSON body from the request stream
    const body = await req.json();
    const { name, salary } = body;

    // Validate input
    if (!name || typeof salary !== "number" || salary <= 0) {
      return NextResponse.json(
        { message: "Invalid name or salary." },
        { status: 400 }
      );
    }

    // Create a new worker record
    const newWorker = await prisma.worker.create({
      data: {
        name,
        salary,
      },
    });

    return NextResponse.json({
      message: "New worker added",
      newWorker,
    });
  } catch (error) {
    console.error("Error saving worker record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const workerData = await prisma.worker.findMany(); // Fetch feed data from your database

    return NextResponse.json(workerData);
  } catch (error) {
    console.error("Error fetching feed data:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed data" },
      { status: 500 }
    );
  }
}
