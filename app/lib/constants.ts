export const ALL_MODULES = [
  "LIVESTOCK",
  "FEED",
  "MEDICINE",
  "PRODUCTION",
  "EMPLOYEES",
  "EXPENSES",
  "SALES",
  "INVENTORY",
  "SUPPLIERS",
  "CUSTOMERS",
  "HEALTH",
] as const;

export type ModuleKeyString = (typeof ALL_MODULES)[number];

export const DEFAULT_MODULES: ModuleKeyString[] = [
  "LIVESTOCK",
  "FEED",
  "MEDICINE",
  "PRODUCTION",
  "EMPLOYEES",
  "EXPENSES",
  "SALES",
  "INVENTORY",
  "HEALTH",
];

export const SPECIES_PRESETS: Record<string, string[]> = {
  Chicken: ["Broilers", "Layers", "Chicks", "Breeders"],
  Pig: ["Piglets", "Growers", "Finishers", "Sows", "Boars"],
  Cattle: ["Calves", "Dairy", "Beef", "Breeding"],
  Goat: ["Kids", "Does", "Bucks", "Wethers"],
  Sheep: ["Lambs", "Ewes", "Rams"],
  Turkey: ["Poults", "Growers", "Breeders"],
  Duck: ["Ducklings", "Layers", "Meat"],
  Rabbit: ["Kits", "Growers", "Breeders"],
  Fish: ["Fingerlings", "Grow-out", "Broodstock"],
  Other: ["General"],
};

export const FARM_TYPES = [
  "Poultry",
  "Pig farming",
  "Cattle",
  "Goat",
  "Sheep",
  "Mixed livestock",
  "Other",
];
