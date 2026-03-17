import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BleState {
  isScanning: boolean;
  connected: boolean;
  deviceName?: string;
  deviceId?: string;
  rssi?: number;
  error?: string;
  lastTelemetryTimestamp?: number;
}

const initialState: BleState = {
  isScanning: false,
  connected: false,
};

const bleSlice = createSlice({
  name: "ble",
  initialState,
  reducers: {
    scanStarted: (state) => {
      state.isScanning = true;
      state.error = undefined;
    },
    scanStopped: (state) => {
      state.isScanning = false;
    },
    deviceConnected: (
      state,
      action: PayloadAction<{ deviceId: string; deviceName?: string }>
    ) => {
      state.connected = true;
      state.deviceId = action.payload.deviceId;
      state.deviceName = action.payload.deviceName;
      state.error = undefined;
    },
    deviceDisconnected: (state) => {
      state.connected = false;
    },
    rssiUpdated: (state, action: PayloadAction<number>) => {
      state.rssi = action.payload;
    },
    telemetrySeen: (state, action: PayloadAction<number>) => {
      state.lastTelemetryTimestamp = action.payload;
    },
    bleError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const {
  scanStarted,
  scanStopped,
  deviceConnected,
  deviceDisconnected,
  rssiUpdated,
  telemetrySeen,
  bleError,
} = bleSlice.actions;

export default bleSlice.reducer;
