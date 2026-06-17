import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTopic, generateArtPrompt, generateCaption } from "@/lib/deepseek";
import { buildPollinationsUrl } from "@/lib/pollinations";
import { uploadImageFromUrl } from "@/lib/uploadthing";
import {
  createMediaContainer,
  publishMediaContainer,
  sleep,
} from "@/lib/meta";

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}

async function handleCron(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentHour = new Date().getUTCHours();
    const adjustedHour = (currentHour - 3 + 24) % 24;

    const activeConfigs = await prisma.instagramConfig.findMany({
      where: {
        isActive: true,
        systemTokenStatus: "active",
        scheduleHour: adjustedHour,
      },
      include: { user: true },
    });

    if (activeConfigs.length === 0) {
      return NextResponse.json({
        message: "No active configurations matched the current schedule hour",
        checkedHour: adjustedHour,
      });
    }

    const results: {
      configId: string;
      status: string;
      topicTitle?: string;
      error?: string;
    }[] = [];

    for (const config of activeConfigs) {
      try {
        const topicTitle = await generateTopic(config.promptSettings);
        const artPrompt = await generateArtPrompt(topicTitle);
        const caption = await generateCaption(topicTitle);

        const pollinationsUrl = buildPollinationsUrl(
          `${artPrompt}, cartoon comic style, funny meme, vibrant colors, simple flat illustration, no text, no words, no letters.`
        );

        const imageUrl = await uploadImageFromUrl(
          pollinationsUrl,
          topicTitle.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 48)
        );

        const containerId = await createMediaContainer(
          config.instagramBusinessId,
          imageUrl,
          caption,
          config.pageAccessToken
        );

        await sleep(60000);

        let published = false;
        let publishAttempts = 0;
        const maxPublishAttempts = 5;

        while (!published && publishAttempts < maxPublishAttempts) {
          try {
            await publishMediaContainer(
              config.instagramBusinessId,
              containerId,
              config.pageAccessToken
            );
            published = true;
          } catch (err) {
            publishAttempts++;
            const msg = err instanceof Error ? err.message : "";
            if (publishAttempts >= maxPublishAttempts) {
              throw new Error(`Publish failed after ${maxPublishAttempts} attempts: ${msg}`);
            }
            await sleep(30000);
          }
        }

        await prisma.instagramConfig.update({
          where: { id: config.id },
          data: { lastPostedAt: new Date() },
        });

        await prisma.postLog.create({
          data: {
            configId: config.id,
            topicTitle,
            captionGenerated: caption,
            imageUrl,
            status: "SUCCESS",
          },
        });

        results.push({
          configId: config.id,
          status: "SUCCESS",
          topicTitle,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown pipeline error";

        await prisma.postLog.create({
          data: {
            configId: config.id,
            topicTitle: "Pipeline Error",
            status: "FAILED",
            errorMessage,
          },
        });

        results.push({
          configId: config.id,
          status: "FAILED",
          error: errorMessage,
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${activeConfigs.length} configurations`,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron worker failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
