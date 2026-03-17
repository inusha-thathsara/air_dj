export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  durationMs: number;
  bpm?: number;
  artworkUri?: string;
  source: "local" | "hardware";
}
