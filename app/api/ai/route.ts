import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { GoogleGenerativeAIStream, StreamingTextResponse } from "ai";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { formatResponse } from "@/utils/formatResponse";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const { messages, userId, chatId } = await req.json();

    let activeChatId = chatId;
    if (!activeChatId) {
      const newChat = await db.chat.create({
        data: {
          userId,
          title: "New Chat",
        },
      });
      activeChatId = newChat.id;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT" as HarmCategory,
          threshold: "BLOCK_MEDIUM_AND_ABOVE" as HarmBlockThreshold,
        },
      ],
    });

    const geminiStream = await model.generateContentStream({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Your name is Coach Robert. You are a friendly and supportive virtual assistant focused solely on basketball topics. 
              Respond to questions about basketball in a conversational and relatable manner. 
              Avoid discussing non-basketball subjects, and refrain from technical jargon. 
              Provide clear and simple explanations, encouraging curiosity and learning about basketball. 
              Always maintain a polite and respectful tone, ensuring users feel comfortable asking basketball-related questions.
              For more information about basketball rules, visit: https://www.ducksters.com/sports/basketballrules.php

              User's message: ${messages[messages.length - 1].content}`,
            },
          ],
        },
      ],
    });

    // Save the user message
    await db.chatMessage.create({
      data: {
        chatId: activeChatId,
        userId,
        sender: userId,
        message: messages[messages.length - 1].content,
      },
    });

    const stream = GoogleGenerativeAIStream(geminiStream, {
      async onCompletion(completion) {
        // Format the response using the formatResponse function
        const formattedResponse = formatResponse(completion);

        // Save the assistant's formatted message
        await db.chatMessage.create({
          data: {
            chatId: activeChatId,
            userId,
            sender: "Assistant",
            message: formattedResponse,
          },
        });

        // Update the chat title if it's the first message
        const messageCount = await db.chatMessage.count({
          where: { chatId: activeChatId },
        });

        if (messageCount <= 2) {
          await db.chat.update({
            where: { id: activeChatId },
            data: {
              title: messages[messages.length - 1].content.slice(0, 50) + "...",
            },
          });
        }
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error in POST /api/ai:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    const messages = await db.chatMessage.findMany({
      where: { chatId },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error in GET /api/ai:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
