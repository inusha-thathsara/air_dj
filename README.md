# AirDJ Mobile App

Bluetooth-enabled mobile app for the Air DJ Home Party Unit.

This app is built with Expo + React Native and currently provides:
- BLE connection flow (mobile platforms)
- Live telemetry visualization (BPM, beat phase, LED mirror, pad activity)
- Playlist management with local persistence
- Diagnostics and connection status screens

## Tech Stack

- Expo SDK 55
- React Native + TypeScript
- React Navigation (bottom tabs)
- Redux Toolkit + React Redux
- `react-native-ble-plx` for BLE
- `expo-sqlite` on native platforms
- Web-safe storage fallback for browser mode

## Features (Current)

- Connect / disconnect to devices advertising name prefix `AirDJ`
- Parse incoming telemetry payloads and push into Redux state
- Show live values in `Now Playing`, `Mixer`, and `Settings`
- Create and list playlists
- Native SQLite storage for Android/iOS
- In-memory fallback storage in web mode

## Project Structure

```text
src/
  navigation/
    RootNavigator.tsx
  screens/
    ConnectScreen.tsx
    NowPlayingScreen.tsx
    PlaylistsScreen.tsx
    MixerScreen.tsx
    SettingsScreen.tsx
  services/
    BleService.ts
    TelemetryService.ts
    StorageService.ts
    PlaylistService.ts
  store/
    store.ts
    hooks.ts
    slices/
      bleSlice.ts
      telemetrySlice.ts
      playlistSlice.ts
      playbackSlice.ts
  types/
    Bluetooth.ts
    Device.ts
    Telemetry.ts
    Playlist.ts
    Track.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Expo-compatible environment

### Install

```bash
npm install
```

### Run (Web)

```bash
npm run web
```

If port `8081` is busy:

```bash
npx expo start --web --port 8082 --clear
```

### Run (Android / iOS)

```bash
npm run android
npm run ios
```

## Build APK (EAS)

1. Login to Expo account:

```bash
npx eas-cli login
```

2. Build APK profile:

```bash
npx eas-cli build -p android --profile preview
```

Note: EAS account authentication is required.

## Important Platform Notes

- BLE is mobile-only. In web mode, BLE connect attempts return a friendly error.
- `expo-sqlite` is native-first. Web mode uses in-memory fallback currently.

## Documentation Index

- Architecture: `docs/ARCHITECTURE.md`
- BLE Protocol: `docs/BLE_PROTOCOL.md`
- Testing Guide: `docs/TESTING.md`
- Development Notes: `DEVELOPMENT.md`

## Current Limitations

- No cloud sync yet
- No OTA firmware update flow yet
- Playlist tracks are currently metadata-first (track linking is incremental)

## License

This project currently has no explicit license file.
