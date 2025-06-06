"use server";

import { users } from "./db/schema";
import { and, eq, sql, asc, desc } from "drizzle-orm";
import { z } from "zod";
import * as crypto from "crypto";
import { db } from "@/server/db";
import {
  capsules,
  voiceInteractions,
  followupReplies,
} from "@/server/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createCapsule() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;
  try {
    const [newCapsule] = await db
      .insert(capsules)
      .values({
        createdById: userId,
        title: "New Capsule",
        followupPool: [],
      })
      .returning();

    return { success: true, capsuleId: newCapsule?.id };
  } catch (error) {
    console.error("Failed to create capsule:", error);
    return { success: false, error: "Failed to create capsule" };
  }
}

export async function getCapsuleData(capsuleId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;
  try {
    const capsule = await db.query.capsules.findFirst({
      where: eq(capsules.id, capsuleId),
      with: {
        voiceInteractions: {
          orderBy: (voiceInteractions, { asc }) => [
            asc(voiceInteractions.createdAt),
          ],
        },
        followupReplies: {
          orderBy: (followupReplies, { asc }) => [
            asc(followupReplies.createdAt),
          ],
        },
      },
    });

    if (!capsule || capsule.createdById !== userId) {
      return { success: false, error: "Capsule not found or unauthorized" };
    }

    return { success: true, data: capsule };
  } catch (error) {
    console.error("Failed to get capsule:", error);
    return { success: false, error: "Failed to get capsule" };
  }
}

export async function addVoiceInteraction(
  capsuleId: number,
  audioUrl: string,
  transcription: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;
  try {
    // Verify capsule ownership
    const capsule = await db.query.capsules.findFirst({
      where: eq(capsules.id, capsuleId),
    });

    if (!capsule || capsule.createdById !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const [newInteraction] = await db
      .insert(voiceInteractions)
      .values({
        capsuleId,
        audioUrl,
        transcription,
      })
      .returning();

    revalidatePath(`/capsule/${capsuleId}`);
    return { success: true, data: newInteraction };
  } catch (error) {
    console.error("Failed to add voice interaction:", error);
    return { success: false, error: "Failed to add voice interaction" };
  }
}

export async function updateCapsuleTitle(capsuleId: number, title: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;
  try {
    const [updatedCapsule] = await db
      .update(capsules)
      .set({ title })
      .where(eq(capsules.id, capsuleId))
      .returning();

    if (!updatedCapsule || updatedCapsule.createdById !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    revalidatePath(`/capsule/${capsuleId}`);
    return { success: true, data: updatedCapsule };
  } catch (error) {
    console.error("Failed to update capsule title:", error);
    return { success: false, error: "Failed to update capsule title" };
  }
}

export async function updateFollowupPool(
  capsuleId: number,
  followups: string[],
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;
  try {
    const capsule = await db.query.capsules.findFirst({
      where: eq(capsules.id, capsuleId),
    });

    if (!capsule || capsule.createdById !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const currentFollowups = capsule.followupPool as string[];
    const updatedFollowups = [...currentFollowups, ...followups];

    await db
      .update(capsules)
      .set({ followupPool: updatedFollowups })
      .where(eq(capsules.id, capsuleId));

    revalidatePath(`/capsule/${capsuleId}`);
    return { success: true, followups: updatedFollowups };
  } catch (error) {
    console.error("Failed to update followup pool:", error);
    return { success: false, error: "Failed to update followup pool" };
  }
}
