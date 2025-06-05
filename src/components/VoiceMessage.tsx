"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Clock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

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

    const newTime = value[0] ?? 0;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0] ?? 0;
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

          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
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

          {/* Audio Player */}
          <div className="bg-muted/50 mb-4 rounded-lg border p-3">
            <div className="flex items-center gap-3">
              {/* Play/Pause Button */}
              <Button
                size="icon"
                variant={isPlaying ? "default" : "outline"}
                onClick={togglePlayPause}
                disabled={!audioUrl}
                className="h-10 w-10 shrink-0"
              >
                <motion.div
                  animate={isPlaying ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{
                    duration: 1.2,
                    repeat: isPlaying ? Infinity : 0,
                  }}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </motion.div>
              </Button>

              {/* Progress and Time */}
              <div className="min-w-0 flex-1">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleTimeChange}
                  className="mb-2"
                  disabled={!duration}
                />
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume Control */}
              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowVolumeControl(!showVolumeControl)}
                  className="h-8 w-8 shrink-0"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>

                <AnimatePresence>
                  {showVolumeControl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="bg-background absolute top-full right-0 z-10 mt-1 rounded-md border p-3 shadow-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 className="text-muted-foreground h-3 w-3" />
                        <Slider
                          value={[volume]}
                          max={1}
                          step={0.1}
                          onValueChange={handleVolumeChange}
                          className="w-20"
                          orientation="horizontal"
                        />
                        <span className="text-muted-foreground w-8 text-xs">
                          {Math.round(volume * 100)}%
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
