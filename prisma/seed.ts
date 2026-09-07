import { PrismaClient, FarmRole, InventoryType, ProductCategory, ListingStatus, PlatformRole, WageFrequency, ModuleKey } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_MODULES } from "../app/lib/constants";

const prisma = new PrismaClient();

async function main() {
  await prisma.listingInquiryMessage.deleteMany();
  await prisma.listingInquiry.deleteMany();
  await prisma.livestockListing.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplierProfile.deleteMany();
  await prisma.wagePayment.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.financialTxn.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.inventoryTxn.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.livestockBatch.deleteMany();
  await prisma.customFieldDef.deleteMany();
  await prisma.animalCategory.deleteMany();
  await prisma.animalSpecies.deleteMany();
  await prisma.farmModule.deleteMany();
  await prisma.farmMembership.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.create({
    data: {
      name: "Ada Owner",
      email: "owner@farm.com",
      password,
      platformRole: PlatformRole.OWNER,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Maya Manager",
      email: "manager@farm.com",
      password,
      platformRole: PlatformRole.MANAGER,
    },
  });

  const worker = await prisma.user.create({
    data: {
      name: "Wale Worker",
      email: "worker@farm.com",
      password,
      platformRole: PlatformRole.WORKER,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      name: "Bola Buyer",
      email: "buyer@farm.com",
      password,
      platformRole: PlatformRole.BUYER,
    },
  });

  const supplierUser = await prisma.user.create({
    data: {
      name: "Sam Supplier",
      email: "supplier@farm.com",
      password,
      platformRole: PlatformRole.BUYER,
    },
  });

  const farm = await prisma.farm.create({
    data: {
      name: "Green Valley Mixed Farm",
      farmTypes: ["Mixed livestock"],
      location: "Ibadan, Oyo",
      size: "12 acres",
      workerCount: 8,
      description: "Poultry and pig farm demo",
      onboarded: true,
      modules: {
        create: DEFAULT_MODULES.map((module) => ({
          module: module as ModuleKey,
          enabled: true,
        })),
      },
      memberships: {
        create: [
          { userId: owner.id, role: FarmRole.OWNER },
          { userId: manager.id, role: FarmRole.MANAGER },
          { userId: worker.id, role: FarmRole.WORKER },
        ],
      },
    },
  });

  const chicken = await prisma.animalSpecies.create({
    data: {
      farmId: farm.id,
      name: "Chicken",
      categories: {
        create: [
          { name: "Broilers" },
          { name: "Layers" },
          { name: "Chicks" },
        ],
      },
    },
    include: { categories: true },
  });

  const pig = await prisma.animalSpecies.create({
    data: {
      farmId: farm.id,
      name: "Pig",
      categories: {
        create: [
          { name: "Growers" },
          { name: "Sows" },
          { name: "Piglets" },
        ],
      },
    },
    include: { categories: true },
  });

  const broilerCat = chicken.categories.find((c) => c.name === "Broilers")!;
  const layerCat = chicken.categories.find((c) => c.name === "Layers")!;
  const growerCat = pig.categories.find((c) => c.name === "Growers")!;

  await prisma.livestockBatch.createMany({
    data: [
      {
        farmId: farm.id,
        categoryId: broilerCat.id,
        code: "BR-001",
        breed: "Cobb 500",
        initialQty: 1000,
        currentQty: 978,
        arrivalDate: new Date("2026-09-01"),
        avgWeight: 0.65,
        location: "House A",
      },
      {
        farmId: farm.id,
        categoryId: layerCat.id,
        code: "LY-001",
        breed: "Isa Brown",
        initialQty: 800,
        currentQty: 790,
        arrivalDate: new Date("2026-06-01"),
        location: "House B",
      },
      {
        farmId: farm.id,
        categoryId: growerCat.id,
        code: "PG-001",
        breed: "Large White",
        initialQty: 80,
        currentQty: 78,
        arrivalDate: new Date("2026-07-15"),
        location: "Pen 3",
      },
    ],
  });

  await prisma.customFieldDef.createMany({
    data: [
      {
        farmId: farm.id,
        entity: "BATCH",
        key: "batch_number",
        label: "Batch Number",
        fieldType: "TEXT",
      },
      {
        farmId: farm.id,
        entity: "BATCH",
        key: "breed",
        label: "Breed",
        fieldType: "TEXT",
      },
    ],
  });

  const feed = await prisma.inventoryItem.create({
    data: {
      farmId: farm.id,
      type: InventoryType.FEED,
      name: "Broiler Starter",
      unit: "kg",
      quantity: 350,
      lowStockThreshold: 100,
      unitCost: 450,
    },
  });

  await prisma.inventoryItem.createMany({
    data: [
      {
        farmId: farm.id,
        type: InventoryType.FEED,
        name: "Broiler Finisher",
        unit: "kg",
        quantity: 120,
        lowStockThreshold: 150,
        unitCost: 480,
      },
      {
        farmId: farm.id,
        type: InventoryType.FEED,
        name: "Layer Feed",
        unit: "kg",
        quantity: 500,
        lowStockThreshold: 100,
        unitCost: 420,
      },
      {
        farmId: farm.id,
        type: InventoryType.MEDICINE,
        name: "Newcastle Vaccine",
        unit: "doses",
        quantity: 40,
        lowStockThreshold: 20,
        unitCost: 25,
      },
    ],
  });

  await prisma.inventoryTxn.create({
    data: {
      itemId: feed.id,
      type: "PURCHASE",
      quantity: 350,
      unitCost: 450,
      notes: "Initial stock",
    },
  });

  await prisma.employee.create({
    data: {
      farmId: farm.id,
      userId: worker.id,
      name: "Wale Worker",
      roleTitle: "Farm Worker",
      contact: "08030000000",
      wage: 75000,
      wageFrequency: WageFrequency.MONTHLY,
      responsibilities: "Daily feeding, egg collection, mortality logging",
    },
  });

  await prisma.employee.create({
    data: {
      farmId: farm.id,
      name: "Chidi Cleaner",
      roleTitle: "Cleaner",
      wage: 45000,
      wageFrequency: WageFrequency.MONTHLY,
    },
  });

  const now = new Date();
  const monthsBack = (n: number) =>
    new Date(now.getFullYear(), now.getMonth() - n, 12);

  await prisma.financialTxn.createMany({
    data: [
      {
        farmId: farm.id,
        type: "EXPENSE",
        category: "Feed",
        amount: 142000,
        date: monthsBack(5),
        notes: "Starter mash",
      },
      {
        farmId: farm.id,
        type: "REVENUE",
        category: "Egg sales",
        amount: 280000,
        date: monthsBack(5),
        notes: "Crate sales",
      },
      {
        farmId: farm.id,
        type: "EXPENSE",
        category: "Feed",
        amount: 168000,
        date: monthsBack(4),
        notes: "Grower feed",
      },
      {
        farmId: farm.id,
        type: "EXPENSE",
        category: "Medicine",
        amount: 32000,
        date: monthsBack(4),
        notes: "Vaccines",
      },
      {
        farmId: farm.id,
        type: "REVENUE",
        category: "Egg sales",
        amount: 310000,
        date: monthsBack(4),
        notes: "Crate sales",
      },
      {
        farmId: farm.id,
        type: "EXPENSE",
        category: "Feed",
        amount: 175000,
        date: monthsBack(3),
        notes: "Layer mash",
      },
      {
        farmId: farm.id,
        type: "REVENUE",
        category: "Egg sales",
        amount: 365000,
        date: monthsBack(3),
        notes: "Crate sales",
      },
      {
        farmId: farm.id,
        type: "REVENUE",
        category: "Livestock sales",
        amount: 420000,
        date: monthsBack(3),
        notes: "Broiler batch",
      },
      {
        farmId: farm.id,
        type: "EXPENSE",
        category: "Labour",
        amount: 120000,
        date: monthsBack(2),
        notes: "Wages",
      },
      {
        farmId: farm.id,
        type: "EXPENSE",
        category: "Feed",
        amount: 190000,
        date: monthsBack(2),
        notes: "Feed restock",
      },
      {
        farmId: farm.id,
        type: "REVENUE",
        category: "Egg sales",
        amount: 390000,
        date: monthsBack(2),
        notes: "Crate sales",
      },
      {
        farmId: farm.id,
        type: "EXPENSE",
        category: "Feed",
        amount: 155000,
        date: monthsBack(1),
        notes: "Feed",
      },
      {
        farmId: farm.id,
        type: "REVENUE",
        category: "Egg sales",
        amount: 410000,
        date: monthsBack(1),
        notes: "Crate sales",
      },
      {
        farmId: farm.id,
        type: "REVENUE",
        category: "Livestock sales",
        amount: 580000,
        date: monthsBack(1),
        notes: "Goat sales",
      },
      {
        farmId: farm.id,
        type: "EXPENSE",
        category: "Feed",
        amount: 157500,
        date: now,
        notes: "Broiler starter purchase",
      },
      {
        farmId: farm.id,
        type: "EXPENSE",
        category: "Labour",
        amount: 120000,
        date: now,
        notes: "September wages",
      },
      {
        farmId: farm.id,
        type: "REVENUE",
        category: "Egg sales",
        amount: 450000,
        date: now,
        notes: "Crate sales",
      },
      {
        farmId: farm.id,
        type: "REVENUE",
        category: "Livestock sales",
        amount: 1000000,
        date: now,
        notes: "Broiler sales",
      },
    ],
  });

  const supplier = await prisma.supplierProfile.create({
    data: {
      userId: supplierUser.id,
      businessName: "AgroSupply Nigeria",
      location: "Lagos",
      contact: "08011112222",
      description: "Quality feed, medicine, and farm equipment",
      rating: 4.6,
      products: {
        create: [
          {
            name: "Broiler Starter 25kg",
            category: ProductCategory.FEED,
            description: "High protein starter mash",
            price: 12500,
            unit: "bag",
            stock: 200,
          },
          {
            name: "Antibiotic Pack",
            category: ProductCategory.MEDICINE,
            description: "Broad spectrum poultry antibiotic",
            price: 8500,
            unit: "pack",
            stock: 50,
          },
          {
            name: "Automatic Drinker",
            category: ProductCategory.EQUIPMENT,
            description: "Bell drinker for poultry houses",
            price: 4500,
            unit: "unit",
            stock: 80,
          },
        ],
      },
    },
  });

  await prisma.livestockListing.create({
    data: {
      farmId: farm.id,
      title: "Broiler Chickens — 6 weeks",
      animalType: "Chicken",
      breed: "Cobb 500",
      quantity: 200,
      age: "6 weeks",
      weight: "1.8 kg avg",
      price: 4500,
      location: "Ibadan, Oyo",
      description: "Healthy broilers ready for sale",
      photos: [],
      status: ListingStatus.ACTIVE,
    },
  });

  await prisma.cart.create({
    data: { userId: buyer.id },
  });

  console.log("Seed complete");
  console.log({
    owner: "owner@farm.com / password123",
    manager: "manager@farm.com / password123",
    worker: "worker@farm.com / password123",
    buyer: "buyer@farm.com / password123",
    supplier: "supplier@farm.com / password123",
    farm: farm.name,
    supplierId: supplier.id,
    modules: Object.values(ModuleKey).length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
