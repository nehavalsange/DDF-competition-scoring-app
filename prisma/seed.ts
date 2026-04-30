import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await db.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Admin",
      username: "admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin created:", admin.username);

  // Demo competition
  const competition = await db.competition.upsert({
    where: { id: "demo-competition-1" },
    update: {},
    create: {
      id: "demo-competition-1",
      name: "Munch Dance Championship 2025",
      eventDate: new Date("2025-12-15"),
      venue: "Grand Ballroom, City Center",
      description: "Annual dance competition showcasing talent across all age groups.",
      status: "PUBLISHED",
    },
  });
  console.log("✅ Competition created:", competition.name);

  // Teams
  const teams = [
    { teamCode: "MUNCH001", teamName: "Starlight Dancers", category: "JR_KIDS" as const },
    { teamCode: "MUNCH002", teamName: "Rainbow Warriors", category: "JR_KIDS" as const },
    { teamCode: "MUNCH003", teamName: "Little Flames", category: "JR_KIDS" as const },
    { teamCode: "MUNCH004", teamName: "Golden Troupe", category: "SR_KIDS" as const },
    { teamCode: "MUNCH005", teamName: "Phoenix Rising", category: "SR_KIDS" as const },
    { teamCode: "MUNCH006", teamName: "Electric Dreams", category: "SR_KIDS" as const },
    { teamCode: "MUNCH007", teamName: "The Monarchs", category: "ADULT" as const },
    { teamCode: "MUNCH008", teamName: "Velvet Edge", category: "ADULT" as const },
    { teamCode: "MUNCH009", teamName: "Storm Collective", category: "ADULT" as const },
  ];

  for (const team of teams) {
    await db.team.upsert({
      where: { competitionId_teamCode: { competitionId: competition.id, teamCode: team.teamCode } },
      update: {},
      create: { ...team, competitionId: competition.id, description: `${team.teamName} - Demo team` },
    });
  }
  console.log(`✅ ${teams.length} teams created`);

  // Judges
  const judges = [
    { name: "Sarah Johnson", username: "judge1", password: "judge123" },
    { name: "Michael Chen", username: "judge2", password: "judge123" },
    { name: "Priya Sharma", username: "judge3", password: "judge123" },
  ];

  for (const judgeData of judges) {
    const hash = await bcrypt.hash(judgeData.password, 12);
    const user = await db.user.upsert({
      where: { username: judgeData.username },
      update: {},
      create: {
        name: judgeData.name,
        username: judgeData.username,
        passwordHash: hash,
        role: "JUDGE",
      },
    });

    const judge = await db.judge.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    await db.judgeAssignment.upsert({
      where: { judgeId_competitionId: { judgeId: judge.id, competitionId: competition.id } },
      update: {},
      create: { judgeId: judge.id, competitionId: competition.id, userId: user.id },
    });
  }
  console.log(`✅ ${judges.length} judges created and assigned`);

  console.log("\n🎉 Seed complete!");
  console.log("\nLogin credentials:");
  console.log("  Admin: username=admin, password=admin123");
  console.log("  Judge: username=judge1, password=judge123");
  console.log("  Judge: username=judge2, password=judge123");
  console.log("  Judge: username=judge3, password=judge123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
