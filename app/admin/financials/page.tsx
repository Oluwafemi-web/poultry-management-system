"use client";

import { useState, useEffect } from "react";

// Define types for the data fetched
interface BirdLog {
  totalBirds: number;
}

interface QuarterlyData {
  quarter: string;
  amount: number;
}

interface FinancialCalculations {
  staffExpenses: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  eggIncome: {
    monthly: number;
    quarterly: Array<{ income: number; quarter: string }>;
    yearly: number;
  };
  feedData: {
    monthly: number;
    quarterly: Array<{ expenses: number; quarter: string }>;

    yearly: number;
  };
  profit: {
    monthly: number;
    quarterly: number[];
    yearly: number;
  };
}
const Financials = () => {
  const [workers, setWorkers] = useState([]);
  const [birdLog, setBirdLog] = useState<BirdLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentQuarter = Math.ceil(currentMonth / 3);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    currentDate.toISOString().slice(0, 7)
  ); //Get yyyy-mm format
  const [calculations, setCalculations] = useState<FinancialCalculations>({
    staffExpenses: {
      monthly: 0,
      quarterly: 0,
      yearly: 0,
    },
    eggIncome: {
      monthly: 0,
      quarterly: [],
      yearly: 0,
    },
    feedData: {
      monthly: 0,
      quarterly: [],
      yearly: 0,
    },
    profit: { monthly: 0, quarterly: [], yearly: 0 },
  });

  const [showFeedQuarters, setShowFeedQuarters] = useState(false);
  const [showEggQuarters, setShowEggQuarters] = useState(false);

  const toggleFeedQuarters = () => setShowFeedQuarters(!showFeedQuarters);
  const toggleEggQuarters = () => setShowEggQuarters(!showEggQuarters);

  // Function to handle month change and fetch egg income
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const fetchMonthlyData = async (month: string) => {
    if (!month) return;

    const response = await fetch(`/api/admin/egg-income?month=${month}`);
    const data = await response.json();

    const feedRes = await fetch(`/api/admin/feed-expense?month=${month}`);
    const fetchedFeedInventory = await feedRes.json();

    const birdRes = await fetch("/api/birds");
    const birdData = await birdRes.json();

    setBirdLog(birdData);
    if (response.ok) {
      setCalculations((prev) => ({
        ...prev,
        eggIncome: {
          ...prev.eggIncome,
          monthly: data.monthlyIncome,
          quarterly: data.quarterlyIncome,
          yearly: data.yearlyIncome,
        },
        feedData: {
          ...prev.feedData,
          monthly: fetchedFeedInventory.monthlyExpenses,
          quarterly: fetchedFeedInventory.quarterlyExpenses,
          yearly: fetchedFeedInventory.yearlyExpenses,
        },
      }));
    } else {
      console.error("Failed to fetch egg income for the month");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/admin/workers");
      const fetchedWorkers = await response.json();
      setWorkers(fetchedWorkers);

      const eggRes = await fetch("/api/eggs");
      const eggJson = await eggRes.json();
      setBirdLog(eggJson);
    };

    fetchData();
  }, []);

  // Fetch egg income whenever selectedMonth changes
  useEffect(() => {
    fetchMonthlyData(selectedMonth);
  }, [selectedMonth]); // This will trigger every time selectedMonth changes

  const totalStaffSalary = workers?.reduce(
    (sum: number, worker: any) => sum + parseFloat(worker.salary),
    0
  );
  const monthlyStaffExpenses = totalStaffSalary;
  const quarterlyStaffExpenses = totalStaffSalary * 3;
  const yearlyStaffExpenses = totalStaffSalary * 12;

  // Update calculations whenever workers change
  useEffect(() => {
    setCalculations((prev) => ({
      ...prev,
      staffExpenses: {
        monthly: monthlyStaffExpenses,
        quarterly: quarterlyStaffExpenses,
        yearly: yearlyStaffExpenses,
      },
    }));
  }, [workers]);

  // Calculate profit when calculations update
  useEffect(() => {
    const calculateProfit = () => {
      // Calculate monthly profit
      const monthlyProfit =
        calculations.eggIncome.monthly -
        (calculations.staffExpenses.monthly + calculations.feedData.monthly);

      // Calculate yearly profit
      const yearlyProfit =
        calculations.eggIncome.yearly -
        (calculations.staffExpenses.yearly + calculations.feedData.yearly);

      // Calculate quarterly profit as an array
      const quarterlyProfit =
        calculations.eggIncome.quarterly?.map((quarter: any, index) => {
          const quarterIncome = quarter?.income || 0;
          const quarterFeedExpense =
            calculations.feedData.quarterly?.[index]?.expenses || 0;
          const quarterStaffExpense = calculations.staffExpenses.quarterly || 0;
          // Assuming constant staff expense for all quarters
          console.log(quarterIncome, quarterFeedExpense, quarterFeedExpense);
          console.log(
            quarterIncome - (quarterFeedExpense + quarterStaffExpense)
          );

          return quarterIncome - (quarterFeedExpense + quarterStaffExpense);
        }) || [];

      // Update the profit calculations
      setCalculations((prev) => ({
        ...prev,
        profit: {
          monthly: monthlyProfit,
          yearly: yearlyProfit,
          quarterly: quarterlyProfit, // Array of quarterly profits
        },
      }));
    };

    // Ensure data is available before calculating
    if (
      calculations.eggIncome.quarterly?.length > 0 &&
      calculations.feedData.quarterly?.length > 0
    ) {
      calculateProfit();
    }
  }, [
    calculations.eggIncome,
    calculations.feedData,
    calculations.staffExpenses,
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Financials</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block font-medium mb-2">
          Select Month to View Data
        </label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      {loading && <p className="text-blue-500">Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium">Feed Metrics</h2>
          <p>
            Average cost to Feed a Bird per Day: ₦
            {(
              Math.ceil(calculations.feedData.monthly / 30) /
              (birdLog?.totalBirds || 1)
            ).toFixed(2)}
          </p>

          <p>
            Cost of feed in this month: ₦
            {calculations.feedData.monthly.toFixed(2)}
          </p>

          {showFeedQuarters
            ? calculations.feedData.quarterly.map((item: any, index) => {
                const [startMonth] = item.quarter.split("-").map(Number);
                const itemQuarter = Math.ceil(startMonth / 3);
                return (
                  <p key={index}>
                    Q{itemQuarter} - ₦{item.expenses.toFixed(2)}
                  </p>
                );
              })
            : calculations.feedData.quarterly
                .map((item: any) => {
                  const [startMonth] = item.quarter.split("-").map(Number);
                  const itemQuarter = Math.ceil(startMonth / 3);
                  return { ...item, itemQuarter };
                })
                .filter((item) => item.itemQuarter === currentQuarter)
                .map((item, index) => (
                  <p key={index}>
                    Cost of feed in this quarter(Q{item.itemQuarter}): ₦
                    {item.expenses.toFixed(2)}
                  </p>
                ))}
          <button
            onClick={toggleFeedQuarters}
            className="mt-2 text-blue-500 hover:underline"
          >
            {showFeedQuarters ? "Show Current Quarter" : "Show All Quarters"}
          </button>
          <p>
            Cost of feed in this year: ₦
            {calculations.feedData.yearly.toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium">Staff Expenses</h2>
          <p>
            Monthly Staff Expense: ₦
            {calculations.staffExpenses.monthly.toFixed(2)}
          </p>
          <p>
            Quarterly Staff Expense: ₦
            {calculations.staffExpenses.quarterly.toFixed(2)}
          </p>
          <p>
            Yearly Staff Expense: ₦
            {calculations.staffExpenses.yearly.toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium">Egg Income</h2>
          <p>
            Monthly Egg Income: ₦{calculations.eggIncome.monthly.toFixed(2)}
          </p>

          {showEggQuarters
            ? calculations.eggIncome.quarterly.map((item: any, index) => {
                const [startMonth] = item.quarter.split("-").map(Number);
                const itemQuarter = Math.ceil(startMonth / 3);
                return (
                  <p key={index}>
                    Q{itemQuarter} - ₦{item.income.toFixed(2)}
                  </p>
                );
              })
            : calculations.eggIncome.quarterly
                .map((item: any) => {
                  const [startMonth] = item.quarter.split("-").map(Number);
                  const itemQuarter = Math.ceil(startMonth / 3);
                  return { ...item, itemQuarter };
                })
                .filter((item) => item.itemQuarter === currentQuarter)
                .map((item, index) => (
                  <p key={index}>
                    Egg income in this quarter(Q{item.itemQuarter}): ₦
                    {item.income.toFixed(2)}
                  </p>
                ))}

          <button
            onClick={toggleEggQuarters}
            className="mt-2 text-blue-500 hover:underline"
          >
            {showEggQuarters ? "Show Current Quarter" : "Show All Quarters"}
          </button>

          <p>
            Egg Income this year: ₦{calculations.eggIncome.yearly.toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium">Net Profit</h2>
          <div className="mt-2 space-y-2">
            {/* Monthly Profit */}
            <p>
              <span className="font-medium">Monthly:</span> ₦
              {calculations.profit.monthly.toLocaleString()}
            </p>

            {/* Quarterly Profit */}
            <div>
              <span className="font-medium">Quarterly:</span>
              <ul className="list-disc list-inside">
                {calculations.profit.quarterly.map((profit, index) => (
                  <li key={index}>
                    Quarter {index + 1}: ₦{profit.toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>

            {/* Yearly Profit */}
            <p>
              <span className="font-medium">Yearly:</span> ₦
              {calculations.profit.yearly.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Financials;
