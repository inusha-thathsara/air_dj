import { BleManager, Device, Subscription } from "react-native-ble-plx";
import { Platform, PermissionsAndroid } from "react-native";
import { Buffer } from "buffer";
import {
  AIR_DJ_COMMAND_CHAR_UUID,
  AIR_DJ_SERVICE_UUID,
  AIR_DJ_TELEMETRY_CHAR_UUID,
  DeviceCommand,
} from "../types/Bluetooth";

export type BleEventHandlers = {
  onConnected?: (device: Device) => void;
  onDisconnected?: () => void;
  onTelemetry?: (payload: string) => void;
  onError?: (message: string) => void;
};

class BleService {
  private manager: BleManager | null;
  private connectedDevice?: Device;
  private telemetrySubscription?: Subscription;

  constructor() {
    try {
      this.manager = new BleManager();
    } catch {
      // BleManager not available on web; set to null
      this.manager = null;
    }
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      if (Platform.Version >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      return false;
    }
  }

  async scanAndConnect(handlers?: BleEventHandlers): Promise<void> {
    if (!this.manager) {
      const message = "Bluetooth is only available on mobile devices (iOS/Android).";
      handlers?.onError?.(message);
      throw new Error(message);
    }

    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      const message = "Bluetooth and Location permissions are required to scan for AirDJ devices.";
      handlers?.onError?.(message);
      throw new Error(message);
    }

    return new Promise((resolve, reject) => {
      let done = false;

      this.manager!.startDeviceScan(null, null, async (error, scannedDevice) => {
        if (error) {
          handlers?.onError?.(error.message);
          if (!done) reject(error);
          done = true;
          return;
        }

        if (!scannedDevice) return;

        const name = scannedDevice.name || scannedDevice.localName || "";
        const uuidMatches = scannedDevice.serviceUUIDs?.some(
          (u) => u.toLowerCase() === AIR_DJ_SERVICE_UUID.toLowerCase()
        );
        const nameMatches = name.toLowerCase().includes("airdj") || name.toLowerCase().includes("esp32");

        if (!nameMatches && !uuidMatches) {
          return;
        }

        this.manager!.stopDeviceScan();

        try {
          const device = await scannedDevice.connect();
          await device.discoverAllServicesAndCharacteristics();
          this.connectedDevice = device;

          handlers?.onConnected?.(device);
          await this.subscribeTelemetry(handlers);

          if (!done) {
            resolve();
            done = true;
          }
        } catch (connectError) {
          const message =
            connectError instanceof Error
              ? connectError.message
              : "Failed to connect to AirDJ device.";
          handlers?.onError?.(message);
          if (!done) {
            reject(new Error(message));
            done = true;
          }
        }
      });

      setTimeout(() => {
        this.manager?.stopDeviceScan();
        if (!done) {
          const message = "Scan timeout: no AirDJ device found. Ensure ESP32 is powered on and GPS/Location is ON.";
          handlers?.onError?.(message);
          reject(new Error(message));
          done = true;
        }
      }, 15000);
    });
  }

  async disconnect(handlers?: BleEventHandlers): Promise<void> {
    this.telemetrySubscription?.remove();
    this.telemetrySubscription = undefined;

    if (this.connectedDevice) {
      await this.connectedDevice.cancelConnection();
      this.connectedDevice = undefined;
    }

    handlers?.onDisconnected?.();
  }

  isConnected(): boolean {
    return Boolean(this.connectedDevice);
  }

  async sendCommand(command: DeviceCommand): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error("No connected AirDJ device.");
    }

    const commandJson = JSON.stringify(command);
    const base64Value = Buffer.from(commandJson, "utf-8").toString("base64");

    await this.connectedDevice.writeCharacteristicWithResponseForService(
      AIR_DJ_SERVICE_UUID,
      AIR_DJ_COMMAND_CHAR_UUID,
      base64Value
    );
  }

  private async subscribeTelemetry(handlers?: BleEventHandlers): Promise<void> {
    if (!this.connectedDevice || !this.manager) {
      return;
    }

    this.telemetrySubscription = this.connectedDevice.monitorCharacteristicForService(
      AIR_DJ_SERVICE_UUID,
      AIR_DJ_TELEMETRY_CHAR_UUID,
      (error, characteristic) => {
        if (error) {
          handlers?.onError?.(error.message);
          return;
        }

        if (characteristic?.value) {
          const decoded = Buffer.from(characteristic.value, "base64").toString("utf-8");
          handlers?.onTelemetry?.(decoded);
        }
      }
    );
  }
}

export const bleService = new BleService();
