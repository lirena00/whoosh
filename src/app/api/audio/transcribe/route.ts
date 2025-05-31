import { env } from "@/env";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const audiourl = searchParams.get("audiourl");

  if (!audiourl) {
    return Response.json(
      { error: "Missing audiourl parameter" },
      { status: 400 },
    );
  }

  const proxyUrl = `${env.LLM_API_URL}/aud?audiourl=${encodeURIComponent(audiourl)}`;
  const response = await fetch(proxyUrl);

  if (!response.ok) {
    return Response.json(
      { error: "Failed to transcribe file" },
      { status: 500 },
    );
  }

  try {
    const { text } = (await response.json()) as { text: string };
    return Response.json({ text });
  } catch (err) {
    console.error("JSON parse error:", err);
    return Response.json(
      { error: "Invalid response from transcription service" },
      { status: 500 },
    );
  }
}
