import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const email = "admin@redditprofile.com";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin user already exists:", existing.email);
    return;
  }

  const admin = await prisma.user.create({
    data: {
      email,
      username: "admin",
      role: "admin",
      password: "",
    },
  });

  console.log("Admin user created:");
  console.log(`  Email: ${admin.email}`);
  console.log(`  Username: ${admin.username}`);
  console.log(`  Role: ${admin.role}`);
  console.log("  Note: Link a Google account by signing in with this email.");
}

main().catch(console.error);
