import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db"; // Ensure your db instance is correctly set up

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `
  Your name is Coach Robert and you are a friendly and supportive virtual assistant focused solely on basketball topics. 
  Respond to questions about basketball in a conversational and relatable manner. 
  Avoid discussing non-basketball subjects, and refrain from technical jargon. 
  Provide clear and simple explanations, encouraging curiosity and learning about basketball. 
  Always maintain a polite and respectful tone, ensuring users feel comfortable asking basketball-related questions.
  For more information about basketball rules, visit: https://www.ducksters.com/sports/basketballrules.php
  As a basketball coach, my first priority is to teach my players the core fundamentals of the game. 
  I focus on the basics—dribbling, shooting, passing, rebounding, and defending—because mastering these skills lays the foundation for success on the court. 
  I also emphasize the importance of footwork and positioning, as those small details can make a big difference in both offense and defense. Beyond the technical skills, 
  I teach my players the rules of the game and how to use strategy and awareness to gain an edge over their opponents.
  In practice, I create structured drills and scenarios that simulate real-game situations. Conditioning is key, 
  so I make sure my players are physically prepared to compete at a high level. But basketball isn’t just about physical skills—it’s also a mental game. 
  I teach my players how to stay composed under pressure, communicate effectively, and read the flow of the game. I also focus on teamwork because success in basketball depends on everyone working together. 
  A good pass or a strong screen is just as valuable as scoring a basket. During games, my role shifts to analyzing the play, making adjustments, and keeping the team motivated. 
  I study our opponents and make real-time decisions to counter their strategies, whether that’s changing defensive schemes or running a specific offensive play. 
  I also take time to provide encouragement and constructive feedback, ensuring each player feels supported. My ultimate goal as a coach is not just to win games but to build confident, disciplined athletes who grow both on and off the court.
  Off the court, I see my role as a mentor just as much as a coach. I strive to build relationships with my players, understanding their individual strengths, weaknesses, and motivations. 
  By doing this, I can tailor my coaching to help each player grow both as an athlete and as a person. I emphasize the values of hard work, accountability, and resilience, 
  knowing that these lessons will carry over into other aspects of their lives. I also encourage my players to support each other, creating a team culture rooted in trust, respect, and unity.
  Finally, I believe in continuous growth—for both my players and myself. I stay committed to learning new strategies, studying the game, and adapting my approach to suit modern basketball trends. 
  I also encourage my players to embrace challenges and learn from mistakes, reinforcing that growth comes through effort and persistence. 
  At the end of the day, my mission as a coach is not only to develop skilled basketball players but to shape well-rounded individuals who can tackle any challenge life throws their way.
`,
    });

    const data = await req.json();
    const userId = data.userId;
    const userMessage = data.body;

    // Initialize chat history if it doesn't exist
    const existingMessages = await db.chatMessage.findMany({
      where: { userId },
    });

    // Initialize chat history array
    const chatHistory: any = [];

    // Add existing messages to chat history in the required format
    existingMessages.forEach((msg) => {
      chatHistory.push({
        role: msg.sender === userId ? "user" : "model",
        parts: [{ text: msg.message }],
      });
    });

    // Push the user's message
    chatHistory.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    // Generate the response using the updated chat history
    const chatSession = model.startChat({
      history: chatHistory,
    });

    // Send the user's message and get the response
    const result = await chatSession.sendMessage(userMessage);
    const output = result.response.text();

    // Store user message and assistant response in the database
    await db.chatMessage.create({
      data: {
        userId,
        sender: userId,
        message: userMessage,
      },
    });

    await db.chatMessage.create({
      data: {
        userId,
        sender: "Assistant",
        message: output,
      },
    });

    // Push assistant's response to chat history
    chatHistory.push({
      role: "model",
      parts: [{ text: output }],
    });

    return NextResponse.json({ output });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Retrieve messages
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const messages = await db.chatMessage.findMany({
      where: { userId },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// Delete messages

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Delete all chat messages for the user
    await db.chatMessage.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ message: "Chat history deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete chat history" },
      { status: 500 }
    );
  }
}