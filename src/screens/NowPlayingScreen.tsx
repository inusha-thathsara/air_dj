import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppSelector } from "../store/hooks";

export function NowPlayingScreen() {
  const playback = useAppSelector((state) => state.playback);
  const telemetry = useAppSelector((state) => state.telemetry);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Now Playing</Text>
      <Text style={styles.trackTitle}>{playback.title ?? "No track selected"}</Text>
      <Text>{playback.artist ?? "Unknown artist"}</Text>
      <Text>Status: {playback.status}</Text>
      <Text>BPM: {telemetry.bpm}</Text>
      <Text>Beat Phase: {telemetry.beatPhase}</Text>
      <View style={[styles.ledMirror, { backgroundColor: telemetry.ledColor }]} />
      <Text>Latency: {telemetry.latencyMs ?? 0} ms</Text>
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
  trackTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  ledMirror: {
    height: 56,
    borderRadius: 10,
  },
});
