import { Playlist } from "../types/Playlist";
import { storageService } from "./StorageService";

class PlaylistService {
  async list(): Promise<Playlist[]> {
    const rows = await storageService.listPlaylists();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      trackIds: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async create(name: string): Promise<Playlist> {
    const now = new Date().toISOString();
    const id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    await storageService.insertPlaylist({
      id,
      name,
      created_at: now,
      updated_at: now,
    });

    return {
      id,
      name,
      trackIds: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  async delete(id: string): Promise<void> {
    await storageService.deletePlaylist(id);
  }
}

export const playlistService = new PlaylistService();
