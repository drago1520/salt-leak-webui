const ohm = {
  leak: () => (Math.random() * 10).toFixed(2),
  lower: () => (Math.random() * (12 - 10) + 10).toFixed(2),
  higher: () => (Math.random() * (50 - 15) + 15).toFixed(2)
}
export const presets = ['','lower','higher','p4Leak','p1p4Leak','p2Broken','p3NC','p5BoostErr&BoxBoostErr','p6Inactive&BoostOff','boxOverVoltage','boxUnderVoltage','boxOverTemperature','boxOverCurrent','versionErr','usbErr','genericErr',
] as const

export const simulateSensorOutput = (preset: typeof presets[number] = ''): string => {
  const boxBase = `${Math.random() * (49 - 47) + 47} 0x00000001`
  const pinsStatusBase = '0 0 0 0 0 0'
  let pinsOhm: string

  switch (preset) {
    case 'lower':
    case '':
      pinsOhm = Array.from({ length: 6 }, () => ohm.lower()).join(' ')
      return `${pinsOhm} ${pinsStatusBase} ${boxBase}`

    case 'higher':
      pinsOhm = Array.from({ length: 6 }, () => ohm.higher()).join(' ')
      return `${pinsOhm} ${pinsStatusBase} ${boxBase}`

    case 'p4Leak':
      pinsOhm = Array.from({ length: 6 }, (_, i) => [3].includes(i) ? ohm.leak() : ohm.lower()).join(' ')
      return `${pinsOhm} 0 0 0 1 0 0 ${boxBase}`

    case 'p1p4Leak':
      pinsOhm = Array.from({ length: 6 }, (_, i) => [0, 3].includes(i) ? ohm.leak() : ohm.lower()).join(' ')
      return `${pinsOhm} 1 0 0 1 0 0 ${boxBase}`

    case 'p2Broken':
      pinsOhm = Array.from({ length: 6 }, (_, i) => [1].includes(i) ? 0 : ohm.lower()).join(' ')
      return `${pinsOhm} 0 2 0 0 0 0 ${boxBase}`

    case 'p3NC':
      pinsOhm = Array.from({ length: 6 }, (_, i) => [2].includes(i) ? 4235.23 : ohm.lower()).join(' ')
      return `${pinsOhm} 0 0 3 0 0 0 ${boxBase}`

    case 'p5BoostErr&BoxBoostErr':
      pinsOhm = Array.from({ length: 6 }, () => ohm.lower()).join(' ')
      return `${pinsOhm} 0 0 0 0 4 0 36 0x00000005`

    case 'p6Inactive&BoostOff':
      pinsOhm = Array.from({ length: 6 }, (_, i) => [5].includes(i) ? 0 : ohm.lower()).join(' ')
      return `${pinsOhm} 0 0 0 0 0 5 0 0x00000000`

    case 'boxOverVoltage':
      pinsOhm = Array.from({ length: 6 }, () => ohm.lower()).join(' ')
      return `${pinsOhm} ${pinsStatusBase} 52 0x10000001`

    case 'boxUnderVoltage':
      pinsOhm = Array.from({ length: 6 }, () => ohm.lower()).join(' ')
      return `${pinsOhm} ${pinsStatusBase} 41 0x20000001`

    case 'boxOverTemperature':
      pinsOhm = Array.from({ length: 6 }, () => ohm.lower()).join(' ')
      return `${pinsOhm} ${pinsStatusBase} 48 0x40000001`

    case 'boxOverCurrent':
      pinsOhm = Array.from({ length: 6 }, () => ohm.lower()).join(' ')
      return `${pinsOhm} ${pinsStatusBase} 48 0x08000001`

    case 'versionErr':
      pinsOhm = Array.from({ length: 6 }, () => ohm.lower()).join(' ')
      return `${pinsOhm} ${pinsStatusBase} 48 0x04000001`

    case 'usbErr':
      pinsOhm = Array.from({ length: 6 }, () => ohm.lower()).join(' ')
      return `${pinsOhm} ${pinsStatusBase} 48 0x02000001`

    case 'genericErr':
      pinsOhm = Array.from({ length: 6 }, () => ohm.lower()).join(' ')
      return `${pinsOhm} ${pinsStatusBase} 48 0x80000001`
  }

  throw new Error(`Unsupported preset: ${preset}`)
}
