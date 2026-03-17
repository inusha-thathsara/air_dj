import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { storageService } from "./src/services/StorageService";
import { store } from "./src/store/store";

export default function App() {
  useEffect(() => {
    storageService.init().catch((error) => {
      const message =
        error instanceof Error ? error.message : "Failed to initialize local database.";
      console.warn(message);
    });
  }, []);

  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <RootNavigator />
    </Provider>
  );
}
