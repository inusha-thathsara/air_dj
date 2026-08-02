#include <FastLED.h>
#include <arduinoFFT.h>
#include <ArduinoBLE.h>

// --- Hardware Pins (PCB Fixed Assignments) ---
#define LED_PIN     2   // WS2812B Data Line (PCB Fixed)
#define BTN_MODE    13  // Push button: cycle 8 LED patterns
#define BTN_INTENSE 12  // Push button: cycle speed intensity
#define BTN_BRIGHT  14  // Push button: cycle matrix brightness
#define MIC_PIN     34  // MAX9814 Analog Mic Pin

// --- Matrix Specs ---
#define NUM_STRIPS  19
#define LED_PER_STRIP 30
#define NUM_LEDS    (NUM_STRIPS * LED_PER_STRIP)

CRGB leds[NUM_LEDS];
ArduinoFFT<float> FFT = ArduinoFFT<float>();

const uint16_t samples = 64; 
const double samplingFrequency = 10000; 
unsigned int sampling_period_us;

float vReal[samples];
float vImag[samples];

// 🎛️ Analog Mic Calibration 
float SENSITIVITY_GAIN = 1.5; 
int NOISE_GATE = 150;         

uint8_t currentMode = 0;
uint8_t intenseLevel = 2; 
uint8_t brightIdx = 2;    
uint8_t masterHue = 0;
unsigned long lastPress = 0;

int spreadMax[] = {15, 25, 30}; 
int speedDelay[] = {30, 15, 5}; 
uint8_t brightnessLevels[] = {120, 200, 255}; 

// Industry Standard Custom DJ Colors 
#define COLOR_CYBER_PINK  0xFF007F
#define COLOR_CYBER_CYAN  0x00FFFF
#define COLOR_UV_PURPLE   0x8A2BE2
#define COLOR_ACID_GREEN  0x39FF14
#define COLOR_GOLD_FLARE  0xFFD700

// ----- 📱 BLE Integration for Mobile App -----
#define SERVICE_UUID        "0000a100-0000-1000-8000-00805f9b34fb"
#define TELEMETRY_CHAR_UUID "0000a101-0000-1000-8000-00805f9b34fb"
#define MIXER_CHAR_UUID     "0000a102-0000-1000-8000-00805f9b34fb"
#define PAD_CHAR_UUID       "0000a103-0000-1000-8000-00805f9b34fb"
#define COMMAND_CHAR_UUID   "0000a104-0000-1000-8000-00805f9b34fb"
#define ACK_CHAR_UUID       "0000a105-0000-1000-8000-00805f9b34fb"

BLEService airDjService(SERVICE_UUID);
BLEStringCharacteristic telemetryChar(TELEMETRY_CHAR_UUID, BLERead | BLENotify, 256);
BLEStringCharacteristic mixerChar(MIXER_CHAR_UUID, BLEWrite, 128);
BLEStringCharacteristic padChar(PAD_CHAR_UUID, BLEWrite, 128);
BLEStringCharacteristic commandChar(COMMAND_CHAR_UUID, BLEWrite, 256);
BLEStringCharacteristic ackChar(ACK_CHAR_UUID, BLERead | BLENotify, 128);

bool deviceConnected = false;
unsigned long lastTelemetryMs = 0;
String activeLedColorHex = "#FF007F";

// Zig-Zag Mapping Engine
int getIndex(int col, int row) {
  if (row < 0 || row >= LED_PER_STRIP || col < 0 || col >= NUM_STRIPS) return 0;
  if (col % 2 == 0) return (col * LED_PER_STRIP) + row;
  else return (col * LED_PER_STRIP) + (LED_PER_STRIP - 1 - row);
}

// Mobile App BLE Communication Handler
void updateBLE() {
  BLEDevice central = BLE.central();

  if (central) {
    if (central.connected()) {
      if (!deviceConnected) {
        deviceConnected = true;
        Serial.print("[BLE] App Connected: ");
        Serial.println(central.address());
      }

      // 1. Process Incoming Commands from Mobile App
      if (commandChar.written()) {
        String val = commandChar.value();
        Serial.print("[BLE CMD] ");
        Serial.println(val);

        // Parse command type
        int cmdIdx = val.indexOf("\"cmd\":\"");
        String cmd = "";
        if (cmdIdx != -1) {
          int start = cmdIdx + 7;
          int end = val.indexOf("\"", start);
          if (end != -1) cmd = val.substring(start, end);
        }

        // Parse param1
        int param1 = 0;
        int pIdx = val.indexOf("\"param1\":");
        if (pIdx != -1) {
          param1 = val.substring(pIdx + 9).toInt();
        }

        // Parse command ID for ACK
        String cmdId = "";
        int idIdx = val.indexOf("\"id\":\"");
        if (idIdx != -1) {
          int start = idIdx + 6;
          int end = val.indexOf("\"", start);
          if (end != -1) cmdId = val.substring(start, end);
        }

        // Execute command
        if (cmd == "select_track" || cmd == "set_mode") {
          currentMode = (param1) % 8; // Switch mode directly from app
        } else if (cmd == "set_crossfader") {
          uint8_t mappedBright = map(constrain(param1, 0, 100), 0, 100, 50, 255);
          FastLED.setBrightness(mappedBright);
        } else if (cmd == "set_led") {
          char cBuf[8];
          snprintf(cBuf, sizeof(cBuf), "#%06X", param1 & 0xFFFFFF);
          activeLedColorHex = String(cBuf);
        }

        // Send ACK back to mobile app
        char ackBuf[128];
        snprintf(ackBuf, sizeof(ackBuf), "{\"id\":\"%s\",\"status\":\"ok\",\"receivedAt\":%lu}", cmdId.c_str(), millis());
        ackChar.writeValue(ackBuf);
      }

      // 2. Transmit Telemetry (5 Hz) to Mobile App
      unsigned long now = millis();
      if (now - lastTelemetryMs >= 200) {
        int vol = constrain(map((int)vReal[2], 0, 4000, 0, 100), 0, 100);
        char telemBuf[256];
        snprintf(telemBuf, sizeof(telemBuf),
          "{\"timestamp\":%lu,\"bpm\":120,\"beatPhase\":0.0,\"ledColor\":\"%s\",\"masterVolume\":%d,\"padHits\":[]}",
          now, activeLedColorHex.c_str(), vol
        );
        telemetryChar.writeValue(telemBuf);
        lastTelemetryMs = now;
      }
    } else if (deviceConnected) {
      deviceConnected = false;
      Serial.println("[BLE] App Disconnected");
    }
  }
}

void setup() {
  // 1. Force GPIO 2 LOW immediately on boot to prevent ROM bootloader latching
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.begin(115200);
  delay(300); // 300ms boot stabilization delay for PCB power rails
  Serial.println("\n[BOOT] AirDJ ESP32 PCB Starting...");

  // WS2812B Setup
  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS).setCorrection(TypicalSMD5050);
  FastLED.setBrightness(brightnessLevels[brightIdx]); 
  FastLED.clear(true);
  
  pinMode(BTN_MODE, INPUT_PULLUP);
  pinMode(BTN_INTENSE, INPUT_PULLUP);
  pinMode(BTN_BRIGHT, INPUT_PULLUP);
  pinMode(MIC_PIN, INPUT);

  sampling_period_us = round(1000000.0 * (1.0 / samplingFrequency));

  // Initialize BLE Server for Mobile App
  if (BLE.begin()) {
    BLE.setLocalName("AirDJ-ESP32");
    BLE.setDeviceName("AirDJ-ESP32");
    BLE.setAdvertisedService(airDjService);

    airDjService.addCharacteristic(telemetryChar);
    airDjService.addCharacteristic(mixerChar);
    airDjService.addCharacteristic(padChar);
    airDjService.addCharacteristic(commandChar);
    airDjService.addCharacteristic(ackChar);

    BLE.addService(airDjService);
    BLE.advertise();
    Serial.println("[BLE] Ready! Advertising as 'AirDJ-ESP32'");
  } else {
    Serial.println("[BLE WARNING] Bluetooth failed to start; running in Standalone Mode.");
  }
}

void loop() {
  updateBLE(); // BLE background handling
  handleButtons();
  runAnalogFFT();
  EVERY_N_MILLISECONDS(20) { masterHue++; }

  // Startup Logo (Shows for 5 seconds)
  if (millis() < 5000) {
    drawDJ_NightClubLogo(); 
  } else {
    switch (currentMode) {
      case 0: effectCyberpunkVU(); break;
      case 1: effectAcidDrop(); break;
      case 2: effectUVBassRipple(); break;
      case 3: effectEDMPlasma(); break;
      case 4: effectTomorrowlandStrobe(); break;
      case 5: effectNeonExplosion(); break;
      case 6: effectMegaColumns(); break;  
      case 7: effectSoundHearts(); break;  
    }
  }
  
  FastLED.show();
  delay(speedDelay[intenseLevel]);
}

void drawDJ_NightClubLogo() {
  fadeToBlackBy(leds, NUM_LEDS, 60); 
  for(int r=8; r<22; r++) { leds[getIndex(4, r)] = COLOR_CYBER_PINK; }
  leds[getIndex(5, 8)]  = leds[getIndex(5, 21)] = COLOR_CYBER_PINK;
  leds[getIndex(6, 8)]  = leds[getIndex(6, 21)] = COLOR_CYBER_PINK;
  leds[getIndex(7, 10)] = leds[getIndex(7, 19)] = COLOR_CYBER_PINK;
  
  for(int r=10; r<22; r++) { leds[getIndex(13, r)] = COLOR_CYBER_CYAN; }
  leds[getIndex(12, 8)] = leds[getIndex(11, 9)]  = COLOR_CYBER_CYAN;
  leds[getIndex(14, 21)] = leds[getIndex(14, 20)] = COLOR_CYBER_CYAN;
}

void runAnalogFFT() {
  int32_t sum = 0;
  int rawSamples[samples];
  unsigned long microseconds;

  // Audio Sampling
  for (int i = 0; i < samples; i++) {
    microseconds = micros();
    rawSamples[i] = analogRead(MIC_PIN);
    sum += rawSamples[i];
    while (micros() - microseconds < sampling_period_us) {}
  }

  // DC Offset Removal
  int mean = sum / samples;
  for (int i = 0; i < samples; i++) {
    vReal[i] = abs((float)(rawSamples[i] - mean) * SENSITIVITY_GAIN);
    vImag[i] = 0;
  }
  
  // Compute FFT
  FFT.windowing(vReal, samples, FFT_WIN_TYP_HAMMING, FFT_FORWARD);
  FFT.compute(vReal, vImag, samples, FFT_FORWARD);
  FFT.complexToMagnitude(vReal, vImag, samples);

  // Apply Noise Gate
  for(int i=0; i<samples; i++) {
     if(vReal[i] < NOISE_GATE) vReal[i] = 0; 
  }
}

// ---------------------------------------------------------
// 🎛️ EFFECTS LIBRARY
// ---------------------------------------------------------

void effectCyberpunkVU() {
  fadeToBlackBy(leds, NUM_LEDS, 80); 
  for (int col = 0; col < NUM_STRIPS; col++) {
    int h = map(vReal[(col % 8) + 2], 0, 3000, 0, spreadMax[intenseLevel]);
    h = constrain(h, 0, LED_PER_STRIP);
    for (int row = 0; row < h; row++) {
        if(row < 12) leds[getIndex(col, row)] = COLOR_UV_PURPLE;
        else if(row < 22) leds[getIndex(col, row)] = COLOR_CYBER_PINK;
        else leds[getIndex(col, row)] = COLOR_CYBER_CYAN;
    }
  }
}

void effectAcidDrop() {
  fadeToBlackBy(leds, NUM_LEDS, 60); 
  for (int col = 0; col < NUM_STRIPS; col++) {
    int h = map(vReal[(col % 8) + 3], 0, 2500, 0, spreadMax[intenseLevel]);
    h = constrain(h, 0, LED_PER_STRIP);
    for (int row = 0; row < h; row++) {
      if(row > h - 3) leds[getIndex(col, (LED_PER_STRIP - 1) - row)] = CRGB::White; 
      else leds[getIndex(col, (LED_PER_STRIP - 1) - row)] = COLOR_ACID_GREEN;
    }
  }
}

void effectUVBassRipple() {
  fadeToBlackBy(leds, NUM_LEDS, 100);
  int mid = LED_PER_STRIP / 2;
  for (int col = 0; col < NUM_STRIPS; col++) {
    int h = map(vReal[(col % 8) + 2], 0, 3500, 0, spreadMax[intenseLevel] / 2);
    h = constrain(h, 0, mid);
    for (int i = 0; i < h; i++) {
      CRGB rippleColor = (i > h - 2) ? (CRGB)COLOR_GOLD_FLARE : (CRGB)COLOR_UV_PURPLE;
      leds[getIndex(col, mid + i)] = rippleColor;
      leds[getIndex(col, mid - i)] = rippleColor;
    }
  }
}

void effectEDMPlasma() {
  int totalEnergy = vReal[2] + vReal[3] + vReal[4];
  uint8_t plasmaSpeed = map(totalEnergy, 0, 8000, 1, 20); 
  
  for(int x=0; x<NUM_STRIPS; x++) {
    for(int y=0; y<LED_PER_STRIP; y++) {
      uint8_t noiseIndex = inoise8(x * 30, y * 30, millis() * plasmaSpeed / 10);
      uint8_t hue = noiseIndex + masterHue;
      leds[getIndex(x,y)] = CHSV(hue, 255, 255);
    }
  }
  fadeToBlackBy(leds, NUM_LEDS, map(totalEnergy, 0, 8000, 200, 50));
}

void effectTomorrowlandStrobe() {
  fadeToBlackBy(leds, NUM_LEDS, 120); 
  int treble = vReal[10] + vReal[12]; 
  if(treble > 1500) {
    for(int i = 0; i < NUM_LEDS; i++) {
      if(random8(10) > 7) leds[i] = CRGB::White; 
    }
  }
}

void effectNeonExplosion() {
  fadeToBlackBy(leds, NUM_LEDS, 90);
  int bass = vReal[2];
  if(bass > 3000) {
    int centerX = random8(NUM_STRIPS);
    int centerY = random8(LED_PER_STRIP);
    CRGB randNeon = CHSV(random8(255), 255, 255); 
    
    leds[getIndex(centerX, centerY)] = CRGB::White; 
    if(centerY + 1 < LED_PER_STRIP) leds[getIndex(centerX, centerY + 1)] = randNeon;
    if(centerY - 1 >= 0) leds[getIndex(centerX - 1, centerY)] = randNeon;
    if(centerX + 1 < NUM_STRIPS) leds[getIndex(centerX + 1, centerY)] = randNeon;
    if(centerX - 1 >= 0) leds[getIndex(centerX - 1, centerY)] = randNeon;
  }
}

void effectMegaColumns() {
  fadeToBlackBy(leds, NUM_LEDS, 90); 
  int startStrips[] = {2, 5, 8, 11, 14}; 
  int bins[] = {2, 4, 6, 8, 11}; 
  CRGB columnColors[] = {COLOR_CYBER_PINK, COLOR_UV_PURPLE, COLOR_CYBER_CYAN, COLOR_ACID_GREEN, COLOR_GOLD_FLARE};

  for (int c = 0; c < 5; c++) {
    int h = map(vReal[bins[c]], 0, 3000, 0, spreadMax[intenseLevel]);
    h = constrain(h, 0, LED_PER_STRIP);
    for (int s = 0; s < 3; s++) {
      int stripIndex = startStrips[c] + s;
      for (int row = 0; row < h; row++) {
        leds[getIndex(stripIndex, row)] = columnColors[c];
      }
    }
  }
}

void effectSoundHearts() {
  fadeToBlackBy(leds, NUM_LEDS, 50); 
  
  static float radii[4] = {0, 0, 0, 0}; 
  static unsigned long lastBeat = 0;
  
  int bassVal = vReal[2] + vReal[3]; 
  
  if (bassVal > 2500 && millis() - lastBeat > 400) {
    for (int i = 0; i < 4; i++) {
      if (radii[i] == 0) {
        radii[i] = 1.0; 
        lastBeat = millis();
        break;
      }
    }
  }
  
  int cx = 9;  
  int cy = 15; 
  
  for (int i = 0; i < 4; i++) {
    if (radii[i] > 0) {
      int r = (int)radii[i];
      for (int col = 0; col < NUM_STRIPS; col++) {
        for (int row = 0; row < LED_PER_STRIP; row++) {
          int dx = col - cx;
          int dy = row - cy;
          bool drawPixel = false;
          
          if (dy >= 0) { 
            if (abs(abs(dx) - r/2) + dy == r) drawPixel = true;
          } else {       
            if (abs(dx) - dy == r) drawPixel = true;
          }
          
          if (drawPixel) {
            if (r < 4) {
              leds[getIndex(col, row)] = CRGB(255, 100, 100); 
            } else {
              leds[getIndex(col, row)] = CRGB(255, 0, 0);     
            }
          }
        }
      }
      
      float speed = (intenseLevel == 2) ? 1.0 : ((intenseLevel == 1) ? 0.7 : 0.4);
      radii[i] += speed; 
      
      if (radii[i] > 20) radii[i] = 0;
    }
  }
}

void handleButtons() {
  if (millis() - lastPress < 300) return; // Debounce
  
  if (digitalRead(BTN_MODE) == LOW) { 
    currentMode = (currentMode + 1) % 8; // Modes 8ක් පාලනය
    lastPress = millis(); 
  }
  
  if (digitalRead(BTN_INTENSE) == LOW) { 
    intenseLevel = (intenseLevel + 1) % 3; 
    lastPress = millis(); 
  }
  
  if (digitalRead(BTN_BRIGHT) == LOW) { 
    brightIdx = (brightIdx + 1) % 3; 
    FastLED.setBrightness(brightnessLevels[brightIdx]); 
    lastPress = millis(); 
  }
}