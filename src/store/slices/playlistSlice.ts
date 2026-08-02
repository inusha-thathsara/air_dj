import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Playlist } from "../../types/Playlist";
import { Track } from "../../types/Track";

interface PlaylistState {
  playlists: Playlist[];
  tracks: Track[];
  selectedPlaylistId?: string;
}

const initialState: PlaylistState = {
  playlists: [],
  tracks: [],
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    setPlaylists: (state, action: PayloadAction<Playlist[]>) => {
      state.playlists = action.payload;
    },
    setTracks: (state, action: PayloadAction<Track[]>) => {
      state.tracks = action.payload;
    },
    playlistSelected: (state, action: PayloadAction<string | undefined>) => {
      state.selectedPlaylistId = action.payload;
    },
    playlistAdded: (state, action: PayloadAction<Playlist>) => {
      state.playlists.push(action.payload);
    },
    playlistRemoved: (state, action: PayloadAction<string>) => {
      state.playlists = state.playlists.filter((p) => p.id !== action.payload);
      if (state.selectedPlaylistId === action.payload) {
        state.selectedPlaylistId = undefined;
      }
    },
  },
});

export const { setPlaylists, setTracks, playlistSelected, playlistAdded, playlistRemoved } =
  playlistSlice.actions;

export default playlistSlice.reducer;
