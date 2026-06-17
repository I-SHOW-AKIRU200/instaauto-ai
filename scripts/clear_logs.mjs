import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const result = await p.postLog.deleteMany({ where: { status: "FAILED" } });
console.log(`Cleared ${result.count} failed logs`);
await p.$disconnect();
