# BLE Protocol (Current App Contract)

This document describes the BLE contract used by the current app implementation.

## Device Discovery

- Scan filter: device name starts with `AirDJ`
- Scan timeout: 10 seconds

## Service and Characteristics

UUID constants are defined in `src/types/Bluetooth.ts`.

- Service UUID: `AIR_DJ_SERVICE_UUID`
- Telemetry notify characteristic: `AIR_DJ_TELEMETRY_CHAR_UUID`
- Command write characteristic: `AIR_DJ_COMMAND_CHAR_UUID`

## Connection Flow

1. Start scan
2. Match first device with name prefix `AirDJ`
3. Connect and discover services/characteristics
4. Subscribe to telemetry characteristic
5. Push connection state into Redux

## Telemetry Payload

Current app expects base64-encoded UTF-8 JSON payload.

Example decoded payload:

```json
{
  "timestamp": 1710000000000,
  "bpm": 124,
  "beatPhase": 2,
  "ledColor": "#00FFAA",
  "masterVolume": 180,
  "padHits": [
    { "padId": 1, "velocity": 95, "event": "press" }
  ]
}
```

## Command Payload

Commands are serialized as JSON, then base64-encoded before write.

Command shape:

```json
{
  "id": "cmd-123",
  "cmd": "set_bpm",
  "param1": 128,
  "param2": 0,
  "sentAt": 1710000000000
}
```

## Error Handling

- If BLE is unavailable (e.g., web), connection attempt returns:
  - `Bluetooth is only available on mobile devices (iOS/Android).`
- On scan timeout:
  - `Scan timeout: no AirDJ device found.`

## Web vs Native

- Native (Android/iOS): BLE enabled through `react-native-ble-plx`
- Web: BLE service returns unsupported message (no native BLE module)
