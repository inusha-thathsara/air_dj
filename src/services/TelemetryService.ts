import { TelemetryFrame } from "../types/Telemetry";

class TelemetryService {
  parse(raw: string): TelemetryFrame | null {
    try {
      const data = JSON.parse(raw) as Partial<TelemetryFrame>;
      if (typeof data.bpm !== "number") {
        return null;
      }

      return {
        timestamp: data.timestamp ?? Date.now(),
        bpm: data.bpm,
        beatPhase: data.beatPhase ?? 0,
        ledColor: data.ledColor ?? "#000000",
        masterVolume: data.masterVolume ?? 0,
        padHits: data.padHits ?? [],
        latencyMs: Date.now() - (data.timestamp ?? Date.now()),
      };
    } catch {
      return null;
    }
  }
}

export const telemetryService = new TelemetryService();
