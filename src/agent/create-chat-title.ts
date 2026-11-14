
"use server";

import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function generateChatTitle(prompt: string): Promise<string> {
  try {
    if (!prompt?.trim()) {
      return "New Shopping Chat";
    }

    const { text, finishReason, usage } = await generateText({
      model: groq("openai/gpt-oss-20b"),

      system: `You are a conversation title generator.

Generate a concise title for a shopping conversation.

Rules:
- Maximum 6 words.
- Ideally 3-5 words.
- Capture the user's primary intent.
- Use natural title case.
- No quotes, markdown, or punctuation.
- Never answer the user's question.
- Return ONLY the title.`,

      prompt: prompt.trim(),

      temperature: 0.3,
      maxOutputTokens: 50,
    });

    console.log("[Title Generation]", {
      text,
      finishReason,
      usage,
    });

    const title = text
      .trim()
      .replace(/^["'`]+|["'`]+$/g, "")
      .replace(/^title:\s*/i, "")
      .replace(/\s+/g, " ")
      .replace(/[.!?,;:]+$/g, "")
      .slice(0, 60);

    if (!title) {
      console.error("Title generation returned empty text");
      return "New Shopping Chat";
    }

    return title;
  } catch (error) {
    console.error("[Title Generation Error]", error);
    return "New Shopping Chat";
  }
}
