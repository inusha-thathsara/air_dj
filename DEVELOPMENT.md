# Development Guide

## Local Workflow

1. Install dependencies:

```bash
npm install
```

2. Run typecheck:

```bash
npx tsc --noEmit
```

3. Run app:

```bash
npm run web
# or
npm run android
# or
npm run ios
```

## Recommended Daily Cycle

1. Start web server for rapid UI iteration.
2. Validate TypeScript after each feature slice.
3. Validate on Android device/emulator for BLE-specific changes.
4. Keep feature changes isolated by module:
   - `services/` for business logic and external integrations
   - `store/slices/` for app state
   - `screens/` for UI and user actions

## BLE Development Notes

- BLE manager initialization can fail on web, so always handle unavailable runtime.
- Keep scan timeout behavior deterministic (currently 10 seconds).
- Treat telemetry payloads as untrusted input and parse defensively.

## Storage Notes

- Native (Android/iOS): SQLite via `expo-sqlite`
- Web: in-memory fallback in `StorageService`
- Avoid importing `expo-sqlite` statically in web-critical modules.

## Useful Commands

```bash
# Start Expo
npm start

# Start web with cache clear
npx expo start --web --clear

# Type check
npx tsc --noEmit

# Install Expo-compatible package
npx expo install <package>
```

## Common Issues

### 1) Web shows bundle JSON or blank screen

- Ensure Expo is in web mode
- Hard refresh browser (`Ctrl+F5`)
- Restart with clear cache:

```bash
npx expo start --web --clear
```

### 2) Port 8081 already in use

```bash
npx expo start --web --port 8082
```

### 3) BLE crashes or undefined on web

- Expected behavior if BLE native module is unavailable on browser runtime.
- Use mobile target for BLE validation.
