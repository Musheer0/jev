
"use server"
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function generateChatTitle(prompt: string): Promise<string> {
  const { text } = await generateText({
    model: groq("openai/gpt-oss-20b"),
    system: `
You generate short titles for shopping conversations.

Rules:
- Generate a title of 3-6 words.
- Capture the user's main shopping intent.
- Use natural title case.
- No quotes, punctuation, or explanations.
- Never answer the user's question.
- Return only the title.
`,
    prompt: `Generate a title for this conversation:\n${prompt}`,
    maxOutputTokens: 30,
  });

  return text.trim().replace(/^["']|["']$/g, "").slice(0, 60);
}
