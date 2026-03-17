# Architecture

## Overview

AirDJ Mobile App follows a modular client architecture:

- UI screens render state and dispatch user intents
- Services handle BLE, telemetry parsing, and persistence
- Redux slices hold app state for UI consistency

## Layers

## Presentation Layer

- `ConnectScreen`: BLE connection actions and status
- `NowPlayingScreen`: live playback and telemetry values
- `PlaylistsScreen`: create/list playlists
- `MixerScreen`: pad intensity and mixer snapshot
- `SettingsScreen`: diagnostics details

## Domain/Service Layer

- `BleService`: scan/connect/disconnect, command sending, telemetry subscription
- `TelemetryService`: parse incoming payload into app-safe telemetry frame
- `PlaylistService`: playlist list/create orchestration
- `StorageService`: platform-specific persistence abstraction

## State Layer (Redux)

- `bleSlice`: scan state, connection status, device metadata, errors
- `telemetrySlice`: BPM, beat phase, LED color, master volume, pad hits, latency
- `playlistSlice`: playlists and selected playlist state
- `playbackSlice`: now-playing metadata and playback status

## Runtime Data Flow

1. User taps connect in `ConnectScreen`
2. `BleService.scanAndConnect` discovers and connects to `AirDJ*`
3. BLE telemetry notifications stream as base64 payloads
4. `TelemetryService` parses payload JSON to typed frame
5. `telemetrySlice` updates Redux state
6. `NowPlayingScreen`, `MixerScreen`, and `SettingsScreen` re-render with live data

## Storage Strategy

- Native: SQLite tables initialized at app startup (`App.tsx` -> `storageService.init()`)
- Web: in-memory playlist list used to avoid `expo-sqlite` web wasm bundling issues

## Navigation

Bottom tab navigation with 5 tabs:
- Connect
- Now Playing
- Playlists
- Mixer
- Settings

## Design Decisions

- Defensive BLE initialization for web runtime compatibility
- Lazy loading native SQLite module to avoid web bundling failures
- Centralized Redux store for deterministic state updates across screens
