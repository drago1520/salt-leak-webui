### Main document

[Salt Leak Datasheet - V2.0.pdf](https://github.com/user-attachments/files/26500886/Salt.Leak.Datasheet.-.V2.0.pdf)

# Understanding the functional requirements
The device detects Salt Fuel leaks by measuring resistance. 6 pins for output. Each pin has 1 probe. Each probe has 2 OR 4 wires with 48V. If the device detects < 10kOhm (i.e. > ~5mA) => salt leak.
<img width="300" alt="Image" src="https://github.com/user-attachments/assets/ef4ae0a8-6d25-465d-a463-758f5f3cbd26" />
USB-C powers it.

### Inputs
USB power (max.) - 2.2W
USB current (max) - 440mA
Voltage across probes - 48V

Configurations:

- Verbose output for serial No & calibration
- Verbose output for the current box status
- Pulsed measurement mode - ON/ OFF & [pulseMeasurementDuration, waitDuration] **boost**. valueRangeForPulse mode = [0-10^5, 0-10^5].
<img width="300" alt="Image" src="https://github.com/user-attachments/assets/f86dd236-b2e0-4156-b392-21013d1c8983" />

### Outputs
Let's name the pin sensors 1-6, i.e. p1-p6.
Each line outputs [p1-p6 in Ohms, p1-p6 status code, boost voltage in V, Status code for the box (tell configurations & errors)]

| 12.4 | 13.1 | 11.9 | 2.3  | 14.2 | 15.0 | 0 | 0 | 0 | 1 | 0 | 0 | 48 | 0x00000001 |
|------|------|------|------|------|------|---|---|---|---|---|---|----|-------------|
| p1   | p2   | p3   | p4   | p5   | p6   | p1  | p2  | p3  | p4  | p5  | p6  | Boost | Box Status code |
| kOhm | kOhm | kOhm | kOhm | kOhm | kOhm | State | State | State | State | State | State | Volts | Hex |

Example. output line: 
```sh
12.4 13.1 11.9 2.3 14.2 15.0 0 0 0 1 0 0 48 0x00000001
```

**Pin sensor status codes (state):**
| Output value | Name           | Description                                      |
|--------------|----------------|--------------------------------------------------|
| 0            | NOMINAL        | No leak detected, resistance in nominal range   |
| 1            | LEAK           | Leak detected, resistance below leak threshold  |
| 2            | BROKEN         | Broken sensor                                  |
| 3            | NC OR BROKEN   | Not connected or broken sensor                 |
| 4            | BOOST ERROR    | Boost voltage out of range                     |
| 5            | INACTIVE       | No boost voltage applied                       |

**Box status code:**
32-bit in Hex.

Quick glance:
| Bits        | Meaning        |
|------------|----------------|
| 31–25      | System errors  |
| 24–3       | UNUSED         |
| 2–0        | Boost control  |


Full status codes:
| Bit range | Bit | Name                | Description                          |
|----------|-----|---------------------|--------------------------------------|
| 31       | 31  | Error bit           | General error flag                   |
| 30       | 30  | Over temperature    | Temperature too high                 |
| 29       | 29  | Under voltage       | Voltage too low                      |
| 28       | 28  | Over voltage        | Voltage too high                     |
| 27       | 27  | Over current        | Current too high                     |
| 26       | 26  | Version error       | Version mismatch/error               |
| 25       | 25  | USB error           | USB communication error              |
| 24–3     | —   | UNUSED              | Not defined                          |
| 2        | 2   | Boost error         | Boost voltage out of range           |
| 1        | 1   | Boost switch active | Alternating boost mode active        |
| 0        | 0   | Boost pin ON        | Boost voltage currently applied      |
