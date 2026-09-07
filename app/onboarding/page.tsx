"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ALL_MODULES,
  FARM_TYPES,
  ModuleKeyString,
  SPECIES_PRESETS,
} from "@/app/lib/constants";

const STEPS = [
  "Create farm",
  "Animals",
  "Categories",
  "Modules",
  "Custom fields",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [farmTypes, setFarmTypes] = useState<string[]>(["Poultry"]);
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [workerCount, setWorkerCount] = useState("");
  const [description, setDescription] = useState("");

  const [selectedSpecies, setSelectedSpecies] = useState<string[]>(["Chicken"]);
  const [categories, setCategories] = useState<Record<string, string[]>>({
    Chicken: ["Broilers", "Layers"],
  });
  const [modules, setModules] = useState<ModuleKeyString[]>([
    "LIVESTOCK",
    "FEED",
    "MEDICINE",
    "PRODUCTION",
    "EMPLOYEES",
    "EXPENSES",
    "SALES",
    "INVENTORY",
    "HEALTH",
  ]);
  const [customFieldLabel, setCustomFieldLabel] = useState("");
  const [customFields, setCustomFields] = useState<
    { entity: string; key: string; label: string }[]
  >([]);

  const speciesList = useMemo(() => Object.keys(SPECIES_PRESETS), []);

  function toggleFarmType(t: string) {
    setFarmTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function toggleSpecies(s: string) {
    setSelectedSpecies((prev) => {
      if (prev.includes(s)) {
        const next = prev.filter((x) => x !== s);
        setCategories((c) => {
          const copy = { ...c };
          delete copy[s];
          return copy;
        });
        return next;
      }
      setCategories((c) => ({
        ...c,
        [s]: SPECIES_PRESETS[s]?.slice(0, 2) || ["General"],
      }));
      return [...prev, s];
    });
  }

  function toggleCategory(species: string, cat: string) {
    setCategories((prev) => {
      const current = prev[species] || [];
      return {
        ...prev,
        [species]: current.includes(cat)
          ? current.filter((c) => c !== cat)
          : [...current, cat],
      };
    });
  }

  function addCustomCategory(species: string, value: string) {
    if (!value.trim()) return;
    setCategories((prev) => ({
      ...prev,
      [species]: [...(prev[species] || []), value.trim()],
    }));
  }

  function toggleModule(m: ModuleKeyString) {
    setModules((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  async function finish(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          farmTypes,
          location,
          size,
          workerCount:
            workerCount === "" ? undefined : Number(workerCount),
          description,
          species: selectedSpecies.map((s) => ({
            name: s,
            categories: categories[s] || ["General"],
          })),
          modules,
          customFields,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create farm");

      const sessionRes = await fetch("/api/farm/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmId: data.farm.id }),
      });
      const sessionData = await sessionRes.json();
      await update(sessionData);
      toast.success("Farm set up successfully");
      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-stone-900 to-stone-800 text-white">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-emerald-300 text-sm font-medium">Welcome to your farm</p>
        <h1 className="mt-2 text-3xl font-semibold">{STEPS[step]}</h1>
        <p className="mt-1 text-stone-300 text-sm">
          Step {step + 1} of {STEPS.length} — configure once, manage easily.
        </p>

        <div className="mt-6 flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-emerald-400" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-white text-stone-900 p-6 shadow-xl">
          {step === 0 && (
            <div className="space-y-4">
              <label className="block text-sm">
                Farm name
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  placeholder="e.g. Green Valley Farm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <div>
                <p className="text-sm mb-2">Farm type</p>
                <div className="flex flex-wrap gap-2">
                  {FARM_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleFarmType(t)}
                      className={`rounded-full px-3 py-1 text-sm border ${
                        farmTypes.includes(t)
                          ? "bg-emerald-800 text-white border-emerald-800"
                          : "border-stone-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block text-sm">
                Location
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  placeholder="e.g. Ibadan, Oyo"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  Size
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. 5 acres"
                  />
                </label>
                <label className="block text-sm">
                  Workers
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    placeholder="e.g. 5"
                    value={workerCount}
                    onChange={(e) => setWorkerCount(e.target.value)}
                  />
                </label>
              </div>
              <label className="block text-sm">
                Description
                <textarea
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  rows={3}
                  placeholder="Brief description of your farm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-sm text-stone-600 mb-3">
                What animals do you keep?
              </p>
              <div className="flex flex-wrap gap-2">
                {speciesList.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecies(s)}
                    className={`rounded-full px-3 py-1.5 text-sm border ${
                      selectedSpecies.includes(s)
                        ? "bg-emerald-800 text-white border-emerald-800"
                        : "border-stone-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {selectedSpecies.map((s) => (
                <div key={s}>
                  <p className="font-medium">{s}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(SPECIES_PRESETS[s] || []).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCategory(s, c)}
                        className={`rounded-full px-3 py-1 text-sm border ${
                          (categories[s] || []).includes(c)
                            ? "bg-emerald-800 text-white border-emerald-800"
                            : "border-stone-300"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      id={`custom-${s}`}
                      className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
                      placeholder="Custom category"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomCategory(s, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="text-sm text-emerald-800"
                      onClick={() => {
                        const el = document.getElementById(
                          `custom-${s}`
                        ) as HTMLInputElement;
                        addCustomCategory(s, el.value);
                        el.value = "";
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-2">
              {ALL_MODULES.map((m) => (
                <label
                  key={m}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={modules.includes(m)}
                    onChange={() => toggleModule(m)}
                  />
                  {m.replaceAll("_", " ")}
                </label>
              ))}
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-sm text-stone-600 mb-3">
                Optional: add custom fields for batches (e.g. Breed, Pen).
              </p>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border px-3 py-2"
                  value={customFieldLabel}
                  onChange={(e) => setCustomFieldLabel(e.target.value)}
                  placeholder="Field label"
                />
                <button
                  type="button"
                  className="rounded-lg bg-stone-800 text-white px-3"
                  onClick={() => {
                    if (!customFieldLabel.trim()) return;
                    const label = customFieldLabel.trim();
                    const key = label.toLowerCase().replace(/\s+/g, "_");
                    setCustomFields((prev) => [
                      ...prev,
                      { entity: "BATCH", key, label },
                    ]);
                    setCustomFieldLabel("");
                  }}
                >
                  Add
                </button>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {customFields.map((f) => (
                  <li key={f.key} className="text-stone-700">
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
              className="rounded-lg px-4 py-2 text-sm border disabled:opacity-40"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 0 && !name) {
                    setError("Farm name is required");
                    return;
                  }
                  if (step === 1 && selectedSpecies.length === 0) {
                    setError("Select at least one animal");
                    return;
                  }
                  setError("");
                  setStep((s) => s + 1);
                }}
                className="rounded-lg bg-emerald-800 text-white px-4 py-2 text-sm"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => finish()}
                className="rounded-lg bg-emerald-800 text-white px-4 py-2 text-sm disabled:opacity-60"
              >
                {loading ? "Setting up…" : "Your farm is ready"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
