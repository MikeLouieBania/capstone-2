"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Send, Trash2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  sender: string;
  text: string;
}

const fetchGeminiResponse = async (
  message: string,
  userId: string
): Promise<string> => {
  try {
    const response = await axios.post("/api/ai", { body: message, userId });
    return response.data.output;
  } catch (error) {
    console.error("Error fetching Gemini response:", error);
    return "Sorry, there was an error communicating with the assistant.";
  }
};

const AssistantPage: React.FC = () => {
  const { user } = useUser();
  const username = user ? user.firstName || user.username || "User" : "User";
  const userId = user ? user.id : "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (userId) {
        try {
          const response = await axios.get(`/api/ai?userId=${userId}`);
          if (Array.isArray(response.data)) {
            const chatMessages = response.data.map((msg: any) => ({
              sender: msg.sender !== "Assistant" ? username : "Assistant",
              text: msg.message,
            }));
            setMessages(chatMessages);
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      }
    };
    fetchChatHistory();
  }, [userId, username]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim()) {
      const userMessage: Message = { sender: username, text: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsTyping(true);

      const assistantReply = await fetchGeminiResponse(input, userId);
      setMessages((prev) => [
        ...prev,
        { sender: "Assistant", text: assistantReply },
      ]);
      setIsTyping(false);
    }
  };

  const deleteChatHistory = async () => {
    if (!userId) return;

    try {
      await axios.delete("/api/ai", { data: { userId } });
      setMessages([]);
    } catch (error) {
      console.error("Error deleting chat history:", error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Chat Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "Assistant" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.sender === "Assistant" ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={message.sender === "Assistant" ? "/ai-avatar.png" : user?.imageUrl}
                      alt={message.sender}
                    />
                    <AvatarFallback>
                      {message.sender === "Assistant" ? "AI" : username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg p-3 ${
                      message.sender === "Assistant"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex w-full space-x-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={isTyping}>
            <Send className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={deleteChatHistory}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AssistantPage;