import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const config = await prisma.instagramConfig.findFirst({
      include: {
        logs: {
          orderBy: { postedAt: "desc" },
          take: 20,
        },
      },
    });

    if (!config) {
      return NextResponse.json({ config: null, recentLogs: [] });
    }

    return NextResponse.json({
      config: {
        id: config.id,
        instagramBusinessId: config.instagramBusinessId,
        promptSettings: config.promptSettings,
        scheduleHour: config.scheduleHour,
        timezoneOffset: config.timezoneOffset,
        lastPostedAt: config.lastPostedAt,
        isActive: config.isActive,
      },
      recentLogs: config.logs.map((log) => ({
        id: log.id,
        topicTitle: log.topicTitle,
        captionGenerated: log.captionGenerated,
        imageUrl: log.imageUrl,
        status: log.status,
        errorMessage: log.errorMessage,
        postedAt: log.postedAt.toISOString(),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch configuration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, promptSettings, scheduleHour, timezoneOffset, isActive } = body;

    let config;

    if (userId) {
      config = await prisma.instagramConfig.findUnique({ where: { userId } });
    } else if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        config = await prisma.instagramConfig.findUnique({ where: { userId: user.id } });
      }
    }

    if (!config) {
      config = await prisma.instagramConfig.findFirst();
    }

    if (!config) {
      return NextResponse.json(
        { error: "Instagram configuration not found. Connect your Instagram account first." },
        { status: 404 }
      );
    }

    const updated = await prisma.instagramConfig.update({
      where: { id: config.id },
      data: {
        ...(promptSettings !== undefined && { promptSettings }),
        ...(scheduleHour !== undefined && { scheduleHour }),
        ...(timezoneOffset !== undefined && { timezoneOffset }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      message: "Configuration updated successfully",
      config: {
        id: updated.id,
        instagramBusinessId: updated.instagramBusinessId,
        promptSettings: updated.promptSettings,
        scheduleHour: updated.scheduleHour,
        timezoneOffset: updated.timezoneOffset,
        isActive: updated.isActive,
        lastPostedAt: updated.lastPostedAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update configuration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
