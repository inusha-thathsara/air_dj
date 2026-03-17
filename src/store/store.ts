import { configureStore } from "@reduxjs/toolkit";
import bleReducer from "./slices/bleSlice";
import playbackReducer from "./slices/playbackSlice";
import playlistReducer from "./slices/playlistSlice";
import telemetryReducer from "./slices/telemetrySlice";

export const store = configureStore({
  reducer: {
    ble: bleReducer,
    telemetry: telemetryReducer,
    playlist: playlistReducer,
    playback: playbackReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
