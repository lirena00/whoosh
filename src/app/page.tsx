import Link from "next/link";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Voice } from "@/components/Voice";

export default function HomePage() {
  return (
    <main className="bg-background dark text-text flex min-h-screen flex-col items-center justify-center">
      <Voice />
    </main>
  );
}
