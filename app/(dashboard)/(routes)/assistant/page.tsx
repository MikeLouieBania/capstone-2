"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Send, Trash2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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

  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState(true);
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
            if (chatMessages.length > 0) {
              setShowWelcome(false);
            }
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
      setShowWelcome(false);
      router.refresh(); 

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
      setShowWelcome(true);
      router.refresh(); 
    } catch (error) {
      console.error("Error deleting chat history:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      <div className="flex-grow overflow-hidden relative">
        {showWelcome && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl font-bold text-sky-700">
              Hi, I am Robert your Virtual Coaching Assistant
            </div>
          </div>
        )}
        <ScrollArea className="h-full px-4">
          <div className="max-w-3xl mx-auto space-y-8 py-8">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.sender === "Assistant" ? "justify-start" : "justify-end"
                )}
              >
                <div
                  className={cn(
                    "flex items-start space-x-3 max-w-[80%]",
                    message.sender === "Assistant" ? "flex-row" : "flex-row-reverse space-x-reverse"
                  )}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage
                      src={message.sender === "Assistant" ? "/ai-avatar.png" : user?.imageUrl}
                      alt={message.sender}
                    />
                    <AvatarFallback>
                      {message.sender === "Assistant" ? "AI" : username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2",
                      message.sender === "Assistant" 
                        ? "bg-blue-100 text-blue-900" 
                        : "bg-green-100 text-green-900"
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-blue-100 rounded-2xl px-4 py-2">
                  <div className="w-8 h-4 flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
        </ScrollArea>
      </div>
      <div className="border-t border-gray-200 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="max-w-3xl mx-auto flex space-x-4"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
            className="flex-grow p-4 text-sm bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500 rounded-full placeholder:pl-8"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isTyping}
            className="bg-blue-500 text-white hover:bg-blue-600 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={deleteChatHistory}
            className="bg-red-500 text-white hover:bg-red-600 rounded-full"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AssistantPage;

