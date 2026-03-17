import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlaybackState {
  trackId?: string;
  title?: string;
  artist?: string;
  status: "idle" | "playing" | "paused";
}

const initialState: PlaybackState = {
  status: "idle",
};

const playbackSlice = createSlice({
  name: "playback",
  initialState,
  reducers: {
    nowPlayingSet: (
      state,
      action: PayloadAction<{ trackId?: string; title?: string; artist?: string }>
    ) => {
      state.trackId = action.payload.trackId;
      state.title = action.payload.title;
      state.artist = action.payload.artist;
    },
    playbackStatusSet: (
      state,
      action: PayloadAction<"idle" | "playing" | "paused">
    ) => {
      state.status = action.payload;
    },
  },
});

export const { nowPlayingSet, playbackStatusSet } = playbackSlice.actions;

export default playbackSlice.reducer;
