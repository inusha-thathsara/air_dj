import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { bleService } from "../services/BleService";
import { telemetryService } from "../services/TelemetryService";
import {
  bleError,
  deviceConnected,
  deviceDisconnected,
  scanStarted,
  scanStopped,
  telemetrySeen,
} from "../store/slices/bleSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { telemetryUpdated } from "../store/slices/telemetrySlice";

export function ConnectScreen() {
  const dispatch = useAppDispatch();
  const ble = useAppSelector((state) => state.ble);

  const handleConnect = async () => {
    dispatch(scanStarted());

    try {
      await bleService.scanAndConnect({
        onConnected: (device) => {
          dispatch(
            deviceConnected({ deviceId: device.id, deviceName: device.name ?? "AirDJ" })
          );
          dispatch(scanStopped());
        },
        onDisconnected: () => {
          dispatch(deviceDisconnected());
        },
        onError: (message) => {
          dispatch(bleError(message));
          dispatch(scanStopped());
        },
        onTelemetry: (payload) => {
          const frame = telemetryService.parse(payload);
          if (!frame) {
            return;
          }

          dispatch(telemetryUpdated(frame));
          dispatch(telemetrySeen(frame.timestamp));
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to connect to AirDJ device.";
      dispatch(bleError(message));
      dispatch(scanStopped());
    }
  };

  const handleDisconnect = async () => {
    await bleService.disconnect({
      onDisconnected: () => dispatch(deviceDisconnected()),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth Connection</Text>
      <Text>Status: {ble.connected ? "Connected" : "Disconnected"}</Text>
      <Text>Device: {ble.deviceName ?? "N/A"}</Text>
      {!ble.connected && ble.error ? <Text style={styles.error}>{ble.error}</Text> : null}

      <View style={styles.actions}>
        <Button title={ble.isScanning ? "Scanning..." : "Scan & Connect"} onPress={handleConnect} />
        <Button title="Disconnect" onPress={handleDisconnect} disabled={!ble.connected} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  actions: {
    marginTop: 8,
    gap: 8,
  },
  error: {
    color: "#C53030",
  },
});
