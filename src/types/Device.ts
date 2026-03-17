export interface MixerState {
  crossfader: number;
  masterVolume: number;
  eqLow: number;
  eqMid: number;
  eqHigh: number;
}

export interface DeviceState {
  connected: boolean;
  deviceId?: string;
  deviceName?: string;
  firmwareVersion?: string;
  rssi?: number;
  lastSync?: number;
  mixer: MixerState;
}
