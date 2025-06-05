"use client";

import {
  Mic,
  Pause,
  Play,
  Square,
  Trash2,
  Sparkles,
  Download,
  MoreHorizontal,
} from "lucide-react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { Separator } from "@/components/ui/separator";

type VoiceData = {
  audioUrl: string;
  transcription: string;
  followups: string[];
  title: string;
};

type VoiceProps = {
  onDataUpdate: (data: VoiceData) => void;
  onComplete?: () => void;
};

export function Voice({ onDataUpdate, onComplete }: VoiceProps) {
  const [status, setStatus] = useState<"idle" | "recording" | "paused">("idle");
  const [postStatus, setPoststatus] = useState<
    "uploading" | "transcribing" | "doing magic" | "error" | ""
  >("");

  const [elapsed, setElapsed] = useState(0);
  const rerenderTrigger = useState(0)[1]; // For manual rerendering

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const titleRef = useRef<string>("");
  const followupsRef = useRef<string[]>([]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      setPoststatus("uploading");
      stopTimer();
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      audioChunksRef.current = [];

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      try {
        type UploadResult = {
          success: boolean;
          url: string;
          size: number;
        };

        const uploadResponse = await fetch("/api/audio/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          console.error("Upload failed:", await uploadResponse.text());
          return;
        }

        const uploadResult = (await uploadResponse.json()) as UploadResult;
        console.log(uploadResult);
        const audioUrl = uploadResult.url;

        setPoststatus("transcribing");

        type TranscribeResult = { text: string };
        const transcribeResponse = await fetch(
          `/api/audio/transcribe?audiourl=${encodeURIComponent(audioUrl)}`,
        );

        if (!transcribeResponse.ok) {
          console.error("Transcribe failed:", await transcribeResponse.text());
          return;
        }

        const transcribeResult =
          (await transcribeResponse.json()) as TranscribeResult;
        console.log(transcribeResult);
        setPoststatus("doing magic");

        type FollowupResult = {
          title: string;
          refined_transcription: string;
          followup: string[];
        };

        const stuff = {
          idea: transcribeResult.text,
          ...(followupsRef.current.length > 0 && {
            previous_questions: followupsRef.current,
          }),
          ...(titleRef.current !== "" && { title: titleRef.current }),
        };

        const followupResponse = await fetch(
          `/api/audio/followup?stuff=${encodeURIComponent(JSON.stringify(stuff))}`,
        );

        if (!followupResponse.ok) {
          console.error("followup failed:", await followupResponse.text());
          return;
        }
        console.log(followupsRef.current);

        const followupResult =
          (await followupResponse.json()) as FollowupResult;
        console.log(followupResult);
        if (titleRef.current === "") {
          titleRef.current = followupResult.title;
        }

        followupResult.followup.forEach((f) => followupsRef.current.push(f));
        onDataUpdate({
          audioUrl,
          transcription:
            followupResult.refined_transcription || transcribeResult.text,
          followups: [...followupsRef.current],
          title: titleRef.current,
        });
        // rerenderTrigger((n) => n + 1); // Force UI update if needed
        setPoststatus("");
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      } catch (err) {
        console.error("Error:", err);
        setPoststatus("error");
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setStatus("recording");
    setElapsed(0);
    startTimer();
  };

  const pauseRecording = () => {
    mediaRecorderRef.current?.pause();
    setStatus("paused");
    stopTimer();
  };

  const resumeRecording = () => {
    mediaRecorderRef.current?.resume();
    setStatus("recording");
    startTimer();
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setStatus("idle");
    stopTimer();
  };

  const clearRecording = () => {
    stopTimer();
    setElapsed(0);
    audioChunksRef.current = [];
    setStatus("idle");
  };

  const getPrimaryAction = () => {
    switch (status) {
      case "idle":
        return {
          icon: <Mic className="h-6 w-6" />,
          label: "Start Recording",
          action: startRecording,
        };
      case "recording":
        return {
          icon: <Pause className="h-6 w-6" />,
          label: "Pause",
          action: pauseRecording,
        };
      case "paused":
        return {
          icon: <Play className="h-6 w-6" />,
          label: "Resume",
          action: resumeRecording,
        };
    }
  };

  const primary = getPrimaryAction();

  return (
    <div className="space-y-4">
      {/* Main row with primary action and controls */}
      <div className="flex items-center gap-3">
        {/* Primary Action Button */}
        <Button
          size="icon"
          className="h-12 w-12 shrink-0"
          onClick={primary.action}
        >
          <motion.div
            animate={
              status === "recording"
                ? {
                    scale: [1, 1.1, 1],
                    transition: { repeat: Infinity, duration: 1.2 },
                  }
                : { scale: 1 }
            }
          >
            {primary.icon}
          </motion.div>
        </Button>

        {/* Status and Timer */}
        <div className="min-w-0 flex-1">
          {postStatus ? (
            <Badge variant="secondary" className="animate-pulse text-xs">
              {postStatus}
            </Badge>
          ) : status !== "idle" ? (
            <Badge variant="outline" className="font-mono text-xs">
              <motion.span
                animate={{
                  opacity: status === "recording" ? [1, 0.4, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: status === "recording" ? Infinity : 0,
                }}
              >
                🔴
              </motion.span>{" "}
              {formatTime(elapsed)}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">
              Click to start recording
            </span>
          )}
        </div>

        {/* Secondary Controls */}
        <AnimatePresence>
          {status !== "idle" && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex gap-2"
            >
              <Button
                size="icon"
                variant="destructive"
                onClick={stopRecording}
                className="h-8 w-8"
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={clearRecording}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
