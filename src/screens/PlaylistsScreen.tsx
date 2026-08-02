import React, { useEffect, useState } from "react";
import { Alert, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { playlistService } from "../services/PlaylistService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { playlistAdded, playlistRemoved, setPlaylists } from "../store/slices/playlistSlice";

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

  const handleDeletePlaylist = (id: string, name: string) => {
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await playlistService.delete(id);
              dispatch(playlistRemoved(id));
              setError(undefined);
            } catch (deleteError) {
              const message =
                deleteError instanceof Error
                  ? deleteError.message
                  : "Failed to delete playlist.";
              setError(message);
            }
          },
        },
      ]
    );
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
            <View style={styles.itemContent}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text>{item.trackIds.length} tracks</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePlaylist(item.id, item.name)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontWeight: "600",
  },
  error: {
    color: "#C53030",
  },
  deleteButton: {
    backgroundColor: "#C53030",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
});
