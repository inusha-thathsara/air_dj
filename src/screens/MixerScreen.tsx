import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppSelector } from "../store/hooks";
import { PadHit } from "../types/Telemetry";

export function MixerScreen() {
  const telemetry = useAppSelector((state) => state.telemetry);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mixer & Pad Monitor</Text>
      <Text>BPM: {telemetry.bpm}</Text>
      <Text>Recent pad hits: {telemetry.lastPadHits.length}</Text>
      <Text>Master volume: {telemetry.masterVolume ?? 0}</Text>
      <View style={styles.padGrid}>
        {Array.from({ length: 8 }).map((_, idx) => {
          const hit = telemetry.lastPadHits.find((pad: PadHit) => pad.padId === idx);
          const intensity = hit ? Math.min(1, hit.velocity / 127) : 0.15;
          return (
            <View
              key={`pad-${idx}`}
              style={[
                styles.pad,
                { backgroundColor: `rgba(38, 90, 200, ${intensity})` },
              ]}
            >
              <Text style={styles.padText}>{idx + 1}</Text>
            </View>
          );
        })}
      </View>
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
  padGrid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pad: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(38, 90, 200, 0.15)",
  },
  padText: {
    fontWeight: "700",
    color: "#0B1A39",
  },
});
