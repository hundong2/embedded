/**
 * Deterministic teaching models. All numerical inputs use SI units.
 * These ideal, explicitly bounded examples are not a general circuit solver.
 */

export const MODEL_ASSUMPTIONS = Object.freeze({
  current:
    '이상적인 DC 전압원·저항·스위치 한 개의 닫힌 고리입니다. 양의 전류는 시계 방향의 관습적 전류이며, 전자 이동은 반대입니다. 접지 선택은 전압 기준만 바꿉니다. nodeHigh/nodeLow는 전원 양 끝의 위/아래 위치 이름입니다.',
  pull: 'GPIO 입력의 임피던스는 무한대이고 스위치 저항은 0 Ω입니다. 누설 전류는 핀에서 GND 방향으로 빠져나가면 양수입니다. 입력 보호 다이오드·노이즈·스위치 바운스는 포함하지 않습니다. 임계값은 VCC의 비율이며 실제 데이터시트를 확인해야 합니다.',
  rc: '선형 저항과 이상적 캐패시터의 1차 계단 응답입니다. 전류의 양의 방향은 캐패시터에 전하를 더하는 방향이며 방전 전류는 음수입니다. 유전체를 통한 DC 전도는 모델링하지 않습니다. ESR·누설·전원 내부 저항은 생략합니다.',
  ohm: '이상적 선형 저항 한 개 또는 두 저항의 병렬 연결입니다. 저항값·전원은 시간과 온도에 따라 변하지 않습니다.',
  divider:
    '이상적 전압원과 두 직렬 저항의 무부하 분압기입니다. 출력은 아래쪽 저항 양단에서 읽으며 출력 측정기는 전류를 소비하지 않습니다. 실제 부하를 연결하면 분압 비율이 달라집니다.',
  adc: '단극성 이상적 ADC입니다. 코드 = floor(Vin / Vref × 2^N), 입력 범위를 넘으면 포화합니다. 재구성 전압은 코드 구간의 아래쪽 경계입니다. 오프셋·잡음·기준전압 오차는 생략합니다.',
  pwm: '주파수와 듀티가 일정한 이상적 디지털 파형입니다. 표시 평균은 전압의 시간 평균이며 아날로그 평활 전압이나 부하 전력과 같다고 가정할 수 없습니다.',
  protocol:
    '타이밍을 비교하기 위한 이상적 디지털 프레임입니다. 단위는 비트 시간이며 실제 주파수·전압·상승 시간·버스 중재·설정/유지 시간은 생략합니다. I²C는 오픈 드레인 출력과 풀업을 전제로 합니다.',
});

function finite(name, value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
  return value;
}

function positive(name, value) {
  finite(name, value);
  if (value <= 0) throw new RangeError(`${name} must be greater than zero`);
  return value;
}

function nonnegative(name, value) {
  finite(name, value);
  if (value < 0) throw new RangeError(`${name} must not be negative`);
  return value;
}

function choice(name, value, choices) {
  if (!choices.includes(value))
    throw new RangeError(`${name} must be one of ${choices.join(', ')}`);
  return value;
}

function boolean(name, value) {
  if (typeof value !== 'boolean') throw new TypeError(`${name} must be a boolean`);
  return value;
}

function sampleCount(value) {
  if (!Number.isInteger(value) || value < 2 || value > 10_000) {
    throw new RangeError('count must be an integer from 2 to 10000');
  }
  return value;
}

function representable(name, value) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} exceeds the numerical range`);
  return value;
}

function thresholds(vcc, thresholdLow, thresholdHigh) {
  positive('vcc', vcc);
  finite('thresholdLow', thresholdLow);
  finite('thresholdHigh', thresholdHigh);
  if (!(0 <= thresholdLow && thresholdLow < thresholdHigh && thresholdHigh <= 1)) {
    throw new RangeError('thresholds must satisfy 0 <= low < high <= 1');
  }
}

/** Classify a pin using inclusive LOW/HIGH limits; null means no DC bias. */
export function digitalLogic({ voltage, vcc = 3.3, thresholdLow = 0.3, thresholdHigh = 0.7 } = {}) {
  thresholds(vcc, thresholdLow, thresholdHigh);
  if (voltage === null) return 'FLOATING';
  finite('voltage', voltage);
  // Decimal rail/threshold products need a few ULPs for inclusive boundaries.
  const roundoff = Number.EPSILON * vcc * 4;
  if (voltage <= vcc * thresholdLow + roundoff) return 'LOW';
  if (voltage >= vcc * thresholdHigh - roundoff) return 'HIGH';
  return 'UNDEFINED';
}

/**
 * A one-loop circuit. `polarity` sets source direction; `ground` only changes
 * the reference of the two source terminals. An open switch breaks the loop
 * regardless of whether it is above or below the resistor.
 */
export function solveCurrent({
  voltage = 3.3,
  resistance = 1000,
  closed = true,
  polarity = 1,
  ground = 'low',
  switchPosition = 'high',
} = {}) {
  nonnegative('voltage', voltage);
  positive('resistance', resistance);
  boolean('closed', closed);
  choice('polarity', polarity, [-1, 1]);
  choice('ground', ground, ['low', 'high']);
  choice('switchPosition', switchPosition, ['high', 'low']);
  const magnitude = representable('current', closed ? voltage / resistance : 0);
  const current = magnitude === 0 ? 0 : polarity * magnitude;
  const sourceVoltage = polarity * voltage;
  return {
    current,
    magnitude,
    direction: current > 0 ? 'clockwise' : current < 0 ? 'counterclockwise' : 'none',
    power: representable('power', magnitude * voltage),
    nodeHigh: ground === 'high' ? 0 : sourceVoltage,
    nodeLow: ground === 'low' ? 0 : -sourceVoltage,
    closed,
  };
}

/**
 * Pull-up/down with an ideal switch to the opposite rail. `none` retains a
 * switch to GND, so an open unbiased pin floats and a closed pin is LOW.
 * With an open switch, signed leakage moves voltage by I_leak * R.
 */
export function solvePull({
  mode = 'up',
  closed = false,
  vcc = 3.3,
  resistance = 10000,
  leakage = 0,
  thresholdLow = 0.3,
  thresholdHigh = 0.7,
} = {}) {
  choice('mode', mode, ['up', 'down', 'none']);
  boolean('closed', closed);
  thresholds(vcc, thresholdLow, thresholdHigh);
  positive('resistance', resistance);
  finite('leakage', leakage);
  let voltage = null;
  let current = 0;
  let path = 'open';
  let explanation =
    '풀 저항과 닫힌 스위치가 없어 입력 전압을 결정할 DC 경로가 없습니다. 부동 입력은 0 V나 임의의 확정 값이 아닙니다.';
  if (mode === 'none' && closed) {
    voltage = 0;
    path = 'pin → switch → GND';
    explanation =
      '닫힌 스위치가 입력을 GND에 연결합니다. 풀 저항이 없으므로 이 모델의 전원–접지 DC 경로는 없습니다.';
  } else if (mode !== 'none') {
    if (closed) {
      voltage = mode === 'up' ? 0 : vcc;
      current = representable('current', vcc / resistance);
      path = mode === 'up' ? 'VCC → R → switch → GND' : 'VCC → switch → R → GND';
      explanation =
        mode === 'up'
          ? '스위치를 누르면 입력이 GND가 되어 LOW입니다. 전류는 VCC에서 풀업 저항과 스위치를 거쳐 GND로 돌아갑니다.'
          : '스위치를 누르면 입력이 VCC가 되어 HIGH입니다. 전류는 VCC에서 스위치와 풀다운 저항을 거쳐 GND로 돌아갑니다.';
    } else {
      voltage = representable('voltage', (mode === 'up' ? vcc : 0) - leakage * resistance);
      current = Math.abs(leakage);
      path =
        leakage === 0
          ? '입력 누설 0 A · 닫힌 DC 경로 없음'
          : mode === 'up'
            ? 'VCC ↔ R ↔ GPIO 누설'
            : 'GPIO 누설 ↔ R ↔ GND';
      explanation =
        mode === 'up'
          ? '풀업 저항이 기본 입력을 VCC 쪽으로 정합니다. 이상적인 입력은 전류를 소비하지 않아 저항 전압 강하도 0 V입니다.'
          : '풀다운 저항이 기본 입력을 GND 쪽으로 정합니다. 이상적인 입력은 전류를 소비하지 않아 저항 전압 강하도 0 V입니다.';
      if (leakage !== 0)
        explanation += ` 누설을 포함하면 입력이 기준 레일에서 −I누설 × R = ${(-leakage * resistance).toPrecision(3)} V 이동합니다. 보호 다이오드는 생략한 근사입니다.`;
    }
  }
  const logic = digitalLogic({ voltage, vcc, thresholdLow, thresholdHigh });
  return {
    voltage,
    logic,
    current,
    power: representable('power', current * current * resistance),
    path,
    explanation,
  };
}

/** Signed current is positive into the capacitor; preserve initialVoltage at t=0. */
export function solveRC({
  vcc = 3.3,
  resistance = 10000,
  capacitance = 0.0001,
  time = 0,
  charging = true,
  initialVoltage,
} = {}) {
  nonnegative('vcc', vcc);
  positive('resistance', resistance);
  positive('capacitance', capacitance);
  nonnegative('time', time);
  boolean('charging', charging);
  const start =
    initialVoltage === undefined ? (charging ? 0 : vcc) : finite('initialVoltage', initialVoltage);
  const target = charging ? vcc : 0;
  const tau = representable('tau', resistance * capacitance);
  if (tau === 0) throw new RangeError('tau is below the numerical range');
  const decay = Math.exp(-time / tau);
  const progress = -Math.expm1(-time / tau);
  // expm1 preserves very early responses and exactly preserves Vc at t=0.
  const voltage = representable('voltage', start + (target - start) * progress);
  const current = representable('current', ((target - start) / resistance) * decay);
  return {
    voltage,
    current: current === 0 ? 0 : current,
    tau,
    energy: representable('energy', 0.5 * capacitance * voltage * voltage),
    charge: representable('charge', capacitance * voltage),
    progress,
  };
}

/** Include both t=0 and t=5τ. */
export function rcSamples(params = {}, count = 100) {
  sampleCount(count);
  const { tau } = solveRC(params);
  const duration = representable('sample duration', 5 * tau);
  return Array.from({ length: count }, (_, index) => {
    const time = (index / (count - 1)) * duration;
    const { voltage, current } = solveRC({ ...params, time });
    return { time, voltage, current };
  });
}

/** One resistor, optionally in parallel with a second resistor. */
export function solveOhm({ voltage = 3.3, resistance = 1000, parallelResistance } = {}) {
  finite('voltage', voltage);
  positive('resistance', resistance);
  if (parallelResistance !== undefined) positive('parallelResistance', parallelResistance);
  const branchCurrents = [representable('current', voltage / resistance)];
  if (parallelResistance !== undefined)
    branchCurrents.push(representable('parallel current', voltage / parallelResistance));
  const totalResistance =
    parallelResistance === undefined ? resistance : 1 / (1 / resistance + 1 / parallelResistance);
  if (totalResistance === 0) throw new RangeError('total resistance is below the numerical range');
  const current = representable(
    'total current',
    branchCurrents.reduce((sum, value) => sum + value, 0),
  );
  return {
    current,
    totalResistance,
    branchCurrents,
    power: representable('power', voltage * current),
  };
}

/**
 * Unloaded two-resistor divider; output is the bottom resistor's voltage.
 * A single 0 Ω resistor is a valid ratio endpoint, but two ideal wires would
 * short the source and have no finite solution in this model.
 */
export function solveDivider({
  voltage = 3.3,
  resistanceTop = 10000,
  resistanceBottom = 10000,
} = {}) {
  finite('voltage', voltage);
  nonnegative('resistanceTop', resistanceTop);
  nonnegative('resistanceBottom', resistanceBottom);
  const totalResistance = representable('total resistance', resistanceTop + resistanceBottom);
  positive('totalResistance', totalResistance);
  const current = representable('current', voltage / totalResistance);
  const dropTop = representable('top voltage drop', voltage * (resistanceTop / totalResistance));
  const dropBottom = representable(
    'bottom voltage drop',
    voltage * (resistanceBottom / totalResistance),
  );
  return {
    voltage: dropBottom,
    current,
    totalResistance,
    power: representable('power', voltage * current),
    dropTop,
    dropBottom,
  };
}

/** Uniform samples over two PWM periods; voltage is ideal LOW=0, HIGH=VCC. */
export function pwmSamples({ duty = 50, frequency = 1000, vcc = 3.3 } = {}, count = 121) {
  finite('duty', duty);
  if (duty < 0 || duty > 100) throw new RangeError('duty must be from 0 to 100 percent');
  positive('frequency', frequency);
  nonnegative('vcc', vcc);
  sampleCount(count);
  const duration = representable('sample duration', 2 / frequency);
  return Array.from({ length: count }, (_, index) => {
    const cycles = (2 * index) / (count - 1);
    const time = (index / (count - 1)) * duration;
    const phase = cycles - Math.floor(cycles);
    return { time, voltage: duty === 100 || (duty > 0 && phase < duty / 100) ? vcc : 0 };
  });
}

/** Ideal unipolar, floor-quantized ADC with saturated endpoint codes. */
export function solveADC({ voltage = 1.65, vref = 3.3, bits = 12 } = {}) {
  finite('voltage', voltage);
  positive('vref', vref);
  if (!Number.isInteger(bits) || bits < 1 || bits > 24)
    throw new RangeError('bits must be an integer from 1 to 24');
  const levels = 2 ** bits;
  const lsb = vref / levels;
  if (lsb === 0) throw new RangeError('lsb is below the numerical range');
  const code =
    voltage <= 0 ? 0 : voltage >= vref ? levels - 1 : Math.floor((voltage / vref) * levels);
  const quantized = code * lsb;
  return { code, levels, lsb, quantized, error: quantized - voltage };
}

function segment(start, end, value, label) {
  return label === undefined ? { start, end, value } : { start, end, value, label };
}

function bitsMSB(byte) {
  return Array.from({ length: 8 }, (_, index) => (byte >> (7 - index)) & 1);
}

/**
 * Educational logic-analyzer frames. Segment bounds use bit-time units.
 * A null segment value means high impedance (Z), not a LOW level.
 */
export function protocolFrames(protocol = 'i2c') {
  choice('protocol', protocol, ['i2c', 'spi', 'uart']);
  const colors = { clock: '#5cc8ff', data: '#8ce4ad', select: '#ffcb6b', receive: '#c7a3ff' };
  if (protocol === 'i2c') {
    const bits = [...bitsMSB(0x90), 0, ...bitsMSB(0xa6), 0];
    const clock = [segment(0, 0.5, 1)];
    const data = [segment(0, 0.25, 1), segment(0.25, 0.5, 0, 'START')];
    bits.forEach((value, index) => {
      const start = index + 0.5;
      clock.push(segment(start, start + 0.5, 0), segment(start + 0.5, start + 1, 1));
      data.push(
        segment(start, start + 1, value, index === 8 || index === 17 ? 'ACK' : String(value)),
      );
    });
    clock.push(segment(18.5, 19, 0), segment(19, 20, 1));
    data.push(segment(18.5, 19.25, 0), segment(19.25, 20, 1, 'STOP'));
    return {
      protocol,
      duration: 20,
      unit: 'bit time',
      lanes: [
        { name: 'SCL', color: colors.clock, segments: clock },
        { name: 'SDA', color: colors.data, segments: data },
      ],
      events: [
        { time: 0.25, label: 'START' },
        { time: 4, label: '주소 0x48' },
        { time: 8, label: 'W=0' },
        { time: 9, label: 'ACK' },
        { time: 13.5, label: '데이터 0xA6' },
        { time: 18, label: 'ACK' },
        { time: 19.25, label: 'STOP' },
      ],
      description:
        'I²C 쓰기: 7비트 주소 0x48 + W=0 → ACK → 데이터 0xA6 → ACK. SCL이 HIGH일 때 SDA의 하강은 START, 상승은 STOP입니다. 일반 데이터는 SCL이 LOW인 동안 바뀝니다. HIGH는 풀업 저항이 만듭니다.',
    };
  }
  if (protocol === 'spi') {
    const clock = [segment(0, 0.5, 0)];
    const mosi = [segment(0, 0.5, 0)];
    const miso = [segment(0, 0.5, null, 'Z')];
    const tx = bitsMSB(0xa6);
    const rx = bitsMSB(0x3c);
    tx.forEach((value, index) => {
      const start = index + 0.5;
      clock.push(segment(start, start + 0.5, 0), segment(start + 0.5, start + 1, 1));
      mosi.push(segment(start, start + 1, value, String(value)));
      miso.push(segment(start, start + 1, rx[index], String(rx[index])));
    });
    clock.push(segment(8.5, 9, 0));
    mosi.push(segment(8.5, 9, 0));
    miso.push(segment(8.5, 9, null, 'Z'));
    return {
      protocol,
      duration: 9,
      unit: 'bit time',
      lanes: [
        {
          name: 'CS̅',
          color: colors.select,
          segments: [segment(0, 0.5, 1), segment(0.5, 8.5, 0), segment(8.5, 9, 1)],
        },
        { name: 'SCLK', color: colors.clock, segments: clock },
        { name: 'MOSI', color: colors.data, segments: mosi },
        { name: 'MISO', color: colors.receive, segments: miso },
      ],
      events: [
        { time: 0.5, label: 'CS 활성' },
        { time: 4.5, label: 'MOSI 0xA6 / MISO 0x3C' },
        { time: 8.5, label: 'CS 해제' },
      ],
      description:
        'SPI 모드 0(CPOL=0, CPHA=0), MSB 우선: CS가 LOW인 동안 상승 에지에서 데이터를 읽습니다. MOSI와 MISO가 동시에 한 비트씩 전달됩니다. 이 예에서 비선택 장치의 MISO는 고임피던스(Z)입니다.',
    };
  }
  const bits = Array.from({ length: 8 }, (_, index) => (0x53 >> index) & 1);
  return {
    protocol,
    duration: 12,
    unit: 'bit time',
    lanes: [
      {
        name: 'TX',
        color: colors.data,
        segments: [
          segment(0, 1, 1, 'IDLE'),
          segment(1, 2, 0, 'START'),
          ...bits.map((value, index) => segment(index + 2, index + 3, value, `b${index}=${value}`)),
          segment(10, 11, 1, 'STOP'),
          segment(11, 12, 1, 'IDLE'),
        ],
      },
    ],
    events: [
      { time: 1, label: 'START' },
      { time: 6, label: '0x53 · LSB 우선' },
      { time: 10, label: 'STOP' },
    ],
    description:
      'UART 8N1: 유휴 HIGH → START 1비트 LOW → 데이터 8비트(0x53, LSB 우선) → STOP 1비트 HIGH. 별도의 클록선 없이 양쪽이 같은 보드레이트와 프레임 형식을 사용합니다.',
  };
}
