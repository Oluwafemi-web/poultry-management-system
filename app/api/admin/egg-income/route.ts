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
    // Convert selected month to a proper date and handle month overflow
    const startOfYear = new Date(`${year}-${"01"}-01`);
    const startOfNextYear = new Date(startOfYear);
    startOfNextYear.setFullYear(startOfNextYear.getFullYear() + 1);

    const currentYear = new Date().getFullYear(); // Get the current year

    // Define the start and end of each quarter
    const quarters = [
      { start: `${year}-01-01`, end: `${year}-03-31` }, // Q1
      { start: `${year}-04-01`, end: `${year}-06-30` }, // Q2
      { start: `${year}-07-01`, end: `${year}-09-30` }, // Q3
      { start: `${year}-10-01`, end: `${year}-12-31` }, // Q4
    ];

    // Fetch data for the entire year
    const incomeData = await prisma.eggsSales.findMany({
      where: {
        dateSold: {
          gte: startOfYear, // Start of the year
          lt: startOfNextYear, // Start of next year
        },
      },
    });

    const quarterlyIncome = quarters.map((quarter) => {
      const incomeInQuarter = incomeData
        .filter((log) => {
          const logDate = new Date(log.dateSold);
          return (
            logDate >= new Date(quarter.start) &&
            logDate <= new Date(quarter.end)
          );
        })
        .reduce((total, log) => total + log.totalSaleAmount.toNumber(), 0);

      return {
        quarter: `${quarter.start.split("-")[1]}-${quarter.end.split("-")[1]}`,
        income: incomeInQuarter,
      };
    });

    // Filter records for the specified month
    const monthlyRecords = incomeData.filter((log) => {
      const logDate = new Date(log.dateSold);
      const logMonth = logDate.toISOString().slice(0, 7); // Format: YYYY-MM
      return logMonth === month;
    });

    // Filter records for the current year
    const yearlyRecords = incomeData.filter((log) => {
      const logDate = new Date(log.dateSold);
      return logDate.getFullYear() === currentYear;
    });

    // Ensure incomeData is not empty and handle cases where no records are found
    if (!incomeData.length) {
      return NextResponse.json(
        { error: "No records found for the specified month" },
        { status: 404 }
      );
    }

    // Calculate Monthly Income
    const monthlyIncome = monthlyRecords.reduce((total, log) => {
      const saleAmount = log.totalSaleAmount
        ? log.totalSaleAmount.toNumber()
        : 0; // Ensure safe check for nullable values
      return total + saleAmount;
    }, 0);

    // Calculate Yearly Income
    const yearlyIncome = yearlyRecords.reduce((total, log) => {
      const saleAmount = log.totalSaleAmount
        ? log.totalSaleAmount.toNumber()
        : 0;
      return total + saleAmount;
    }, 0);

    return NextResponse.json({ monthlyIncome, yearlyIncome, quarterlyIncome });
  } catch (error) {
    console.error("Error fetching egg income:", error);
    return NextResponse.json(
      { error: "Failed to fetch egg income data" },
      { status: 500 }
    );
  }
}
