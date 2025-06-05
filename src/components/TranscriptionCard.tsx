import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TranscriptionCardProps = {
  transcription: string;
};

export function TranscriptionCard({ transcription }: TranscriptionCardProps) {
  if (!transcription) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Transcription</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{transcription}</p>
      </CardContent>
    </Card>
  );
}
