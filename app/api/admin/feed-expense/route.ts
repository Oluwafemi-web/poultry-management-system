import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const month = searchParams.get("month");

  if (!month) {
    return NextResponse.json(
      { error: "Invalid month provided" },
      { status: 400 }
    );
  }

  try {
    const [year, selectedMonth] = month.split("-");
    const startOfYear = new Date(`${year}-01-01`);
    const startOfNextYear = new Date(`${Number(year) + 1}-01-01`);

    // Define the start and end of each quarter
    const quarters = [
      { start: `${year}-01-01`, end: `${year}-03-31` }, // Q1
      { start: `${year}-04-01`, end: `${year}-06-30` }, // Q2
      { start: `${year}-07-01`, end: `${year}-09-30` }, // Q3
      { start: `${year}-10-01`, end: `${year}-12-31` }, // Q4
    ];

    // Fetch feed expense data for the entire year
    const feedData = await prisma.feedInventory.findMany({
      where: {
        datePurchased: {
          gte: startOfYear, // Start of the year
          lt: startOfNextYear, // Start of next year
        },
      },
    });

    if (!feedData.length) {
      return NextResponse.json(
        { error: "No feed expense records found" },
        { status: 404 }
      );
    }

    // Calculate Quarterly Expenses
    const quarterlyExpenses = quarters.map((quarter) => {
      const expensesInQuarter = feedData
        .filter((log) => {
          const logDate = new Date(log.datePurchased);
          return (
            logDate >= new Date(quarter.start) &&
            logDate <= new Date(quarter.end)
          );
        })
        .reduce(
          (total, log) =>
            total + (log.cost.toNumber() * log.bagsPurchased || 0),
          0
        );

      return {
        quarter: `${quarter.start.split("-")[1]}-${quarter.end.split("-")[1]}`,
        expenses: expensesInQuarter,
      };
    });

    // Filter records for the specified month
    const monthlyRecords = feedData.filter((log) => {
      const logDate = new Date(log.datePurchased);
      const logMonth = logDate.toISOString().slice(0, 7); // Format: YYYY-MM
      return logMonth === month;
    });

    // Filter records for the year
    const yearlyRecords = feedData.filter((log) => {
      const logDate = new Date(log.datePurchased);
      return logDate.getFullYear() === Number(year);
    });

    // Calculate Monthly Expenses
    const monthlyExpenses = monthlyRecords.reduce(
      (total, log) => total + (log.cost.toNumber() * log.bagsPurchased || 0),
      0
    );

    // Calculate Yearly Expenses
    const yearlyExpenses = yearlyRecords.reduce(
      (total, log) => total + (log.cost.toNumber() * log.bagsPurchased || 0),
      0
    );

    return NextResponse.json({
      monthlyExpenses,
      yearlyExpenses,
      quarterlyExpenses,
    });
  } catch (error) {
    console.error("Error fetching feed expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed expense data" },
      { status: 500 }
    );
  }
}
