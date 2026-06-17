import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const igBusinessId = "17841415178686539";
  const pageAccessToken = "EAAZBrZAwGBEvQBRjba0ZAT5lsaRbxsuriXdNYCLT6hqcXeVcMg55uoxTsJTiXoDjvntER3iSKtKyvrZCNzEtmEZAQqxh7F3N7jMgsSzqTT2fZBeamCPYF2WezZACmRbZAcp6nZBU3jFdWN8qvKn7ZA3axZAHYo9lyWMn4kx2DOCEZBE8fbwGfvVx2R5hUrujgdsftRqfxlsX";

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
      promptSettings: "Web Development Trends",
      scheduleHour: 9,
      isActive: true,
    },
  });

  console.log("✅ Seed complete — Instagram config saved for user:", user.email);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
