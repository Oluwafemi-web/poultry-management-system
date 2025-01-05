"use client";
import { useState } from "react";

const BirdsRecordPage = () => {
  const [formData, setFormData] = useState({
    numberOfBirds: "",
    cost: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/bird-expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseInt(formData.numberOfBirds),
          price: parseFloat(formData.cost),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save bird record");
      }

      setSuccess(true);
      setFormData({ numberOfBirds: "", cost: "" }); // Reset form
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h1 className="text-2xl font-bold mb-4">Initial Birds Record</h1>
      {success && (
        <p className="bg-green-100 text-green-700 p-2 rounded mb-4">
          Bird record saved successfully!
        </p>
      )}
      {error && (
        <p className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label
            htmlFor="numberOfBirds"
            className="block text-sm font-medium text-gray-700"
          >
            Number of Birds
          </label>
          <input
            type="text"
            inputMode="numeric"
            id="numberOfBirds"
            name="numberOfBirds"
            value={formData.numberOfBirds}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg  outline-none"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="cost"
            className="block text-sm font-medium text-gray-700"
          >
            Cost of Birds
          </label>
          <input
            type="text"
            inputMode="numeric"
            id="cost"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            step="0.01"
            required
            className="w-full px-4 py-2 border rounded-lg  outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {loading ? "Saving..." : "Save Record"}
        </button>
      </form>
    </div>
  );
};

export default BirdsRecordPage;
