"use client";

import { Mic, Download, Sparkles, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Voice } from "@/components/Voice";

type ToolbarMode = "voice" | "text" | "summary" | "export";

// Match the VoiceData type from homepage
type VoiceData = {
  audioUrl: string;
  transcription: string;
  followups: string[];
  title: string;
};

interface ToolbarProps {
  onDataUpdate?: (data: VoiceData) => void; // Changed from boolean to VoiceData
}

// Placeholder components
function TextInput({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Text input feature coming soon...</p>
      <Button onClick={onComplete} className="w-full">
        Close
      </Button>
    </div>
  );
}

function SummaryGenerator({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Summary generation coming soon...</p>
      <Button onClick={onComplete} className="w-full">
        Close
      </Button>
    </div>
  );
}

function ExportOptions({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Export options coming soon...</p>
      <Button onClick={onComplete} className="w-full">
        Close
      </Button>
    </div>
  );
}

export function Toolbar({ onDataUpdate }: ToolbarProps) {
  const [open, setOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<ToolbarMode | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleModeSelect = (mode: ToolbarMode) => {
    setActiveMode(mode);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setActiveMode(null);
  };

  // This function will receive data from Voice component and pass it to homepage
  const handleVoiceDataUpdate = (data: VoiceData) => {
    onDataUpdate?.(data); // Pass data to homepage
    // Close dialog after successful recording
    setTimeout(() => {
      handleClose();
    }, 1000);
  };

  const toolbarItems = [
    {
      mode: "voice" as const,
      icon: Mic,
      title: "Voice Recording",
      description: "Record your voice message",
    },
    {
      mode: "text" as const,
      icon: Pencil,
      title: "Text Input",
      description: "Type your message",
    },
    {
      mode: "summary" as const,
      icon: Sparkles,
      title: "Generate Summary",
      description: "AI-powered conversation summary",
    },
    {
      mode: "export" as const,
      icon: Download,
      title: "Export Conversation",
      description: "Download your conversation",
    },
  ];

  const renderContent = () => {
    switch (activeMode) {
      case "voice":
        return (
          <Voice
            onDataUpdate={handleVoiceDataUpdate} // Pass the correct handler
            onComplete={handleClose}
          />
        );
      case "text":
        return <TextInput onComplete={handleClose} />;
      case "summary":
        return <SummaryGenerator onComplete={handleClose} />;
      case "export":
        return <ExportOptions onComplete={handleClose} />;
      default:
        return null;
    }
  };

  // Rest of the component remains the same...
  if (isDesktop) {
    return (
      <motion.div
        key="toolbar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex items-center justify-center"
      >
        <Card className="bg-card/95 border-2 p-1.5 shadow-lg backdrop-blur-sm">
          <CardContent className="p-1">
            <div className="divide-border flex items-center divide-x">
              {toolbarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.mode} className="px-1.5">
                    <Dialog
                      open={open && activeMode === item.mode}
                      onOpenChange={(isOpen) => {
                        if (!isOpen) handleClose();
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="hover:bg-primary/10 hover:text-primary h-10 w-10 transition-all duration-200"
                          title={item.title}
                          onClick={() => handleModeSelect(item.mode)}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Icon className="h-5 w-5" />
                            {item.title}
                          </DialogTitle>
                          <DialogDescription>
                            {item.description}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">{renderContent()}</div>
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="toolbar"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center justify-center"
    >
      <Card className="bg-card/95 border-2 shadow-lg backdrop-blur-sm">
        <CardContent className="p-1">
          <div className="divide-border flex items-center divide-x">
            {toolbarItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.mode} className="px-1.5">
                  <Drawer
                    open={open && activeMode === item.mode}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) handleClose();
                    }}
                  >
                    <DrawerTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="hover:bg-primary/10 hover:text-primary h-10 w-10 transition-all duration-200"
                        title={item.title}
                        onClick={() => handleModeSelect(item.mode)}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader className="text-left">
                        <DrawerTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          {item.title}
                        </DrawerTitle>
                        <DrawerDescription>
                          {item.description}
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 pb-4">{renderContent()}</div>
                      <DrawerFooter className="pt-2">
                        <DrawerClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
