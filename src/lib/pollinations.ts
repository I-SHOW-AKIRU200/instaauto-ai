export function buildPollinationsUrl(artPrompt: string): string {
  const encoded = encodeURIComponent(artPrompt);
  const seed = Date.now();
  return `https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1080&nologo=true&seed=${seed}`;
}
