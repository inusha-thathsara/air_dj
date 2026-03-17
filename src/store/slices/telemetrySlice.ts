import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PadHit, TelemetryFrame } from "../../types/Telemetry";

interface TelemetryState {
  bpm: number;
  beatPhase: number;
  ledColor: string;
  masterVolume: number;
  lastPadHits: PadHit[];
  latencyMs?: number;
}

const initialState: TelemetryState = {
  bpm: 0,
  beatPhase: 0,
  ledColor: "#000000",
  masterVolume: 0,
  lastPadHits: [],
};

const telemetrySlice = createSlice({
  name: "telemetry",
  initialState,
  reducers: {
    telemetryUpdated: (state, action: PayloadAction<TelemetryFrame>) => {
      state.bpm = action.payload.bpm;
      state.beatPhase = action.payload.beatPhase;
      state.ledColor = action.payload.ledColor;
      state.masterVolume = action.payload.masterVolume;
      state.lastPadHits = action.payload.padHits;
      state.latencyMs = action.payload.latencyMs;
    },
  },
});

export const { telemetryUpdated } = telemetrySlice.actions;

export default telemetrySlice.reducer;
