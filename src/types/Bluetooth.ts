export const AIR_DJ_SERVICE_UUID = "0000a100-0000-1000-8000-00805f9b34fb";
export const AIR_DJ_TELEMETRY_CHAR_UUID = "0000a101-0000-1000-8000-00805f9b34fb";
export const AIR_DJ_MIXER_CHAR_UUID = "0000a102-0000-1000-8000-00805f9b34fb";
export const AIR_DJ_PAD_CHAR_UUID = "0000a103-0000-1000-8000-00805f9b34fb";
export const AIR_DJ_COMMAND_CHAR_UUID = "0000a104-0000-1000-8000-00805f9b34fb";
export const AIR_DJ_ACK_CHAR_UUID = "0000a105-0000-1000-8000-00805f9b34fb";

export type CommandCode =
  | "set_bpm"
  | "select_track"
  | "set_led"
  | "set_crossfader"
  | "sync";

export interface DeviceCommand {
  id: string;
  cmd: CommandCode;
  param1?: number;
  param2?: number;
  sentAt: number;
}

export interface CommandAck {
  id: string;
  status: "ok" | "invalid" | "timeout" | "rejected";
  receivedAt: number;
}
