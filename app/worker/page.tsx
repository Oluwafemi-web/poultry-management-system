"use client";
import { useState, useEffect } from "react";
import Skeleton from "../components/skeleton";

export default function WorkerDashboard() {
  // State to store fetched data
  const [feedInventory, setFeedInventory] = useState<{
    remainingBags: number;
  } | null>(null);
  const [birdData, setBirdData] = useState<number | null>(null);
  const [feedUsedToday, setFeedUsedToday] = useState(0);
  const [eggsLaidToday, setEggsLaidToday] = useState(0);
  const [eggsSoldToday, setEggsSoldToday] = useState(0);
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
        // Calculate egg inventory
        const todayEggData = eggJson.data.filter(
          (egg: any) => egg.formattedDate === today
        );

        const eggsLaid = todayEggData.reduce(
          (sum: number, egg: any) => sum + egg.quantity,
          0
        );

        const eggSalesToday = eggJson.sales.filter(
          (egg: any) => egg.dformattedDate === today
        );
        const eggsSold = eggSalesToday[eggSalesToday.length - 1]?.cratesSold;

        const totalFeedAvailable =
          feedJson.data[feedJson.data.length - 1].bagsAvailable;

        // Update state
        setFeedInventory({
          remainingBags: totalFeedAvailable,
        });
        setEggsLaidToday(eggsLaid);
        setEggsSoldToday(eggsSold);
        setBirdData(birdJson.totalBirds); // Update bird data state
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return loading ? (
    <Skeleton />
  ) : (
    <>
      <h1 className="text-2xl font-bold">Welcome Back!</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium">Egg Inventory</h2>
          <p className="text-gray-600 mt-2">
            Total Eggs Today: <span className="font-bold">{eggsLaidToday}</span>
          </p>
          <p className="text-gray-600">
            Total Crates:{" "}
            <span className="font-bold">{eggsLaidToday / 30}</span>
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium">Feed Inventory</h2>
          <p className="text-gray-600 mt-2">
            Remaining Feed Bags:{" "}
            <span className="font-bold">
              {feedInventory?.remainingBags || 0}
            </span>
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium">Bird Inventory</h2>
          <p className="text-gray-600 mt-2">
            Total Birds: <span className="font-bold">{birdData || 0}</span>
          </p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold">Daily Logs</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium">Log Daily Updates</h3>
            <p className="text-gray-600 mt-2">
              Update Feed Usage, Egg Production and Bird Updates
            </p>
            <a
              href="/worker/logs/"
              className="text-blue-500 hover:underline mt-4 block"
            >
              Go to Daily Logs
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
