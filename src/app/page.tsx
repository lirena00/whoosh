"use client";

import { useState, useEffect, useRef } from "react";
import { SignIn } from "@/components/SignIn";
import { VoiceMessage } from "@/components/VoiceMessage";
import { Toolbar } from "@/components/Toolbar";
import { FollowupQuestions } from "@/components/FollowupQuestions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type VoiceData = {
  audioUrl: string;
  transcription: string;
  followups: string[];
  title: string;
};

type VoiceMessage = VoiceData & {
  id: string;
  timestamp: Date;
};

export default function HomePage() {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [allFollowups, setAllFollowups] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, allFollowups]);

  const handleVoiceDataUpdate = (data: VoiceData) => {
    const newMessage: VoiceMessage = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setCurrentTitle(data.title);
    setAllFollowups(data.followups);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur-sm">
        <div className="mx-auto max-w-4xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                <Sparkles className="text-primary-foreground h-4 w-4" />
              </div>
              <div>
                <h1 className="text-foreground text-xl font-bold">
                  {currentTitle || "Voice Assistant"}
                </h1>
                {messages.length > 0 && (
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <MessageSquare className="h-3 w-3" />
                    {messages.length} conversation
                    {messages.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <SignIn />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl p-4 pb-24">
        {/* Welcome State */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center"
          >
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <MessageSquare className="text-primary h-8 w-8" />
            </div>
            <h2 className="text-foreground mb-2 text-2xl font-semibold">
              Start a Conversation
            </h2>
            <p className="text-muted-foreground mx-auto mb-8 max-w-md">
              Click the microphone button below to record your voice message and
              get AI-powered follow-up questions.
            </p>
            <Badge variant="outline" className="animate-bounce">
              👇 Try recording your first message
            </Badge>
          </motion.div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <VoiceMessage
                key={message.id}
                audioUrl={message.audioUrl}
                transcription={message.transcription}
                timestamp={message.timestamp}
                isLatest={index === messages.length - 1}
              />
            ))}
          </AnimatePresence>

          {/* Follow-up Questions - Show after latest message */}
          <AnimatePresence>
            {allFollowups.length > 0 && messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6"
              >
                <FollowupQuestions followups={allFollowups} />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="fixed right-0 bottom-0 left-0 p-4">
        <div className="mx-auto max-w-4xl">
          <Toolbar onDataUpdate={handleVoiceDataUpdate} />
        </div>
      </div>
    </div>
  );
}
