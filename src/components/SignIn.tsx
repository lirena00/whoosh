"use client";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SignIn() {
  const { data: session, isPending } = useSession();

  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "discord",
    });
  };
  const handleSignOut = async () => {
    await authClient.signOut();
  };

  if (isPending) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={session.user.image ?? ""}
            alt={session.user.name ?? ""}
          />
          <AvatarFallback>
            {session.user.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{session.user.name}</span>
        <Button
          onClick={handleSignOut}
          className="text-muted-foreground flex items-center gap-2"
          variant="outline"
          size="sm"
        >
          Sign Out
        </Button>
      </div>
    );
  }
  return (
    <Button
      onClick={handleSignIn}
      className="text-muted-foreground flex items-center gap-2"
      variant="outline"
    >
      <span>Sign in with Discord</span>
    </Button>
  );
}
