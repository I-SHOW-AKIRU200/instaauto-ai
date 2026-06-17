import { MetaMediaResponse, MetaPublishResponse } from "./types";

const GRAPH_API_BASE = "https://graph.facebook.com/v22.0";

export function buildOAuthUrl(): string {
  const appId = process.env.META_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;

  if (!appId) throw new Error("META_APP_ID is not configured");

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "instagram_basic",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
    ].join(","),
  });

  return `https://www.facebook.com/v22.0/dialog/oauth?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
}> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;

  if (!appId || !appSecret) throw new Error("Meta credentials not configured");

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch(
    `https://graph.facebook.com/v22.0/oauth/access_token?${params.toString()}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return { accessToken: data.access_token };
}

export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) throw new Error("Meta credentials not configured");

  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(
    `https://graph.facebook.com/v22.0/oauth/access_token?${params.toString()}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Long-lived token exchange failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

export async function getPageAccessToken(
  userAccessToken: string
): Promise<{
  pageId: string;
  pageAccessToken: string;
}> {
  const response = await fetch(
    `https://graph.facebook.com/v22.0/me/accounts?access_token=${userAccessToken}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch pages (${response.status}): ${text}`);
  }

  const data = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error("No Facebook Pages found for this user");
  }

  const page = data.data[0];
  return { pageId: page.id, pageAccessToken: page.access_token };
}

export async function getInstagramBusinessId(
  pageId: string,
  pageAccessToken: string
): Promise<string> {
  const response = await fetch(
    `https://graph.facebook.com/v22.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch Instagram Business Account (${response.status}): ${text}`);
  }

  const data = await response.json();

  if (!data.instagram_business_account?.id) {
    throw new Error(
      "No Instagram Business Account linked to this Facebook Page. Ensure an Instagram Business Account is connected."
    );
  }

  return data.instagram_business_account.id;
}

export async function createMediaContainer(
  instagramBusinessId: string,
  imageUrl: string,
  caption: string,
  accessToken: string
): Promise<string> {
  const response = await fetch(
    `https://graph.facebook.com/v22.0/${instagramBusinessId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: accessToken,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Media container creation failed (${response.status}): ${text}`);
  }

  const data: MetaMediaResponse = await response.json();
  return data.id;
}

export async function publishMediaContainer(
  instagramBusinessId: string,
  containerId: string,
  accessToken: string
): Promise<string> {
  const response = await fetch(
    `https://graph.facebook.com/v22.0/${instagramBusinessId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Media publish failed (${response.status}): ${text}`);
  }

  const data: MetaPublishResponse = await response.json();
  return data.id;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
