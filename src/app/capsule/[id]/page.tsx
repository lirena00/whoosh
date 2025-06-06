"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { SignIn } from "@/components/SignIn";
import { VoiceMessage } from "@/components/VoiceMessage";
import { Toolbar } from "@/components/Toolbar";
import { FollowupQuestions } from "@/components/FollowupQuestions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  getCapsuleData,
  addVoiceInteraction,
  updateCapsuleTitle,
  updateFollowupPool,
} from "@/server/actions";
import { useSession } from "@/lib/auth-client";

type VoiceData = {
  audioUrl: string;
  transcription: string;
  followups: string[];
  title: string;
};

type VoiceMessage = {
  id: string;
  audioUrl: string;
  transcription: string;
  timestamp: Date;
};

type CapsuleData = {
  id: number;
  title: string | null;
  followupPool: string[];
  voiceInteractions: Array<{
    id: number;
    audioUrl: string | null;
    transcription: string | null;
    createdAt: Date;
  }>;
  followupReplies: Array<{
    id: number;
    followupQuestion: string;
    audioUrl: string | null;
    transcription: string | null;
    createdAt: Date;
  }>;
};

export default function CapsulePage() {
  const { data: session, isPending } = useSession();
  const params = useParams();
  const capsuleId = parseInt(params.id as string);

  const [capsuleData, setCapsuleData] = useState<CapsuleData | null>(null);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [allFollowups, setAllFollowups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const loadCapsuleData = async () => {
      if (!session?.user || isNaN(capsuleId)) return;

      setIsLoading(true);
      try {
        const result = await getCapsuleData(capsuleId);
        if (result.success && result.data) {
          const data = result.data;
          setCapsuleData({
            ...data,
            followupPool: Array.isArray(data.followupPool)
              ? data.followupPool.filter((item) => typeof item === "string")
              : [],
          });
          setCurrentTitle(data.title ?? "");
          setAllFollowups(
            Array.isArray(data.followupPool)
              ? data.followupPool.filter((item) => typeof item === "string")
              : [],
          );

          // Convert voice interactions to messages
          const voiceMessages: VoiceMessage[] = data.voiceInteractions.map(
            (interaction) => ({
              id: interaction.id.toString(),
              audioUrl: interaction.audioUrl ?? "",
              transcription: interaction.transcription ?? "",
              timestamp: new Date(interaction.createdAt),
            }),
          );

          setMessages(voiceMessages);
        } else {
          setError(result.error ?? "Failed to load capsule");
        }
      } catch (err) {
        setError("Failed to load capsule data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCapsuleData();
  }, [session?.user, capsuleId]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, allFollowups]);

  const handleVoiceDataUpdate = async (data: VoiceData) => {
    if (!session?.user) return;
    try {
      const result = await addVoiceInteraction(
        capsuleId,
        data.audioUrl,
        data.transcription,
      );
      if (!result.success) {
        console.error("Failed to save voice interaction:", result.error);
        return;
      }

      const newMessage: VoiceMessage = {
        id: result.data!.id.toString(),
        audioUrl: data.audioUrl,
        transcription: data.transcription,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);

      if (data.title && data.title !== currentTitle) {
        setCurrentTitle(data.title);
        await updateCapsuleTitle(capsuleId, data.title);
      }

      if (data.followups.length > 0) {
        const newFollowups = data.followups.filter(
          (f) => !allFollowups.includes(f),
        );
        if (newFollowups.length > 0) {
          setAllFollowups((prev) => [...prev, ...newFollowups]);
          await updateFollowupPool(capsuleId, newFollowups);
        }
      }
    } catch (error) {
      console.error("Error updating voice data:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading capsule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background/95 sticky top-0 z-30 border-b backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
                <Sparkles className="text-primary-foreground h-3 w-3" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-foreground truncate text-lg font-semibold">
                  {currentTitle || "New Capsule"}
                </h1>
                {messages.length > 0 && (
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    <MessageSquare className="h-3 w-3" />
                    {messages.length} message{messages.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <SignIn />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-4 pb-32">
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

        {/* Messages Layout - Responsive Grid */}
        {messages.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
            {/* Messages Column - Takes 2/3 on large screens */}
            <div className="space-y-4 lg:col-span-2">
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
              <div ref={messagesEndRef} />
            </div>

            {/* Followup Questions Sidebar - Takes 1/3 on large screens */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <AnimatePresence>
                  {allFollowups.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <FollowupQuestions followups={allFollowups} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Toolbar */}
      <div className="fixed right-0 bottom-0 left-0 p-4">
        <div className="mx-auto max-w-7xl">
          <Toolbar onDataUpdate={handleVoiceDataUpdate} />
        </div>
      </div>
    </div>
  );
}
