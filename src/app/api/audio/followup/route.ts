import { env } from "@/env";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stuff = searchParams.get("stuff");

  if (!stuff) {
    return Response.json(
      { error: "Missing transcription parameter" },
      { status: 400 },
    );
  }

  const proxyUrl = `${env.LLM_API_URL}/fol?stuff=${encodeURIComponent(stuff)}`;

  const response = await fetch(proxyUrl);

  if (!response.ok) {
    return Response.json(
      { error: "Failed to transcribe file" },
      { status: 500 },
    );
  }

  try {
    const { title, refined_transcription, followup } =
      (await response.json()) as {
        title: string;
        refined_transcription: string;
        followup: string[];
      };
    return Response.json({ title, refined_transcription, followup });
  } catch (err) {
    console.error("JSON parse error:", err);
    return Response.json(
      { error: "Invalid response from transcription service" },
      { status: 500 },
    );
  }
}
