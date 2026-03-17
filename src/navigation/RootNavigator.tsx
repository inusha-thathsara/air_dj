import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ConnectScreen } from "../screens/ConnectScreen";
import { MixerScreen } from "../screens/MixerScreen";
import { NowPlayingScreen } from "../screens/NowPlayingScreen";
import { PlaylistsScreen } from "../screens/PlaylistsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

export type RootTabParamList = {
  Connect: undefined;
  NowPlaying: undefined;
  Playlists: undefined;
  Mixer: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerTitleAlign: "center",
          tabBarIcon: ({ focused, color, size }) => {
            let iconName:
              | "bluetooth-connect"
              | "bluetooth"
              | "disc-player"
              | "disc"
              | "playlist-music"
              | "playlist-music-outline"
              | "tune-variant"
              | "tune"
              | "cog"
              | "cog-outline" = "cog-outline";

            switch (route.name) {
              case "Connect":
                iconName = focused ? "bluetooth-connect" : "bluetooth";
                break;
              case "NowPlaying":
                iconName = focused ? "disc-player" : "disc";
                break;
              case "Playlists":
                iconName = focused ? "playlist-music" : "playlist-music-outline";
                break;
              case "Mixer":
                iconName = focused ? "tune-variant" : "tune";
                break;
              case "Settings":
                iconName = focused ? "cog" : "cog-outline";
                break;
            }

            return <MaterialCommunityIcons name={iconName} size={size + 2} color={color} />;
          },
          tabBarActiveTintColor: "#0F766E",
          tabBarInactiveTintColor: "#6B7280",
          tabBarStyle: {
            height: 72,
            paddingTop: 8,
            paddingBottom: 10,
            backgroundColor: "#F8FAFC",
            borderTopColor: "#D1D5DB",
            borderTopWidth: 1,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
        })}
      >
        <Tab.Screen
          name="Connect"
          component={ConnectScreen}
          options={{ title: "Connect" }}
        />
        <Tab.Screen
          name="NowPlaying"
          component={NowPlayingScreen}
          options={{ title: "Now Playing" }}
        />
        <Tab.Screen
          name="Playlists"
          component={PlaylistsScreen}
          options={{ title: "Playlists" }}
        />
        <Tab.Screen
          name="Mixer"
          component={MixerScreen}
          options={{ title: "Mixer" }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Settings" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
