export interface PadHit {
  padId: number;
  velocity: number;
  pressure?: number;
  event: "press" | "release" | "pressure";
}

export interface TelemetryFrame {
  timestamp: number;
  bpm: number;
  beatPhase: number;
  ledColor: string;
  masterVolume: number;
  padHits: PadHit[];
  latencyMs?: number;
}
