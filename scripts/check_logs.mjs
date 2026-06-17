import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const logs = await prisma.postLog.findMany({
  orderBy: { postedAt: "desc" },
  take: 10,
});

for (const l of logs) {
  console.log(`[${l.status}] ${l.topicTitle}`);
  console.log(`  Error: ${l.errorMessage?.substring(0, 200) || "none"}`);
  console.log(`  Image: ${l.imageUrl?.substring(0, 100) || "none"}`);
  console.log("");
}

if (!logs.length) console.log("No logs found");

await prisma.$disconnect();
