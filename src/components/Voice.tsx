"use client";

import { Mic, Pause, Play, Square, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

export function Voice() {
  const [status, setStatus] = useState<"idle" | "recording" | "paused">("idle");
  const [postStatus, setPoststatus] = useState<
    "uploading" | "transcribing" | "doing magic" | "error" | ""
  >("");
  const [title, setTitle] = useState<string>("");
  const [followups, setFollowups] = useState<string[]>([]);

  const [elapsed, setElapsed] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

        setPoststatus("uploading");
        const uploadResponse = await fetch("/api/audio/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          console.error("Upload failed:", await uploadResponse.text());
          return;
        }

        const uploadResult = (await uploadResponse.json()) as UploadResult;
        console.log("Upload successful:", uploadResult);

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
        console.log("Transcription:", transcribeResult.text);
        setPoststatus("doing magic");

        type FollowupResult = {
          title: string;
          refined_transcription: string;
          followup: string[];
        };
        const stuff = {
          idea: transcribeResult.text,
          ...(followups.length > 0 && { previous_questions: followups }),
          ...(title !== "" && { title }),
        };
        const followupResponse = await fetch(
          `/api/audio/followup?stuff=${encodeURIComponent(JSON.stringify(stuff))}`,
        );
        if (!followupResponse.ok) {
          console.error("followup failed:", await followupResponse.text());
          return;
        }

        const followupResult =
          (await followupResponse.json()) as FollowupResult;
        console.log(followupResult);
        setPoststatus("");
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
    <motion.div className="mx-auto w-full max-w-sm">
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2"
          >
            <Button size="icon" className="h-14 w-14" onClick={primary.action}>
              <motion.div
                animate={
                  status === "recording"
                    ? {
                        scale: [1, 1.1, 1],
                        transition: { repeat: Infinity, duration: 1.5 },
                      }
                    : { scale: 1 }
                }
              >
                {primary.icon}
              </motion.div>
            </Button>
            <span className="text-muted-foreground text-xs">
              {primary.label}
            </span>
          </motion.div>
          {postStatus}
          <AnimatePresence>
            {status !== "idle" && (
              <motion.div
                key="secondary-controls"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-3"
              >
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={stopRecording}
                >
                  <Square className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="outline" onClick={clearRecording}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {status !== "idle" && (
              <motion.div
                key="timer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Badge variant={"outline"} className="font-mono text-sm">
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
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
