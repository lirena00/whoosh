"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";

type VoiceMessageProps = {
  audioUrl: string;
  transcription: string;
  timestamp: Date;
  isLatest?: boolean;
};

export function VoiceMessage({
  audioUrl,
  transcription,
  timestamp,
  isLatest = false,
}: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
    }
  };

  const handleTimeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`w-full ${isLatest ? "mb-4" : "mb-3"}`}
    >
      <Card
        className={`${isLatest ? "ring-primary/20 shadow-lg ring-2" : "shadow-sm"} transition-all duration-200`}
      >
        <CardContent className="p-4">
          <audio ref={audioRef} src={audioUrl} preload="metadata" />

          {/* Header with timestamp */}
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {formatTimestamp(timestamp)}
            </Badge>
            {isLatest && (
              <Badge variant="default" className="text-xs">
                Latest
              </Badge>
            )}
          </div>

          {/* Audio Controls */}
          <div className="mb-4 flex items-center gap-3">
            <Button
              size="sm"
              variant={isPlaying ? "default" : "outline"}
              onClick={togglePlayPause}
              disabled={!audioUrl}
              className="shrink-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <div className="min-w-0 flex-1">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleTimeChange}
                className="mb-1"
                disabled={!duration}
              />
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowVolumeControl(!showVolumeControl)}
                className="shrink-0"
              >
                <Volume2 className="h-4 w-4" />
              </Button>

              {showVolumeControl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-background absolute top-full right-0 z-10 mt-1 rounded-md border p-2 shadow-lg"
                >
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                    orientation="horizontal"
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* Transcription */}
          <div className="border-primary/30 bg-muted/50 rounded-lg border-l-4 p-3">
            <p className="text-foreground/90 text-sm leading-relaxed">
              {transcription}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
