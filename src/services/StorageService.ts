import { Platform } from "react-native";

type PlaylistRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type SQLiteModule = typeof import("expo-sqlite");
type SQLiteDatabase = Awaited<ReturnType<SQLiteModule["openDatabaseAsync"]>>;

class StorageService {
  private sqliteModule?: SQLiteModule;
  private dbPromise?: Promise<SQLiteDatabase>;
  private initialized = false;
  private webPlaylists: PlaylistRow[] = [];

  private async getNativeDb(): Promise<SQLiteDatabase> {
    if (Platform.OS === "web") {
      throw new Error("Native SQLite database is unavailable on web.");
    }

    if (!this.sqliteModule) {
      this.sqliteModule = await import("expo-sqlite");
    }

    if (!this.dbPromise) {
      this.dbPromise = this.sqliteModule.openDatabaseAsync("airdj.db");
    }

    return this.dbPromise;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (Platform.OS === "web") {
      this.initialized = true;
      return;
    }

    const db = await this.getNativeDb();

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS tracks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        bpm INTEGER,
        source TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS playlist_tracks (
        playlist_id TEXT NOT NULL,
        track_id TEXT NOT NULL,
        track_order INTEGER NOT NULL,
        PRIMARY KEY (playlist_id, track_id)
      );
    `);

    this.initialized = true;
  }

  async listPlaylists(): Promise<PlaylistRow[]> {
    await this.init();

    if (Platform.OS === "web") {
      return [...this.webPlaylists].sort((a, b) =>
        b.updated_at.localeCompare(a.updated_at)
      );
    }

    const db = await this.getNativeDb();
    return db.getAllAsync<PlaylistRow>(
      "SELECT id, name, created_at, updated_at FROM playlists ORDER BY updated_at DESC"
    );
  }

  async insertPlaylist(row: PlaylistRow): Promise<void> {
    await this.init();

    if (Platform.OS === "web") {
      this.webPlaylists.push(row);
      return;
    }

    const db = await this.getNativeDb();
    await db.runAsync(
      "INSERT INTO playlists (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
      row.id,
      row.name,
      row.created_at,
      row.updated_at
    );
  }
}

export const storageService = new StorageService();
