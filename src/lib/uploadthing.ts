import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function uploadImageFromUrl(
  imageUrl: string,
  topicSlug: string
): Promise<string> {
  const result = await utapi.uploadFilesFromUrl({
    url: imageUrl,
    name: `instauto_${topicSlug}_${Date.now()}.jpg`,
  });

  if (result.error) {
    throw new Error(
      `UploadThing upload failed: ${result.error.message || JSON.stringify(result.error)}`
    );
  }

  return result.data.ufsUrl;
}
