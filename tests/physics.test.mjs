import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MODEL_ASSUMPTIONS,
  digitalLogic,
  solveCurrent,
  solvePull,
  solveRC,
  rcSamples,
  solveOhm,
  solveDivider,
  pwmSamples,
  solveADC,
  protocolFrames,
} from '../src/sim/models.js';

function close(actual, expected, tolerance = 1e-12) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `${actual} should equal ${expected}`,
  );
}

test('closed current obeys Ohm’s law, reversal changes sign, and an open switch breaks either path', () => {
  for (const switchPosition of ['high', 'low']) {
    const forward = solveCurrent({ voltage: 5, resistance: 2000, switchPosition });
    close(forward.current, 0.0025);
    close(forward.power, 0.0125);
    assert.equal(forward.direction, 'clockwise');
    const reverse = solveCurrent({ voltage: 5, resistance: 2000, polarity: -1, switchPosition });
    close(reverse.current, -forward.current);
    close(reverse.power, forward.power);
    assert.equal(reverse.direction, 'counterclockwise');
    const opened = solveCurrent({ closed: false, switchPosition });
    assert.equal(opened.current, 0);
    assert.equal(opened.power, 0);
    assert.equal(opened.direction, 'none');
  }
});

test('changing the reference ground preserves differential voltage, current, and power', () => {
  for (const polarity of [-1, 1]) {
    const low = solveCurrent({ ground: 'low', polarity });
    const high = solveCurrent({ ground: 'high', polarity });
    assert.equal(low.current, high.current);
    assert.equal(low.power, high.power);
    close(low.nodeHigh - low.nodeLow, high.nodeHigh - high.nodeLow);
    assert.equal(low.nodeLow, 0);
    assert.equal(high.nodeHigh, 0);
    close(high.nodeLow, -polarity * 3.3);
  }
  assert.equal(solveCurrent({ voltage: 0, polarity: -1 }).current, 0);
});

test('pull-up/down truth table includes idle current and limited pressed-state power', () => {
  const upIdle = solvePull({ mode: 'up' });
  const upPressed = solvePull({ mode: 'up', closed: true });
  const downIdle = solvePull({ mode: 'down' });
  const downPressed = solvePull({ mode: 'down', closed: true });
  assert.deepEqual(
    [upIdle.logic, upPressed.logic, downIdle.logic, downPressed.logic],
    ['HIGH', 'LOW', 'LOW', 'HIGH'],
  );
  assert.deepEqual(
    [upIdle.voltage, upPressed.voltage, downIdle.voltage, downPressed.voltage],
    [3.3, 0, 0, 3.3],
  );
  assert.equal(upIdle.current, 0);
  assert.equal(downIdle.current, 0);
  close(upPressed.current, 0.00033);
  close(downPressed.current, upPressed.current);
  close(upPressed.power, 3.3 ** 2 / 10000);
  close(solvePull({ mode: 'up', closed: true, resistance: 1000 }).power, upPressed.power * 10);
});

test('an unbiased open GPIO has no invented voltage, and a closed switch establishes LOW', () => {
  const floating = solvePull({ mode: 'none' });
  assert.equal(floating.voltage, null);
  assert.equal(floating.logic, 'FLOATING');
  assert.equal(floating.current, 0);
  assert.equal(solvePull({ mode: 'none', closed: true }).logic, 'LOW');
});

test('leakage drops voltage by I × R and can enter the undefined input region', () => {
  const leakage = 50e-6;
  const resistance = 33000;
  const result = solvePull({ mode: 'up', leakage, resistance });
  close(result.voltage, 3.3 - leakage * resistance);
  assert.equal(result.logic, 'UNDEFINED');
  close(result.current, leakage);
  close(result.power, leakage ** 2 * resistance);
  const pullDownWithSource = solvePull({ mode: 'down', leakage: -leakage, resistance });
  close(pullDownWithSource.voltage, leakage * resistance);
});

test('digital limits are inclusive, with a distinct undefined and floating region', () => {
  assert.equal(digitalLogic({ voltage: 0.99 }), 'LOW');
  assert.equal(digitalLogic({ voltage: 2.31 }), 'HIGH');
  assert.equal(digitalLogic({ voltage: 0.990001 }), 'UNDEFINED');
  assert.equal(digitalLogic({ voltage: 2.309999 }), 'UNDEFINED');
  assert.equal(digitalLogic({ voltage: 1.65 }), 'UNDEFINED');
  assert.equal(digitalLogic({ voltage: null }), 'FLOATING');
});

test('RC charging reaches 1−e⁻¹ at τ and 99.326% at 5τ with decreasing current', () => {
  const start = solveRC();
  assert.equal(start.voltage, 0);
  close(start.current, 3.3 / 10000);
  assert.equal(start.tau, 1);
  const oneTau = solveRC({ time: start.tau });
  close(oneTau.voltage, 3.3 * (1 - Math.exp(-1)));
  close(oneTau.progress, 1 - Math.exp(-1));
  const fiveTau = solveRC({ time: 5 * start.tau });
  close(fiveTau.voltage / 3.3, 1 - Math.exp(-5));
  assert.ok(start.current > oneTau.current && oneTau.current > fiveTau.current);
  close(fiveTau.charge, 0.0001 * fiveTau.voltage);
  close(fiveTau.energy, 0.5 * 0.0001 * fiveTau.voltage ** 2);
});

test('RC discharge starts at VCC and preserves capacitor voltage across a switch event', () => {
  assert.equal(solveRC({ initialVoltage: 1.2, time: 0 }).voltage, 1.2);
  const start = solveRC({ charging: false });
  close(start.voltage, 3.3);
  close(start.current, -3.3 / 10000);
  const atSwitch = solveRC({ time: 0.6 });
  const afterSwitch = solveRC({ charging: false, initialVoltage: atSwitch.voltage, time: 0 });
  assert.equal(afterSwitch.voltage, atSwitch.voltage);
  assert.equal(afterSwitch.charge, atSwitch.charge);
  assert.equal(afterSwitch.energy, atSwitch.energy);
  assert.ok(afterSwitch.current < 0);
  const later = solveRC({ charging: false, initialVoltage: atSwitch.voltage, time: 0.8 });
  assert.ok(later.voltage < afterSwitch.voltage && later.voltage > 0);
  close(later.voltage, atSwitch.voltage * Math.exp(-0.8));
});

test('RC sample endpoints and time scaling preserve the analytical response', () => {
  const params = { resistance: 2200, capacitance: 47e-6, initialVoltage: 1.2 };
  const samples = rcSamples(params, 51);
  assert.equal(samples.length, 51);
  assert.equal(samples[0].time, 0);
  close(samples[0].voltage, 1.2);
  close(samples.at(-1).time, 5 * params.resistance * params.capacitance);
  const end = solveRC({ ...params, time: samples.at(-1).time });
  close(samples.at(-1).voltage, end.voltage);
  assert.ok(samples.every((sample, i) => i === 0 || sample.time > samples[i - 1].time));
});

test('parallel currents add (KCL), equivalent resistance falls, and power is conserved', () => {
  const result = solveOhm({ voltage: 5, resistance: 1000, parallelResistance: 2000 });
  close(result.totalResistance, 2000 / 3);
  close(result.branchCurrents[0], 0.005);
  close(result.branchCurrents[1], 0.0025);
  close(
    result.current,
    result.branchCurrents.reduce((sum, current) => sum + current, 0),
  );
  close(result.current, 5 / result.totalResistance);
  close(
    result.power,
    result.branchCurrents.reduce((sum, current) => sum + 5 * current, 0),
  );
  assert.ok(result.totalResistance < 1000);
  const reverse = solveOhm({ voltage: -5, resistance: 1000 });
  assert.ok(reverse.current < 0);
  assert.ok(reverse.power > 0);
});

test('unloaded divider has correct equal-ratio and wire endpoint voltages', () => {
  close(solveDivider().voltage, 1.65);
  const topWire = solveDivider({ voltage: 5, resistanceTop: 0, resistanceBottom: 2000 });
  close(topWire.voltage, 5);
  assert.equal(topWire.dropTop, 0);
  const bottomWire = solveDivider({ voltage: 5, resistanceTop: 2000, resistanceBottom: 0 });
  assert.equal(bottomWire.voltage, 0);
  close(bottomWire.dropTop, 5);
  const off = solveDivider({ voltage: 0 });
  assert.equal(off.current, 0);
  assert.equal(off.power, 0);
  close(solveDivider({ voltage: -5 }).voltage, -2.5);
  assert.ok(solveDivider({ voltage: -5 }).power > 0);
});

test('divider responds monotonically to ratio, preserves KVL, and conserves resistor power', () => {
  let last = Infinity;
  for (const resistanceTop of [1000, 2000, 4700, 10000, 22000, 100000]) {
    const resistanceBottom = 10000;
    const result = solveDivider({ voltage: 3.3, resistanceTop, resistanceBottom });
    assert.ok(result.voltage < last);
    last = result.voltage;
    close(result.dropTop + result.dropBottom, 3.3);
    close(result.current, 3.3 / (resistanceTop + resistanceBottom));
    close(
      result.power,
      result.current ** 2 * resistanceTop + result.current ** 2 * resistanceBottom,
    );
    close(result.voltage, result.current * resistanceBottom);
  }
  let rising = 0;
  for (const resistanceBottom of [1000, 2000, 4700, 10000, 22000, 100000]) {
    const result = solveDivider({ resistanceTop: 10000, resistanceBottom });
    assert.ok(result.voltage > rising);
    rising = result.voltage;
  }
  const original = solveDivider({ resistanceTop: 1000, resistanceBottom: 2000 });
  const scaled = solveDivider({ resistanceTop: 10000, resistanceBottom: 20000 });
  close(original.voltage, scaled.voltage);
  close(original.current, 10 * scaled.current);
});

test('ADC saturates endpoints and has monotonic code steps with error below 1 LSB in range', () => {
  assert.equal(solveADC({ voltage: 0 }).code, 0);
  assert.equal(solveADC({ voltage: -1 }).code, 0);
  assert.equal(solveADC({ voltage: 3.3 }).code, 4095);
  assert.equal(solveADC({ voltage: 5 }).code, 4095);
  const half = solveADC();
  assert.equal(half.code, 2048);
  assert.equal(half.levels, 4096);
  close(half.lsb, 3.3 / 4096);
  for (let index = 0; index < 1000; index++) {
    const voltage = (index / 1000) * 3.3;
    const result = solveADC({ voltage });
    assert.ok(result.error <= 1e-12 && result.error > -result.lsb - 1e-12);
    close(result.quantized, result.code * result.lsb);
    if (index) assert.ok(result.code >= solveADC({ voltage: ((index - 1) / 1000) * 3.3 }).code);
  }
});

test('PWM endpoints represent true 0% and 100%, and duty sets high-time proportion', () => {
  assert.ok(pwmSamples({ duty: 0 }).every(({ voltage }) => voltage === 0));
  assert.ok(pwmSamples({ duty: 100 }).every(({ voltage }) => voltage === 3.3));
  const samples = pwmSamples({ duty: 25, frequency: 2000 }, 401);
  close(samples.at(-1).time, 0.001);
  const high = samples.slice(0, -1).filter(({ voltage }) => voltage > 0).length;
  close(high / (samples.length - 1), 0.25);
});

test('protocol lanes cover continuous, bounded timelines and preserve frame meaning', () => {
  for (const protocol of ['i2c', 'spi', 'uart']) {
    const frame = protocolFrames(protocol);
    assert.equal(frame.protocol, protocol);
    assert.equal(frame.unit, 'bit time');
    for (const lane of frame.lanes) {
      assert.equal(lane.segments[0].start, 0);
      assert.equal(lane.segments.at(-1).end, frame.duration);
      lane.segments.forEach((piece, index) => {
        assert.ok(piece.start < piece.end);
        assert.ok([0, 1, null].includes(piece.value));
        if (index) assert.equal(piece.start, lane.segments[index - 1].end);
      });
    }
  }
  const i2c = protocolFrames('i2c');
  const sda = i2c.lanes.find(({ name }) => name === 'SDA');
  assert.equal(sda.segments.filter(({ label }) => label === 'ACK').length, 2);
  assert.deepEqual(
    sda.segments.slice(2, 10).map(({ value }) => value),
    [1, 0, 0, 1, 0, 0, 0, 0],
  );
  const spi = protocolFrames('spi');
  assert.equal(spi.lanes.find(({ name }) => name === 'MISO').segments[0].value, null);
  const uart = protocolFrames('uart');
  assert.deepEqual(
    uart.lanes[0].segments.slice(2, 10).map(({ value }) => value),
    [1, 1, 0, 0, 1, 0, 1, 0],
  );
});

test('models reject non-finite inputs, impossible component values, and ambiguous options', () => {
  const invalid = [
    () => solveCurrent({ resistance: 0 }),
    () => solveCurrent({ voltage: NaN }),
    () => solveCurrent({ polarity: 0 }),
    () => solveCurrent({ closed: 1 }),
    () => solveCurrent({ ground: 'earth' }),
    () => solveCurrent({ switchPosition: 'middle' }),
    () => solvePull({ mode: 'both' }),
    () => solvePull({ vcc: 0 }),
    () => solvePull({ leakage: Infinity }),
    () => digitalLogic({ voltage: 1, thresholdLow: 0.8, thresholdHigh: 0.2 }),
    () => solveRC({ resistance: -1 }),
    () => solveRC({ capacitance: 0 }),
    () => solveRC({ time: -1 }),
    () => solveRC({ initialVoltage: Infinity }),
    () => solveOhm({ parallelResistance: 0 }),
    () => rcSamples({}, 1),
    () => solveDivider({ resistanceTop: 0, resistanceBottom: 0 }),
    () => solveDivider({ resistanceTop: -1 }),
    () => solveDivider({ resistanceBottom: Infinity }),
    () => pwmSamples({ duty: 101 }),
    () => pwmSamples({ frequency: 0 }),
    () => solveADC({ bits: 1.5 }),
    () => solveADC({ bits: 25 }),
    () => solveADC({ vref: 0 }),
    () => protocolFrames('one-wire'),
  ];
  invalid.forEach((call) => assert.throws(call));
  assert.ok(Object.isFrozen(MODEL_ASSUMPTIONS));
  assert.equal(Object.keys(MODEL_ASSUMPTIONS).length, 8);
});
