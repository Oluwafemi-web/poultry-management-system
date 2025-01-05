// createPredefinedUsers.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function createUsers() {
  const hashedAdminPassword = await bcrypt.hash("Admin123@", 10);
  const hashedWorkerPassword = await bcrypt.hash("Worker123@", 10);
  try {
    const users = await prisma.user.createMany({
      data: [
        {
          name: "Admin User",
          email: "poultryadmin@gmail.com",
          password: hashedAdminPassword, // Make sure to hash the password
          role: "admin",
        },
        {
          name: "Worker User",
          email: "poultryworker@gmail.com",
          password: hashedWorkerPassword,
          role: "worker",
        },
      ],
    });
    console.log("Users created successfully:", users);
  } catch (error) {
    console.error("Error creating users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();
