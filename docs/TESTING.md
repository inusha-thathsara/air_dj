# Testing Guide

## Quick Manual Smoke Test

## Web

1. Start web:

```bash
npx expo start --web --clear
```

2. Open app in browser.
3. Verify tabs render and icons display correctly.
4. In `Playlists` tab, add playlists and confirm they appear.
5. In `Connect` tab, press connect and confirm web BLE warning appears.

## Android/iOS (BLE Validation)

1. Run app on device/emulator.
2. Open `Connect` tab and tap `Scan & Connect`.
3. Confirm device with name prefix `AirDJ` can be discovered.
4. Verify `Now Playing` and `Mixer` update when telemetry arrives.
5. Confirm `Disconnect` returns state to disconnected.

## Type Safety Check

```bash
npx tsc --noEmit
```

## What to Validate Per Screen

### Connect

- Scan button transitions to scanning state
- Connection success updates device name/id
- Timeout and unavailable BLE errors are visible

### Now Playing

- BPM, beat phase, LED color, and latency update from telemetry state

### Playlists

- Initial load from persistence layer
- Add playlist updates UI and storage abstraction

### Mixer

- Pad visual intensity reacts to `padHits`
- Master volume and BPM values render

### Settings

- Connection and diagnostics values update from `bleSlice`

## Known Test Constraints

- BLE cannot be fully validated on web runtime.
- Web playlist persistence is in-memory for now (resets on reload).
- Native SQLite persistence should be validated on Android/iOS.

## Suggested Next Automated Tests

- Unit tests for `TelemetryService.parse`
- Unit tests for `StorageService` web/native branching
- Service-level tests for `BleService` error paths
- Integration test for playlist add/list flow
