import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getPageAccessToken,
  getInstagramBusinessId,
} from "@/lib/meta";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(
          `/dashboard?error=${encodeURIComponent("Instagram authentication was denied.")}`,
          process.env.NEXT_PUBLIC_APP_URL
        )
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(
          `/dashboard?error=${encodeURIComponent("No authorization code received.")}`,
          process.env.NEXT_PUBLIC_APP_URL
        )
      );
    }

    const { accessToken: shortLivedToken } = await exchangeCodeForToken(code);

    const { accessToken: longLivedToken } =
      await exchangeForLongLivedToken(shortLivedToken);

    const { pageId, pageAccessToken } = await getPageAccessToken(longLivedToken);

    const instagramBusinessId = await getInstagramBusinessId(
      pageId,
      pageAccessToken
    );

    const userEmail = `user_${instagramBusinessId}@placeholder.com`;

    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: { email: userEmail },
    });

    await prisma.instagramConfig.upsert({
      where: { userId: user.id },
      update: {
        instagramBusinessId,
        pageAccessToken,
        systemTokenStatus: "active",
      },
      create: {
        userId: user.id,
        instagramBusinessId,
        pageAccessToken,
        systemTokenStatus: "active",
        promptSettings: "Web Development Trends",
        scheduleHour: 9,
        isActive: true,
      },
    });

    return NextResponse.redirect(
      new URL(
        `/dashboard?success=${encodeURIComponent("Instagram account connected successfully!")}`,
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth callback failed";
    return NextResponse.redirect(
      new URL(
        `/dashboard?error=${encodeURIComponent(message)}`,
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }
}
