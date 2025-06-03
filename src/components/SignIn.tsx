"use client";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignIn() {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "discord",
    });
  };

  return (
    <Button
      onClick={handleSignIn}
      className="flex items-center gap-2"
      variant="outline"
    >
      <span>Sign in with Discord</span>
    </Button>
  );
}
