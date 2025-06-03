import Link from "next/link";
import { Voice } from "@/components/Voice";
import { SignIn } from "@/components/SignIn";

export default function HomePage() {
  return (
    <main className="bg-background dark text-text flex min-h-screen flex-col items-center justify-center">
      <Voice />
      <SignIn />
    </main>
  );
}
