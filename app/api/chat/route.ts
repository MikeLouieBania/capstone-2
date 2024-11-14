import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId } = await req.json();

    const geminiMessages = messages.map((message: Message) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }],
    }));

    const result = await model.generateContentStream({
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const stream = GoogleGenerativeAIStream(result);

    // Save the conversation
    const newConversationId = conversationId || nanoid();
    await kv.set(`conversation:${newConversationId}`, JSON.stringify(messages));

    return new StreamingTextResponse(stream, {
      headers: { 'X-Conversation-Id': newConversationId },
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json({ error: 'An error occurred during the chat process' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const conversations = await kv.keys('conversation:*');
    const conversationData = await Promise.all(
      conversations.map(async (key) => {
        const messages = await kv.get(key);
        return {
          id: key.split(':')[1],
          messages: JSON.parse(messages as string),
        };
      })
    );
    console.log('Conversation data:', JSON.stringify(conversationData, null, 2));
    return NextResponse.json(conversationData);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'An error occurred while fetching conversations' }, { status: 500 });
  }
}