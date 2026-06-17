import { UTApi } from "uploadthing/server";

const utapi = new UTApi();
const testUrl = "https://image.pollinations.ai/prompt/test?width=1080&height=1080&nologo=true";

console.log("Uploading test image...");
const result = await utapi.uploadFilesFromUrl({
  url: testUrl,
  name: `test_${Date.now()}.jpg`,
});

if (result.error) {
  console.error("Upload failed:", result.error);
  process.exit(1);
}

console.log("Upload success!");
console.log("URL:", result.data.ufsUrl);
console.log("Key:", result.data.key);

// Test if URL is publicly accessible
console.log("\nTesting public access...");
const resp = await fetch(result.data.ufsUrl, { method: "HEAD" });
console.log("HTTP status:", resp.status);
console.log("Content-Type:", resp.headers.get("content-type"));
console.log("Publicly accessible:", resp.ok ? "YES" : "NO");
