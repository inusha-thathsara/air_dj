import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppSelector } from "../store/hooks";

export function SettingsScreen() {
  const ble = useAppSelector((state) => state.ble);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnostics</Text>
      <Text>Connected: {ble.connected ? "Yes" : "No"}</Text>
      <Text>Device: {ble.deviceName ?? "N/A"}</Text>
      <Text>Device ID: {ble.deviceId ?? "N/A"}</Text>
      <Text>RSSI: {ble.rssi ?? "N/A"}</Text>
      <Text>Last telemetry: {ble.lastTelemetryTimestamp ?? "N/A"}</Text>
      {ble.error ? <Text style={styles.error}>{ble.error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  error: {
    color: "#C53030",
  },
});
