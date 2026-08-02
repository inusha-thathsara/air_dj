import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { useAppSelector } from "../store/hooks";
import { bleService } from "../services/BleService";
import { PadHit } from "../types/Telemetry";

const PATTERN_MODES = [
  { id: 0, name: "Cyberpunk VU", color: "#FF007F" },
  { id: 1, name: "Acid Drop", color: "#39FF14" },
  { id: 2, name: "UV Bass Ripple", color: "#8A2BE2" },
  { id: 3, name: "EDM Plasma", color: "#00FFFF" },
  { id: 4, name: "Tomorrowland Strobe", color: "#FFFFFF" },
  { id: 5, name: "Neon Explosion", color: "#FFD700" },
  { id: 6, name: "Mega Columns", color: "#FF0055" },
  { id: 7, name: "Sound Hearts", color: "#FF3366" },
];

export function MixerScreen() {
  const telemetry = useAppSelector((state) => state.telemetry);
  const bleConnected = useAppSelector((state) => state.ble.connected);
  const [selectedMode, setSelectedMode] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSelectPattern = async (modeId: number) => {
    setSelectedMode(modeId);
    if (!bleConnected) {
      setStatusMsg("Connect to AirDJ-ESP32 first via Bluetooth screen.");
      return;
    }

    try {
      await bleService.sendCommand({
        id: Date.now().toString(),
        cmd: "select_track",
        param1: modeId,
        sentAt: Date.now(),
      });
      setStatusMsg(`Switched to pattern: ${PATTERN_MODES[modeId].name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send command";
      setStatusMsg(`Error: ${msg}`);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mixer & LED Pattern Control</Text>
      <Text>BPM: {telemetry.bpm}</Text>
      <Text>Master Volume: {telemetry.masterVolume ?? 0}%</Text>
      {statusMsg ? <Text style={styles.statusText}>{statusMsg}</Text> : null}

      <Text style={styles.sectionTitle}>Select LED Pattern Mode</Text>
      <View style={styles.patternGrid}>
        {PATTERN_MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          return (
            <TouchableOpacity
              key={`mode-${mode.id}`}
              style={[
                styles.patternCard,
                { borderColor: mode.color },
                isSelected && { backgroundColor: mode.color },
              ]}
              onPress={() => handleSelectPattern(mode.id)}
            >
              <Text
                style={[
                  styles.patternText,
                  isSelected && styles.patternTextSelected,
                ]}
              >
                {mode.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Pad Monitor</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    color: "#1A202C",
  },
  statusText: {
    color: "#2B6CB0",
    fontWeight: "600",
    fontSize: 13,
  },
  patternGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  patternCard: {
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    backgroundColor: "#F7FAFC",
  },
  patternText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D3748",
  },
  patternTextSelected: {
    color: "#FFFFFF",
  },
  padGrid: {
    marginTop: 6,
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
