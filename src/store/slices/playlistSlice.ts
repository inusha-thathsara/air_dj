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
  },
});

export const { setPlaylists, setTracks, playlistSelected, playlistAdded } =
  playlistSlice.actions;

export default playlistSlice.reducer;
