import { env } from "@/env";

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get("audio") as File;
  if (!audioFile) {
    return Response.json({ error: "No audio file provided" }, { status: 400 });
  }
  const REGION = env.BUNNY_REGION ?? "";
  const BASE_HOSTNAME = "storage.bunnycdn.com";
  const HOSTNAME = REGION ? `${REGION}.${BASE_HOSTNAME}` : BASE_HOSTNAME;
  const STORAGE_ZONE_NAME = env.BUNNY_STORAGE_ZONE_NAME;
  const ACCESS_KEY = env.BUNNY_STORAGE_API_KEY;

  if (!STORAGE_ZONE_NAME || !ACCESS_KEY) {
    return Response.json(
      { error: "Bunny CDN configuration missing" },
      { status: 500 },
    );
  }

  const timestamp = Date.now();
  const filename = `audio-${timestamp}.webm`;

  try {
    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Bunny CDN
    const uploadUrl = `https://${HOSTNAME}/${STORAGE_ZONE_NAME}/${filename}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: ACCESS_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Bunny CDN upload failed:", errorText);
      return Response.json({ error: "Upload failed" }, { status: 500 });
    }

    // Generate the CDN URL
    const cdnUrl = `https://${STORAGE_ZONE_NAME}.b-cdn.net/${filename}`;

    return Response.json({
      success: true,
      url: cdnUrl,
      size: buffer.length,
    });
  } catch (error) {
    console.error("Audio upload error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
