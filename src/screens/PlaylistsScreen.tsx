import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { playlistService } from "../services/PlaylistService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { playlistAdded, setPlaylists } from "../store/slices/playlistSlice";

export function PlaylistsScreen() {
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;

    const loadPlaylists = async () => {
      try {
        const results = await playlistService.list();
        if (mounted) {
          dispatch(setPlaylists(results));
          setError(undefined);
        }
      } catch (loadError) {
        if (mounted) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : "Failed to load playlists from local database.";
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPlaylists();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  const handleAddPlaylist = async () => {
    try {
      const playlist = await playlistService.create(`Party Set ${playlists.length + 1}`);
      dispatch(playlistAdded(playlist));
      setError(undefined);
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Failed to create playlist in local database.";
      setError(message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Playlists</Text>
      <Button title="Add Playlist" onPress={handleAddPlaylist} />
      {loading ? <Text>Loading playlists...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text>{item.trackIds.length} tracks</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No playlists yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  itemName: {
    fontWeight: "600",
  },
  error: {
    color: "#C53030",
  },
});
