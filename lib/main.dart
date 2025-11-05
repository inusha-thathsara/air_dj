import 'package:flutter/material.dart';

void main() {
  runApp(const AirDJApp());
}

class AirDJApp extends StatelessWidget {
  const AirDJApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AirDJ Control Surface',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blueAccent),
        useMaterial3: true,
      ),
      home: const AirDJDashboard(),
    );
  }
}

class AirDJDashboard extends StatefulWidget {
  const AirDJDashboard({super.key});

  @override
  State<AirDJDashboard> createState() => _AirDJDashboardState();
}

class _AirDJDashboardState extends State<AirDJDashboard> {
  bool gloveConnected = true;
  bool mixerConnected = true;
  bool bluetoothEnabled = true;
  bool wifiEnabled = true;
  bool ledBeatSync = true;
  String selectedWifiNetwork = 'AirDJ_Studio';
  String selectedLedMode = 'VU Bars';
  double ledBrightness = 0.75;
  double packetDropRate = 0.0;
  String selectedContinuousInput = 'hand_pitch';
  String selectedContinuousCc = 'CC #10 (Pan)';
  String continuousResponseCurve = 'linear';
  String selectedDiscreteInput = 'index_curl';
  double discreteThreshold = 0.8;
  bool discreteNoteOn = true;

  final List<String> wifiNetworks = <String>[
    'AirDJ_Studio',
    'Stage_Left',
    'Rehearsal_WiFi',
  ];

  final List<int> packetLog = List<int>.generate(
    40,
    (int index) => 3200 + index,
  );

  final Map<String, double> fingerCurls = <String, double>{
    'Thumb': 0.21,
    'Index': 0.84,
    'Middle': 0.62,
    'Ring': 0.45,
    'Pinky': 0.30,
  };

  final Map<String, double> handAngles = <String, double>{
    'Pitch': 12.0,
    'Roll': -4.0,
    'Yaw': 27.0,
  };

  final List<MidiMapping> midiMappings = <MidiMapping>[
    const MidiMapping(
      inputSource: 'hand_roll',
      gestureDescription: 'Continuous wrist rotation',
      midiType: 'Control Change',
      midiDetails: 'CC #01 • Filter Cutoff',
    ),
    const MidiMapping(
      inputSource: 'index_curl',
      gestureDescription: 'Curl > 0.8 triggers sample',
      midiType: 'Note On/Off',
      midiDetails: 'Note C4 • Sample Trigger',
    ),
    const MidiMapping(
      inputSource: 'rotary_encoder',
      gestureDescription: 'Jog wheel scrub',
      midiType: 'Control Change',
      midiDetails: 'CC #23 • Track Position',
    ),
  ];

  final Map<String, double> mixerFeedback = <String, double>{
    'Potentiometer 1': 0.72,
    'Potentiometer 2': 0.38,
    'Potentiometer 3': 0.60,
    'Jog Wheel (fine)': 0.45,
  };

  final List<String> ledModes = <String>[
    'VU Bars',
    'Color Pulse',
    'Beat Strobe',
    'Spectrum Sweep',
  ];

  final List<String> sampleLibrary = <String>[
    'Kick_Punchy.wav',
    'Snare_Clap.wav',
    'Vocal_Chop_C4.wav',
    'Riser_FX_Long.wav',
  ];

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('AirDJ System Console'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: <Widget>[
              Tab(text: 'Status'),
              Tab(text: 'Calibration'),
              Tab(text: 'Gesture Mapping'),
              Tab(text: 'Mixer & Aux'),
            ],
          ),
        ),
        body: TabBarView(
          children: <Widget>[
            _buildStatusTab(context),
            _buildCalibrationTab(context),
            _buildMappingTab(context),
            _buildAuxiliaryTab(context),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusTab(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Wrap(
            runSpacing: 16.0,
            spacing: 16.0,
            children: <Widget>[
              _buildConnectionCard(
                context,
                title: 'Glove Controller',
                subtitle: 'Wireless glove interface',
                isConnected: gloveConnected,
                icon: Icons.back_hand,
                onToggle: (bool value) {
                  setState(() => gloveConnected = value);
                },
              ),
              _buildConnectionCard(
                context,
                title: 'Main Mixer/Base Station',
                subtitle: 'Processing hub and audio routing',
                isConnected: mixerConnected,
                icon: Icons.surround_sound,
                onToggle: (bool value) {
                  setState(() => mixerConnected = value);
                },
              ),
            ],
          ),
          const SizedBox(height: 24.0),
          Wrap(
            spacing: 16.0,
            runSpacing: 16.0,
            children: <Widget>[
              _buildBluetoothCard(context),
              _buildWifiCard(context),
            ],
          ),
          const SizedBox(height: 24.0),
          _buildPacketMonitor(context),
        ],
      ),
    );
  }

  Widget _buildCalibrationTab(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Wrap(
            spacing: 16.0,
            runSpacing: 16.0,
            children: <Widget>[
              _buildCalibrationCard(
                context,
                title: 'Flex Sensor Calibration',
                description:
                    'Guide the performer through open-hand and tight fist positions to capture min/max values for normalized control.',
                steps: const <String>[
                  'Hold hand flat with fingers fully extended.',
                  'Tap "Record Open Hand" to capture minimum values.',
                  'Make a tight fist and hold for three seconds.',
                  'Tap "Record Closed Fist" to capture peak values.',
                ],
                primaryActionLabel: 'Record Open Hand',
                secondaryActionLabel: 'Record Closed Fist',
              ),
              _buildCalibrationCard(
                context,
                title: 'IMU Calibration',
                description:
                    'Stabilize the glove to extract gyro and accelerometer offsets for accurate pitch, roll, and yaw readings.',
                steps: const <String>[
                  'Place glove on a flat, stationary surface.',
                  'Ensure no vibrations reach the table.',
                  'Tap "Start IMU Calibration" and wait five seconds.',
                  'Confirm zero-motion drift is within tolerance.',
                ],
                primaryActionLabel: 'Start IMU Calibration',
              ),
            ],
          ),
          const SizedBox(height: 24.0),
          _buildSensorVisualization(context),
        ],
      ),
    );
  }

  Widget _buildMappingTab(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          _buildMappingMatrix(context),
          const SizedBox(height: 24.0),
          Wrap(
            spacing: 16.0,
            runSpacing: 16.0,
            children: <Widget>[
              _buildContinuousControlCard(context),
              _buildDiscreteControlCard(context),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAuxiliaryTab(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Wrap(
            spacing: 16.0,
            runSpacing: 16.0,
            children: <Widget>[
              _buildLedControlCard(context),
              _buildMixerFeedbackCard(context),
            ],
          ),
          const SizedBox(height: 24.0),
          _buildSampleManager(context),
        ],
      ),
    );
  }

  Widget _buildConnectionCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required bool isConnected,
    required IconData icon,
    required ValueChanged<bool> onToggle,
  }) {
    final ColorScheme colorScheme = Theme.of(context).colorScheme;
    return SizedBox(
      width: 312.0,
      child: Card(
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                children: <Widget>[
                  CircleAvatar(
                    backgroundColor: isConnected
                        ? colorScheme.primaryContainer
                        : colorScheme.surfaceVariant,
                    foregroundColor: isConnected
                        ? colorScheme.onPrimaryContainer
                        : colorScheme.onSurfaceVariant,
                    child: Icon(icon),
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          title,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        Text(
                          subtitle,
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(color: colorScheme.onSurfaceVariant),
                        ),
                      ],
                    ),
                  ),
                  Switch(value: isConnected, onChanged: onToggle),
                ],
              ),
              const SizedBox(height: 12.0),
              Chip(
                avatar: Icon(
                  isConnected ? Icons.cloud_done : Icons.cloud_off,
                  size: 18,
                ),
                label: Text(isConnected ? 'Connected' : 'Disconnected'),
                backgroundColor: isConnected
                    ? colorScheme.primaryContainer.withOpacity(0.6)
                    : colorScheme.surfaceVariant,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBluetoothCard(BuildContext context) {
    return SizedBox(
      width: 312.0,
      child: Card(
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                children: <Widget>[
                  const Icon(Icons.bluetooth, size: 20.0),
                  const SizedBox(width: 8.0),
                  Text(
                    'Bluetooth A2DP & App Control',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ],
              ),
              const SizedBox(height: 12.0),
              Text(
                'Manage Bluetooth pairing for external audio sources and remote control.',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 16.0),
              Row(
                children: <Widget>[
                  Switch(
                    value: bluetoothEnabled,
                    onChanged: (bool value) {
                      setState(() => bluetoothEnabled = value);
                    },
                  ),
                  const SizedBox(width: 8.0),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: bluetoothEnabled ? () {} : null,
                      icon: const Icon(Icons.search),
                      label: const Text('Scan for Devices'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12.0),
              FilledButton.tonalIcon(
                onPressed: bluetoothEnabled ? () {} : null,
                icon: const Icon(Icons.link),
                label: const Text('Pair New Device'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWifiCard(BuildContext context) {
    return SizedBox(
      width: 312.0,
      child: Card(
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                children: <Widget>[
                  const Icon(Icons.wifi, size: 20.0),
                  const SizedBox(width: 8.0),
                  Text(
                    'Wi-Fi Network Configuration',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ],
              ),
              const SizedBox(height: 12.0),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: wifiEnabled,
                title: const Text('Enable Wi-Fi Connectivity'),
                onChanged: (bool value) {
                  setState(() => wifiEnabled = value);
                },
              ),
              if (wifiEnabled)
                DropdownButtonFormField<String>(
                  value: selectedWifiNetwork,
                  decoration: const InputDecoration(
                    labelText: 'Active Network',
                  ),
                  onChanged: (String? value) {
                    if (value == null) return;
                    setState(() => selectedWifiNetwork = value);
                  },
                  items: wifiNetworks
                      .map(
                        (String network) => DropdownMenuItem<String>(
                          value: network,
                          child: Text(network),
                        ),
                      )
                      .toList(),
                ),
              if (wifiEnabled) const SizedBox(height: 12.0),
              if (wifiEnabled)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    const Text('Signal Quality'),
                    Text('${(1 - packetDropRate) * 100 ~/ 1}%'),
                  ],
                ),
              if (wifiEnabled) const SizedBox(height: 6.0),
              if (wifiEnabled)
                LinearProgressIndicator(value: 1 - packetDropRate),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPacketMonitor(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                const Icon(Icons.bug_report, size: 20.0),
                const SizedBox(width: 8.0),
                Text(
                  'Data Flow Monitor',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
            const SizedBox(height: 8.0),
            Text(
              'Track sequential packet IDs to verify wireless link integrity.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16.0),
            SizedBox(
              height: 160.0,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceVariant,
                  borderRadius: BorderRadius.circular(12.0),
                ),
                child: ListView.separated(
                  padding: const EdgeInsets.all(12.0),
                  itemCount: packetLog.length,
                  separatorBuilder: (_, __) => const Divider(height: 12.0),
                  itemBuilder: (BuildContext context, int index) {
                    final int packetId = packetLog[index];
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: <Widget>[
                        Text('packet_id: $packetId'),
                        Text(
                          'Δ ${(index == 0) ? '-' : packetLog[index] - packetLog[index - 1]}',
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCalibrationCard(
    BuildContext context, {
    required String title,
    required String description,
    required List<String> steps,
    required String primaryActionLabel,
    String? secondaryActionLabel,
  }) {
    return SizedBox(
      width: 312.0,
      child: Card(
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(title, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8.0),
              Text(
                description,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 12.0),
              ...steps.map(
                (String step) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const Text('• '),
                      Expanded(child: Text(step)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16.0),
              FilledButton(onPressed: () {}, child: Text(primaryActionLabel)),
              if (secondaryActionLabel != null) const SizedBox(height: 8.0),
              if (secondaryActionLabel != null)
                OutlinedButton(
                  onPressed: () {},
                  child: Text(secondaryActionLabel),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSensorVisualization(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                const Icon(Icons.sensors, size: 20.0),
                const SizedBox(width: 8.0),
                Text(
                  'Real-Time Sensor Visualization',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
            const SizedBox(height: 8.0),
            Text(
              'Normalized finger curl (0.0 - 1.0) and fused orientation angles.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16.0),
            Wrap(
              spacing: 16.0,
              runSpacing: 16.0,
              children: fingerCurls.entries.map((
                MapEntry<String, double> entry,
              ) {
                return SizedBox(
                  width: 240.0,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: <Widget>[
                          Text('${entry.key} Curl'),
                          Text(entry.value.toStringAsFixed(2)),
                        ],
                      ),
                      const SizedBox(height: 4.0),
                      LinearProgressIndicator(value: entry.value),
                    ],
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24.0),
            Row(
              children: <Widget>[
                const Icon(Icons.threed_rotation, size: 20.0),
                const SizedBox(width: 8.0),
                Text(
                  'Hand Orientation',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
            const SizedBox(height: 12.0),
            Wrap(
              spacing: 16.0,
              runSpacing: 12.0,
              children: handAngles.entries.map((
                MapEntry<String, double> entry,
              ) {
                return Chip(
                  label: Text(
                    '${entry.key}: ${entry.value.toStringAsFixed(1)}°',
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMappingMatrix(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                const Icon(Icons.grid_view, size: 20.0),
                const SizedBox(width: 8.0),
                Text(
                  'Gesture-to-MIDI Mapping Matrix',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const Spacer(),
                FilledButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.add),
                  label: const Text('New Mapping'),
                ),
              ],
            ),
            const SizedBox(height: 12.0),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columns: const <DataColumn>[
                  DataColumn(label: Text('Input Source')),
                  DataColumn(label: Text('Action / Gesture')),
                  DataColumn(label: Text('MIDI Type')),
                  DataColumn(label: Text('MIDI Message')),
                ],
                rows: midiMappings
                    .map(
                      (MidiMapping mapping) => DataRow(
                        cells: <DataCell>[
                          DataCell(Text(mapping.inputSource)),
                          DataCell(Text(mapping.gestureDescription)),
                          DataCell(Text(mapping.midiType)),
                          DataCell(Text(mapping.midiDetails)),
                        ],
                      ),
                    )
                    .toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContinuousControlCard(BuildContext context) {
    final List<String> inputs = <String>[
      'hand_pitch',
      'hand_roll',
      'hand_yaw',
      'potentiometer_1',
    ];
    final List<String> ccNumbers = <String>[
      'CC #01 (Modulation)',
      'CC #07 (Volume)',
      'CC #10 (Pan)',
      'CC #74 (Filter Cutoff)',
    ];

    return SizedBox(
      width: 312.0,
      child: Card(
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                'Continuous Control Mapping',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 12.0),
              DropdownButtonFormField<String>(
                value: selectedContinuousInput,
                decoration: const InputDecoration(labelText: 'Input Source'),
                items: inputs
                    .map(
                      (String value) => DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      ),
                    )
                    .toList(),
                onChanged: (String? newValue) {
                  if (newValue == null) return;
                  setState(() => selectedContinuousInput = newValue);
                },
              ),
              const SizedBox(height: 12.0),
              DropdownButtonFormField<String>(
                value: selectedContinuousCc,
                decoration: const InputDecoration(
                  labelText: 'MIDI CC Destination',
                ),
                items: ccNumbers
                    .map(
                      (String value) => DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      ),
                    )
                    .toList(),
                onChanged: (String? newValue) {
                  if (newValue == null) return;
                  setState(() => selectedContinuousCc = newValue);
                },
              ),
              const SizedBox(height: 12.0),
              const Text('Response Curve'),
              const SizedBox(height: 8.0),
              SegmentedButton<String>(
                segments: const <ButtonSegment<String>>[
                  ButtonSegment<String>(value: 'linear', label: Text('Linear')),
                  ButtonSegment<String>(value: 'log', label: Text('Log')),
                  ButtonSegment<String>(value: 'custom', label: Text('Custom')),
                ],
                selected: <String>{continuousResponseCurve},
                onSelectionChanged: (Set<String> selection) {
                  if (selection.isEmpty) return;
                  setState(() => continuousResponseCurve = selection.first);
                },
              ),
              const SizedBox(height: 16.0),
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.save),
                label: const Text('Store Continuous Mapping'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDiscreteControlCard(BuildContext context) {
    final List<String> discreteInputs = <String>[
      'thumb_curl',
      'index_curl',
      'middle_curl',
      'gesture_double_tap',
    ];

    return SizedBox(
      width: 312.0,
      child: Card(
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                'Discrete Trigger Mapping',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 12.0),
              DropdownButtonFormField<String>(
                value: selectedDiscreteInput,
                decoration: const InputDecoration(labelText: 'Input Source'),
                items: discreteInputs
                    .map(
                      (String value) => DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      ),
                    )
                    .toList(),
                onChanged: (String? newValue) {
                  if (newValue == null) return;
                  setState(() => selectedDiscreteInput = newValue);
                },
              ),
              const SizedBox(height: 12.0),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  const Text('Threshold'),
                  Text(discreteThreshold.toStringAsFixed(2)),
                ],
              ),
              Slider(
                value: discreteThreshold,
                min: 0.0,
                max: 1.0,
                onChanged: (double value) {
                  setState(() => discreteThreshold = value);
                },
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Toggle Between Note On / Note Off'),
                value: discreteNoteOn,
                onChanged: (bool value) {
                  setState(() => discreteNoteOn = value);
                },
              ),
              TextField(
                decoration: const InputDecoration(
                  labelText: 'MIDI Note (e.g., C4)',
                ),
              ),
              const SizedBox(height: 12.0),
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.save_alt),
                label: const Text('Store Trigger'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLedControlCard(BuildContext context) {
    return SizedBox(
      width: 312.0,
      child: Card(
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                'WS2812B LED Visualizer',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 12.0),
              DropdownButtonFormField<String>(
                value: selectedLedMode,
                decoration: const InputDecoration(
                  labelText: 'Visualization Mode',
                ),
                items: ledModes
                    .map(
                      (String mode) => DropdownMenuItem<String>(
                        value: mode,
                        child: Text(mode),
                      ),
                    )
                    .toList(),
                onChanged: (String? value) {
                  if (value == null) return;
                  setState(() => selectedLedMode = value);
                },
              ),
              const SizedBox(height: 12.0),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  const Text('Brightness'),
                  Text('${(ledBrightness * 100).round()}%'),
                ],
              ),
              Slider(
                value: ledBrightness,
                onChanged: (double value) {
                  setState(() => ledBrightness = value);
                },
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Synchronize with Beat Grid'),
                value: ledBeatSync,
                onChanged: (bool value) {
                  setState(() => ledBeatSync = value);
                },
              ),
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.file_upload),
                label: const Text('Upload Custom Pattern'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMixerFeedbackCard(BuildContext context) {
    return SizedBox(
      width: 480.0,
      child: Card(
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                children: <Widget>[
                  const Icon(Icons.equalizer, size: 20.0),
                  const SizedBox(width: 8.0),
                  Text(
                    'Physical Mixer Feedback',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ],
              ),
              const SizedBox(height: 12.0),
              Text(
                'Live view of potentiometer positions and jog wheel state.',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 16.0),
              ...mixerFeedback.entries.map((MapEntry<String, double> entry) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: <Widget>[
                          Text(entry.key),
                          Text('${(entry.value * 100).round()}%'),
                        ],
                      ),
                      const SizedBox(height: 4.0),
                      LinearProgressIndicator(value: entry.value),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSampleManager(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                const Icon(Icons.library_music, size: 20.0),
                const SizedBox(width: 8.0),
                Text(
                  'Sample Library & SD Assignment',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
            const SizedBox(height: 12.0),
            Text(
              'Browse SD storage and assign clips to Note On/Off triggers.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16.0),
            ...sampleLibrary.map((String sample) {
              return ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(sample),
                subtitle: const Text('Tap to assign destination'),
                trailing: IconButton(
                  icon: const Icon(Icons.play_arrow),
                  onPressed: () {},
                ),
                onTap: () {},
              );
            }),
            const SizedBox(height: 12.0),
            FilledButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.upload_file),
              label: const Text('Import Samples'),
            ),
          ],
        ),
      ),
    );
  }
}

class MidiMapping {
  const MidiMapping({
    required this.inputSource,
    required this.gestureDescription,
    required this.midiType,
    required this.midiDetails,
  });

  final String inputSource;
  final String gestureDescription;
  final String midiType;
  final String midiDetails;
}
