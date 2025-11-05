# AirDJ Control Surface

AirDJ is a Flutter-based control console for the AirDJ performance system. The
app focuses on monitoring wireless glove telemetry, calibrating sensors, and
mapping gestures or mixer hardware to MIDI events. This repository contains the
interface layer only; hardware integrations can be wired in later via platform
channels or web sockets.

## Feature Highlights

- **System Status** – Monitor glove and base station connectivity, inspect Wi-Fi
	and Bluetooth settings, and review packet flow to catch transmission gaps.
- **Sensor Calibration** – Guided flows for flex sensor min/max capture and IMU
	offset calibration, with live normalized finger curl and orientation readouts.
- **Gesture-to-MIDI Engine** – Configure continuous controllers and discrete
	triggers, maintain a mapping matrix, and tailor response curves or thresholds.
- **Mixer & Auxiliary Controls** – Adjust WS2812B LED visualizer modes,
	inspect physical control positions, and browse the SD sample library.

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

1. Replace sample data sources in `AirDJDashboard` with live streams from your
	 base station or gloves.
2. Connect configuration actions (e.g., "Record Open Hand", "Store Trigger") to
	 backend APIs or firmware commands.
3. Persist user-created mappings using your preferred storage (SQLite, REST
	 backend, etc.).
4. Add authentication or multi-device management if deploying to multiple rigs.

## Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.
When contributing, format Dart code with `flutter format` and ensure the app
still runs on the intended targets.

## License

This project is distributed under the MIT License. See `LICENSE` for details.
