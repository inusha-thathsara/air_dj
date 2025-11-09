# AirDJ Control Surface

AirDJ is a Flutter-based control console for the AirDJ performance system. The
app focuses on monitoring wireless glove telemetry, calibrating sensors, and
mapping gestures or mixer hardware to MIDI events. This repository contains the
interface layer only; hardware integrations can be wired in later via platform
channels or web sockets.

## Feature Highlights

- **System Status** – Monitor glove and base station connectivity, manage Bluetooth pairing, and review sequential packet IDs to verify a stable wireless link (Wi‑Fi configuration has been removed).
- **Sensor Calibration** – Guided flows for flex sensor min/max capture and IMU offset calibration, plus live normalized finger curl and fused orientation (pitch / roll / yaw) readouts.
- **Gesture-to-MIDI Engine** – Create continuous and discrete mappings in a responsive mapping matrix (header now wraps cleanly on small screens). Configure response curves, thresholds, and MIDI messages.
- **Mixer & Auxiliary Controls** – Adjust WS2812B LED visualizer modes & brightness (with optional beat sync), view physical mixer control positions, and browse / assign samples from SD storage.

## Prerequisites

- Flutter 3.22+ and a working Dart SDK installation
- A recent version of Android Studio, VS Code, or the Flutter CLI tools
- Device or emulator for your target platform (Android, iOS, web, desktop)

Check your environment:

```bash
flutter doctor
```

## Running the App

Install dependencies and launch the UI on your preferred platform:

```bash
flutter pub get
flutter run
```

To target the web dashboard explicitly:

```bash
flutter run -d chrome
```

## Project Structure

- `lib/main.dart` – Main dashboard with tabbed navigation across the four core
	surfaces (Status, Calibration, Gesture Mapping, Mixer & Aux).
- `lib/` (future) – Place additional widgets, services, or integration layers
	when wiring to firmware or network transports.
- `assets/` (optional) – Add fonts, icons, or mock data for previews.

## Extending the Interface

1. Replace placeholder sample data in `AirDJDashboard` with live streams (BLE, WebSocket, UDP, etc.).
2. Wire calibration actions (e.g., "Record Open Hand", "Start IMU Calibration") to firmware RPC or command endpoints.
3. Persist user-created mappings (e.g., JSON file, SQLite, REST backend) and add import/export.
4. Implement a MIDI backend (platform channels or web MIDI polyfill for web builds).
5. Add performance overlays (latency, packet jitter) and logging export for diagnostics.
6. Introduce profile management (different mapping sets per performance context).

## Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.
When contributing, format Dart code with `flutter format` and ensure the app
still runs on the intended targets.

## Recent Changes

- Removed Wi‑Fi configuration UI (design decision: Bluetooth-only management for now).
- Converted mapping matrix header layout from a fixed `Row` + `Spacer` to a wrapping layout for narrow devices.
- Adjusted discrete trigger toggle layout to prevent horizontal overflow on small screens.

## License

This project is distributed under the MIT License. See `LICENSE` for details.
