# Raw Line Examples

Each `rawLine` uses this field order:

`p1 p2 p3 p4 p5 p6 p1_state p2_state p3_state p4_state p5_state p6_state boost_voltage box_status`

| Raw Output | Problems |
|---|---|
| `12.4 13.1 11.9 12.8 14.2 15.0 0 0 0 0 0 0 48 0x00000001` | none |
| `10.2 10.8 11.4 12.1 10.0 10.6 0 0 0 0 0 0 48 0x00000001` | none, lower-end nominal resistances |
| `18.7 17.9 19.2 16.8 18.1 17.4 0 0 0 0 0 0 48 0x00000001` | none, higher-end nominal resistances |
| `12.4 13.1 11.9 2.3 14.2 15.0 0 0 0 1 0 0 48 0x00000001` | p4 leak |
| `2.1 13.1 11.9 2.3 14.2 15.0 1 0 0 1 0 0 48 0x00000001` | p1 leak, p4 leak |
| `12.4 0.0 11.9 12.8 14.2 15.0 0 2 0 0 0 0 48 0x00000001` | p2 broken |
| `12.4 13.1 999.9 12.8 14.2 15.0 0 0 3 0 0 0 48 0x00000001` | p3 nc or broken |
| `12.4 13.1 11.9 12.8 14.2 15.0 0 0 0 0 4 0 36 0x00000005` | p5 boost error, box boost error |
| `12.4 13.1 11.9 12.8 14.2 15.0 0 0 0 0 0 5 0 0x00000000` | p6 inactive, boost off |
| `12.4 13.1 11.9 12.8 14.2 15.0 0 0 0 0 0 0 52 0x10000001` | box over voltage |
| `12.4 13.1 11.9 12.8 14.2 15.0 0 0 0 0 0 0 41 0x20000001` | box under voltage |
| `12.4 13.1 11.9 12.8 14.2 15.0 0 0 0 0 0 0 48 0x40000001` | box over temperature |
| `12.4 13.1 11.9 12.8 14.2 15.0 0 0 0 0 0 0 48 0x08000001` | box over current |
| `12.4 13.1 11.9 12.8 14.2 15.0 0 0 0 0 0 0 48 0x04000001` | version error |
| `12.4 13.1 11.9 12.8 14.2 15.0 0 0 0 0 0 0 48 0x02000001` | usb error |
| `2.2 0.0 999.9 12.8 14.2 15.0 1 2 3 0 0 0 34 0x24000005` | p1 leak, p2 broken, p3 nc or broken, under voltage, box boost error |
| `2.2 13.1 11.9 2.3 14.2 15.0 1 0 0 1 0 0 0 0x00000000` | p1 leak, p4 leak, boost off while leak present |
| `12.4 13.1 11.9 12.8 14.2 15.0 0 0 0 0 0 0 48 0x80000001` | generic error bit set |

