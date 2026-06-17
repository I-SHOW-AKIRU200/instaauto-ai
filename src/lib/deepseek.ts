import { DeepSeekMessage, DeepSeekResponse } from "./types";

const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";
const MODEL_ID = "deepseek-ai/DeepSeek-V3";

function getAuthHeaders(): HeadersInit {
  const token = process.env.HF_API_TOKEN;
  if (!token) throw new Error("HF_API_TOKEN is not configured");
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function createCompletion(
  messages: DeepSeekMessage[],
  maxTokens = 120
): Promise<string> {
  const response = await fetch(HF_ROUTER_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      model: MODEL_ID,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${text}`);
  }

  const data: DeepSeekResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error("DeepSeek returned no choices");
  }

  return data.choices[0].message.content.trim();
}

export async function generateTopic(promptSettings: string): Promise<string> {
  const messages: DeepSeekMessage[] = [
    { role: "system", content: "You are a programmer humor writer. Generate concise, funny coding meme titles." },
    { role: "user", content: `Generate a specific funny coding meme concept for "${promptSettings}". Provide a concise one-sentence meme title that programmers will relate to.` },
  ];
  return createCompletion(messages, 60);
}

export async function generateArtPrompt(topic: string): Promise<string> {
  const messages: DeepSeekMessage[] = [
    { role: "system", content: "You are a visual artist creating prompts for funny coding meme images." },
    { role: "user", content: `Meme: "${topic}". Describe a simple, funny cartoon-style illustration that captures this coding meme. Keep it visually clean with no text or words. Focus on relatable programmer scenarios.` },
  ];
  return createCompletion(messages, 120);
}

export async function generateCaption(topic: string): Promise<string> {
  const messages: DeepSeekMessage[] = [
    { role: "system", content: "You are a programmer writing funny, relatable Instagram captions for coding memes." },
    { role: "user", content: `Meme: "${topic}". Write a short, funny Instagram caption about this coding meme. Use emojis and exactly 5 relevant programming hashtags. Make it relatable and humorous.` },
  ];
  return createCompletion(messages, 300);
}
