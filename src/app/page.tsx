"use client";

import { useState } from "react";
import { SignIn } from "@/components/SignIn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Sparkles, Plus, Mic, Zap, Clock } from "lucide-react";
import { motion } from "motion/react";
import { createCapsule } from "@/server/actions";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function HomePage() {
  const { data: session } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateCapsule = async () => {
    if (!session?.user) return;

    setIsCreating(true);
    try {
      const result = await createCapsule();
      if (result.success) {
        router.push(`/capsule/${result.capsuleId}`);
      } else {
        console.error("Failed to create capsule:", result.error);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error("Error creating capsule:", error);
    } finally {
      setIsCreating(false);
    }
  };

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
                  Whoosh
                </h1>
                <p className="text-muted-foreground text-xs">
                  AI-powered voice conversations
                </p>
              </div>
            </div>
            <SignIn />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-4">
        {/* Hero Section */}
        <section className="py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="from-primary/20 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br to-purple-500/20">
              <MessageSquare className="text-primary h-10 w-10" />
            </div>

            <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Transform Ideas Into{" "}
              <span className="from-primary bg-gradient-to-r to-purple-600 bg-clip-text text-transparent">
                Conversations
              </span>
            </h1>

            <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
              Capture your thoughts with voice, get intelligent follow-up
              questions, and organize your ideas in smart capsules that evolve
              with your conversations.
            </p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Button
                onClick={handleCreateCapsule}
                size="lg"
                disabled={isCreating ?? !session?.user}
                className="gap-2 px-8 py-6 text-lg font-semibold shadow-lg transition-shadow hover:shadow-xl"
              >
                {isCreating ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating Capsule...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Start New Capsule
                  </>
                )}
              </Button>
            </motion.div>

            {!session?.user && (
              <p className="text-muted-foreground mt-4 text-sm">
                Please sign in to create your first capsule
              </p>
            )}
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-foreground mb-12 text-center text-3xl font-bold">
              How It Works
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Feature 1 */}
              <Card className="group transition-shadow hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                    <Mic className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle className="text-xl">Record Your Voice</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Simply click record and speak your thoughts. Our AI
                    transcribes and understands your ideas in real-time.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="group transition-shadow hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 transition-colors group-hover:bg-purple-500/20">
                    <Zap className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle className="text-xl">Get Smart Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    AI generates intelligent follow-up questions to help you
                    explore and develop your ideas further.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="group transition-shadow hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 transition-colors group-hover:bg-green-500/20">
                    <Clock className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="text-xl">Build Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Your conversations are saved in capsules that grow and
                    evolve as you add more thoughts and insights.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </section>

        {/* Stats/Social Proof Section */}
        <section className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-muted/50 rounded-2xl p-8 text-center"
          >
            <h3 className="text-foreground mb-6 text-2xl font-semibold">
              Ready to Transform Your Ideas?
            </h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Join thousands of creators, entrepreneurs, and thinkers who use
              Whoosh to capture and develop their best ideas.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2">
                🎯 Smart AI Questions
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                🔄 Continuous Learning
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                💡 Idea Evolution
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                📱 Easy Recording
              </Badge>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
