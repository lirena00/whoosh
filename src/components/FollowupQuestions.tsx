"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

type FollowupQuestionsProps = {
  followups: string[];
};

export function FollowupQuestions({ followups }: FollowupQuestionsProps) {
  // Calculate the starting index to show the latest group of 3
  const getLatestPageIndex = (totalQuestions: number) => {
    if (totalQuestions <= 3) return 0;
    return Math.floor((totalQuestions - 1) / 3) * 3;
  };

  const [currentIndex, setCurrentIndex] = useState(
    getLatestPageIndex(followups.length),
  );

  // Update currentIndex when followups change to always show latest
  useEffect(() => {
    const latestIndex = getLatestPageIndex(followups.length);
    setCurrentIndex(latestIndex);
  }, [followups.length]);

  if (!followups.length) return null;

  const visibleQuestions = followups.slice(currentIndex, currentIndex + 3);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex + 3 < followups.length;

  const goBack = () => {
    if (canGoBack) setCurrentIndex(currentIndex - 3);
  };

  const goForward = () => {
    if (canGoForward) setCurrentIndex(currentIndex + 3);
  };

  const startRange = currentIndex + 1;
  const endRange = Math.min(currentIndex + 3, followups.length);

  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={goBack}
            disabled={!canGoBack}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 text-center">
            <Badge variant={"secondary"} className="text-xs">
              {startRange}-{endRange} of {followups.length} Follow ups
            </Badge>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={goForward}
            disabled={!canGoForward}
            className="shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="wait">
            {visibleQuestions.map((question, index) => (
              <motion.div
                key={currentIndex + index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="bg-muted/50 hover:bg-muted rounded-lg border p-3 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-foreground group-hover:text-primary text-sm font-medium transition-colors">
                      {question}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
