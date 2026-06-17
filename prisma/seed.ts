import { PrismaClient } from "@prisma/client";
import { createInterface } from "readline";

const prisma = new PrismaClient();

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

async function main() {
  const igBusinessId =
    process.env.INSTAGRAM_BUSINESS_ID ||
    (await ask("Enter your Instagram Business ID: "));

  const pageAccessToken =
    process.env.PAGE_ACCESS_TOKEN ||
    (await ask("Enter your Facebook Page Access Token: "));

  if (!igBusinessId || !pageAccessToken) {
    console.error("Both Instagram Business ID and Page Access Token are required.");
    process.exit(1);
  }

  const userEmail = `user_${igBusinessId}@placeholder.com`;

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: { email: userEmail },
  });

  await prisma.instagramConfig.upsert({
    where: { userId: user.id },
    update: {
      instagramBusinessId: igBusinessId,
      pageAccessToken,
      systemTokenStatus: "active",
    },
    create: {
      userId: user.id,
      instagramBusinessId: igBusinessId,
      pageAccessToken,
      systemTokenStatus: "active",
      promptSettings: "Coding Memes",
      scheduleHour: 9,
      isActive: true,
    },
  });

  console.log("✅ Instagram config saved for user:", user.email);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
