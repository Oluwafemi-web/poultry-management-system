"use client";

import { useState, useEffect } from "react";

interface Worker {
  id: number; // Unique ID for each worker (e.g., from the database)
  name: string;
  salary: number;
}

export default function AdminLogs() {
  const [workers, setWorkers] = useState<Worker[]>([]); // List of workers
  const [workerName, setWorkerName] = useState(""); // New worker name
  const [workerSalary, setWorkerSalary] = useState<number | "">(""); // New worker salary
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch existing workers
  const fetchWorkers = async () => {
    try {
      const response = await fetch("/api/admin/workers");
      const data = await response.json();
      setWorkers(data); // Update state with the fetched workers
    } catch (error) {
      console.error("Failed to fetch workers:", error);
    }
  };

  useEffect(() => {
    fetchWorkers(); // Fetch workers on component mount
  }, []);

  // Handle form submission
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workerName || workerSalary === "" || workerSalary <= 0) {
      setErrorMessage("Please provide a valid name and salary.");
      return;
    }

    try {
      const response = await fetch("/api/admin/workers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: workerName, salary: workerSalary }),
      });

      if (!response.ok) {
        throw new Error("Failed to add worker.");
      }

      setWorkerName(""); // Reset form inputs
      setWorkerSalary("");
      setErrorMessage("");

      await fetchWorkers(); // Fetch updated workers after successful addition
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred while adding the worker.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Logs</h1>

      {/* Add New Worker Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Worker</h2>
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        <form onSubmit={handleAddWorker}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Worker Name
            </label>
            <input
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter worker's name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Salary
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={workerSalary}
              onChange={(e) => setWorkerSalary(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter worker's salary"
              min="1"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Worker
          </button>
        </form>
      </div>

      {/* Workers List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Workers List</h2>
        {workers.length === 0 ? (
          <p className="text-gray-500">No workers added yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {workers.map((worker) => (
              <li key={worker.id} className="py-4 flex justify-between">
                <span>{worker.name}</span>
                <span className="font-bold"> ₦{worker.salary}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
