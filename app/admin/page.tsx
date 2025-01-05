"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [feedInventory, setFeedInventory] = useState<{
    remainingBags: number;
    totalBought: number;
  } | null>(null);
  const [eggInventory, setEggInventory] = useState<{
    totalEggs: number;
    totalCrates: number;
  } | null>(null);

  const [crateInventory, setCrateInventory] = useState(0); // Crates (calculated)
  const [feedUsedToday, setFeedUsedToday] = useState(0);
  const [feedBoughtToday, setFeedBoughtToday] = useState(0);
  const [eggsLaidToday, setEggsLaidToday] = useState(0);
  const [eggsSoldToday, setEggsSoldToday] = useState(0);

  const [numberOfWorkers, setNumberOfWorkers] = useState(0); // Number of workers
  const [totalMonthlySalary, setTotalMonthlySalary] = useState(0); // Total monthly salary of workers
  const [eggsSoldMonthly, setEggsSoldMonthly] = useState(0); // Eggs sold this month
  const [totalFeedBought, setTotalFeedBought] = useState(0); // Feed bought this month
  const [monthlyProfit, setMonthlyProfit] = useState(0); // Profit for the current month

  const [birdData, setBirdData] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const today = getTodayDate();

        // Fetch feed data
        const feedRes = await fetch("/api/feed");
        const feedJson = await feedRes.json();

        // Fetch egg data
        const eggRes = await fetch("/api/eggs");
        const eggJson = await eggRes.json();

        //Fetch bird data
        const birdRes = await fetch("/api/birds");
        const birdJson = await birdRes.json();

        const workerRes = await fetch("/api/admin/workers");
        const workerJson = await workerRes.json();
        console.log(workerJson, workerRes);
        // Calculate feed inventory
        const todayFeedData = feedJson.data.filter(
          (feed: any) => feed.formattedDate === today
        );

        const totalMonthlySalary = workerJson.reduce(
          (sum: number, worker: any) => sum + parseFloat(worker.salary),
          0
        );

        const feedUsed = todayFeedData.reduce(
          (sum: number, feed: any) => sum + feed.bagsUsed,
          0
        );

        const feedBought = todayFeedData.reduce(
          (sum: number, feed: any) => sum + feed.bagsPurchased,
          0
        );

        // Calculate egg inventory
        const todayEggData = eggJson.data.filter(
          (egg: any) => egg.formattedDate === today
        );
        // Egg inventory based on the latest entry
        const latestEggEntry = eggJson.data[eggJson.data.length - 1];
        const latestFeedEntry = feedJson.data[feedJson.data.length - 1];
        const totalFeedBought = latestFeedEntry?.totalBagsPurchased || 0;
        const totalFeedAvailable = latestFeedEntry?.bagsAvailable || 0;
        const totalCrates = latestEggEntry?.cratesAvailable || 0;
        const totalEggs = totalCrates * 30;

        const eggsLaid = todayEggData.reduce(
          (sum: number, egg: any) => sum + egg.quantity,
          0
        );

        const eggSalesToday = eggJson.sales.filter(
          (egg: any) => egg.formattedDate === today
        );
        const eggsSold = eggSalesToday[eggSalesToday.length - 1]?.cratesSold;

        // Update state
        setFeedInventory({
          remainingBags: totalFeedAvailable,
          totalBought: totalFeedBought,
        });
        setFeedUsedToday(feedUsed);
        setFeedBoughtToday(feedBought);
        setEggInventory({ totalEggs, totalCrates });
        setEggsLaidToday(eggsLaid);
        setEggsSoldToday(eggsSold);
        setBirdData(birdJson.totalBirds);
        setNumberOfWorkers(workerJson.length);
        setTotalMonthlySalary(totalMonthlySalary);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feed Inventory */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold">Feed Inventory</h2>

          {/* Feed Used Today */}
          <div className="mt-4">
            <p className="text-gray-700">
              Feed Used Today:{" "}
              <span className="font-bold text-xl">{feedUsedToday}</span> bags
            </p>
          </div>

          {/* Feed Bought Today */}
          <div className="mt-4">
            <p className="text-gray-700">
              Feed Bought Today:{" "}
              <span className="font-bold text-xl"> {feedBoughtToday}</span> bags
            </p>
          </div>

          {/* Total Feed Available */}
          <div className="mt-4">
            <p className="text-gray-700">
              Total Feed Available:{" "}
              <span className="font-bold text-xl">
                {" "}
                {feedInventory?.remainingBags}
              </span>{" "}
              bags
            </p>
          </div>

          {/* Total Feed Bought */}
          <div className="mt-4">
            <p className="text-gray-700">
              Total Feed Bought:{" "}
              <span className="font-bold text-xl">
                {" "}
                {feedInventory?.totalBought}
              </span>{" "}
              bags
            </p>
          </div>
        </div>

        {/* Egg Inventory */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold">Egg Inventory</h2>

          {/* Eggs Laid Today */}
          <div className="mt-4">
            <p className="text-gray-700">
              Eggs Laid Today:{" "}
              <span className="font-bold text-xl">{eggsLaidToday}</span>
            </p>
            <p className="text-gray-500">
              Equivalent to{" "}
              <span className="font-bold">
                {Math.floor(eggsLaidToday / 30)}
              </span>{" "}
              crates
            </p>
          </div>

          {/* Eggs Sold Today */}
          <div className="mt-4">
            <p className="text-gray-700">
              Eggs Sold Today:{" "}
              <span className="font-bold text-xl">
                {eggsSoldToday * 30 || 0}
              </span>
            </p>
            <p className="text-gray-500">
              Equivalent to <span className="font-bold">{eggsSoldToday}</span>{" "}
              crates
            </p>
          </div>

          {/* Total Eggs Available */}
          <div className="mt-4">
            <p className="text-gray-700">
              Total Eggs Available:{" "}
              <span className="font-bold text-xl">
                {eggInventory?.totalEggs}
              </span>
            </p>
            <p className="text-gray-500">
              Equivalent to{" "}
              <span className="font-bold">{eggInventory?.totalCrates}</span>{" "}
              crates
            </p>
          </div>
        </div>

        {/* Number of Workers */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold">Number of Workers</h2>
          <p className="text-gray-700 mt-2">
            <span className="font-bold text-xl">{numberOfWorkers}</span> workers
          </p>
        </div>

        {/* Total Monthly Salary */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Monthly Salary</h2>
          <p className="text-gray-700 mt-2">
            <span className="font-bold text-xl">₦{totalMonthlySalary}</span>
          </p>
        </div>

        {/* Eggs Sold This Month */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold">Eggs Sold (Monthly)</h2>
          <p className="text-gray-700 mt-2">
            <span className="font-bold text-xl">{eggsSoldMonthly}</span> eggs
          </p>
        </div>

        {/* Total Feed Bought */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold">Feed Bought (Monthly)</h2>
          <p className="text-gray-700 mt-2">
            <span className="font-bold text-xl">{totalFeedBought}</span> bags
          </p>
        </div>

        {/* Monthly Profit */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold">Profit (Monthly)</h2>
          <p className="text-gray-700 mt-2">
            <span className="font-bold text-xl">
              {monthlyProfit.toLocaleString()} currency
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
