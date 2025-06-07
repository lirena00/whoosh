import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: `${process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL ?? "http://localhost:3000"}`,
});

export const { signIn, signOut, useSession } = authClient;
