"use client";

import { useState } from "react";

export default function DailyLogs() {
  const [feedUsed, setFeedUsed] = useState(0);
  const [feedPurchased, setFeedPurchased] = useState(0);
  const [feedCost, setFeedCost] = useState(0);

  const [eggsLaid, setEggsLaid] = useState(0);
  const [eggsSold, setEggsSold] = useState(0);
  const [cratePrice, setCratePrice] = useState(0);

  const [birdsMortality, setBirdsMortality] = useState(0);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const clearFields = () => {
    setEggsLaid(0);
    setEggsSold(0);
    setFeedCost(0);
    setFeedPurchased(0);
    setFeedUsed(0);
    setBirdsMortality(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsModalOpen(true);
    setMessage("Submitting daily logs...");

    const cratesLaid = Math.floor(eggsLaid / 30);
    const cratesSold = Math.floor(eggsSold / 30);

    const logData = {
      feed: {
        used: feedUsed,
        purchased: feedPurchased,
        cost: feedCost,
      },
      eggs: {
        laid: eggsLaid,
        sold: eggsSold,
        cratesLaid,
        cratesSold,
        price: cratePrice,
      },
      birds: {
        mortality: birdsMortality,
      },
    };

    try {
      const response = await fetch("/api/worker/daily/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      });

      if (response.ok) {
        setMessage("Daily logs updated successfully!");
        clearFields();
      } else if (response.status === 400) {
        const { error } = await response.json();
        setMessage(error || "Logs for today have already been submitted.");
      } else {
        setMessage("Failed to update daily logs. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMessage(""); // Clear the message when the modal is closed
  };

  return (
    <div className="px-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Daily Logs</h1>
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto space-y-6"
      >
        {/* Feed Logs */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Feed Logs</h2>
          <label className="block mb-2">
            Bags of Feed Used
            <input
              type="text"
              inputMode="numeric"
              value={feedUsed}
              onChange={(e) => setFeedUsed(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 outline-none"
              required
            />
          </label>
          <label className="block mb-2">
            Bags of Feed Purchased
            <input
              type="text"
              inputMode="numeric"
              value={feedPurchased}
              onChange={(e) => setFeedPurchased(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 outline-none"
            />
          </label>
          <label className="block mb-2">
            Cost of Feed Purchased (Single Bag)
            <input
              type="text"
              inputMode="numeric"
              value={feedCost}
              onChange={(e) => setFeedCost(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 outline-none"
            />
          </label>
        </div>

        {/* Egg Logs */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Egg Logs</h2>
          <label className="block mb-2">
            Number of Eggs Laid
            <input
              type="text"
              inputMode="numeric"
              value={eggsLaid}
              onChange={(e) => setEggsLaid(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 outline-none"
              required
            />
          </label>
          <label className="block mb-2">
            Number of Eggs Sold
            <input
              type="text"
              inputMode="numeric"
              value={eggsSold}
              onChange={(e) => setEggsSold(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 outline-none"
            />
          </label>
          <label className="block mb-2">
            Price Per Crate
            <input
              type="text"
              inputMode="numeric"
              value={cratePrice}
              onChange={(e) => setCratePrice(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 outline-none"
            />
          </label>
        </div>

        {/* Bird Mortality Logs */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Bird Mortality</h2>
          <label className="block mb-2">
            Number of Birds Lost
            <input
              type="text"
              inputMode="numeric"
              value={birdsMortality}
              onChange={(e) => setBirdsMortality(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 outline-none"
            />
          </label>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit Logs
        </button>
      </form>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Notification</h2>
            <p className="mb-4">
              {loading ? "Submitting daily logs..." : message}
            </p>
            {!loading && (
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
