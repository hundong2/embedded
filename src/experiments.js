import { icon, escapeHTML as esc } from './icons.js';
import {
  solveCurrent,
  solvePull,
  solveRC,
  rcSamples,
  solveOhm,
  solveDivider,
  pwmSamples,
  solveADC,
  digitalLogic,
  protocolFrames,
} from './sim/models.js';

export const experiments = [
  {
    id: 'pull',
    title: '풀업 · 풀다운',
    icon: 'switch',
    subtitle: '스위치와 GPIO 입력',
    tag: 'GPIO INPUT',
  },
  {
    id: 'current',
    title: '전류의 경로',
    icon: 'circuit',
    subtitle: '닫힌 경로와 전압의 기준',
    tag: 'CURRENT FLOW',
  },
  {
    id: 'ohm',
    title: '저항과 분압',
    icon: 'resistor',
    subtitle: '옴의 법칙 · 직렬과 병렬',
    tag: 'OHM’S LAW',
  },
  {
    id: 'rc',
    title: 'RC 충방전',
    icon: 'capacitor',
    subtitle: '시간에 따라 달라지는 전류',
    tag: 'RC TRANSIENT',
  },
  {
    id: 'logic',
    title: '디지털 논리',
    icon: 'grid',
    subtitle: '전압이 0과 1이 되는 순간',
    tag: 'DIGITAL LOGIC',
  },
  {
    id: 'pwm',
    title: 'PWM',
    icon: 'wave',
    subtitle: '빠른 스위칭으로 평균값 만들기',
    tag: 'PULSE WIDTH',
  },
  {
    id: 'adc',
    title: 'ADC',
    icon: 'sliders',
    subtitle: '아날로그 전압을 숫자로 읽기',
    tag: 'ANALOG INPUT',
  },
  {
    id: 'protocol',
    title: '통신 신호',
    icon: 'graph',
    subtitle: 'UART · SPI · I²C 타이밍',
    tag: 'SERIAL BUS',
  },
  {
    id: 'memory',
    title: '메모리와 실행',
    icon: 'chip',
    subtitle: '주소 · 비트 · 레지스터',
    tag: 'MCU MEMORY',
  },
];
const defaults = {
  leakage: 0,
  mode: 'up',
  closed: false,
  resistance: 10000,
  voltage: 3.3,
  polarity: 1,
  ground: 'low',
  switchPosition: 'high',
  capacitance: 100e-6,
  timeRatio: 0,
  charging: true,
  parallel: false,
  ratio: 50,
  vin: 1.65,
  gate: 'AND',
  a: 0,
  b: 1,
  duty: 50,
  frequency: 1000,
  bits: 12,
  protocol: 'i2c',
  bit: 0,
  byte: 0,
  electrons: false,
};
let saved = { ...defaults };
const n = (x, d = 2) => Number(x).toFixed(d);
const amperes = (x) => (Math.abs(x) >= 0.001 ? `${n(x * 1000)} mA` : `${n(x * 1e6, 1)} µA`);
const ohms = (x) => (x >= 1000 ? `${n(x / 1000, x % 1000 ? 1 : 0)} kΩ` : `${n(x, 0)} Ω`);
const metric = (label, value, unit = '') =>
  `<div class="metric"><div class="metric-label">${label}</div><strong>${value}${unit ? `<em>${unit}</em>` : ''}</strong></div>`;
const segment = (key, values, selected) =>
  `<div class="segmented" role="group" aria-label="${key}">${values.map(([v, t]) => `<button type="button" data-set="${key}" data-value="${v}" aria-pressed="${String(v) === String(selected)}">${t}</button>`).join('')}</div>`;
const group = (label, control, value = '') =>
  `<div class="control-group"><div class="control-label"><span>${label}</span>${value ? `<strong>${value}</strong>` : ''}</div>${control}</div>`;
const range = (key, min, max, step, value, label) =>
  `<input class="range" type="range" data-range="${key}" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${label}">`;
const toggle = (label, pressed, key = 'closed') =>
  `<button type="button" class="switch-button" data-toggle="${key}" aria-pressed="${pressed}"><span>${label}</span><span class="toggle" aria-hidden="true"></span></button>`;
const ground = (x, y, label = 'GND · 0 V') =>
  `<path class="ground" d="M${x} ${y}v10m-17 0h34m-28 7h22m-16 6h10"/><text x="${x}" y="${y + 42}" text-anchor="middle" class="small">${label}</text>`;
const resistor = (x, y, vertical = true, label = 'R') =>
  vertical
    ? `<path class="wire" d="M${x} ${y}v10m0 50v10"/><rect class="component" x="${x - 10}" y="${y + 10}" width="20" height="50" rx="2"/><text x="${x + 24}" y="${y + 38}" class="label">${label}</text>`
    : `<path class="wire" d="M${x} ${y}h10m50 0h10"/><rect class="component" x="${x + 10}" y="${y - 10}" width="50" height="20" rx="2"/><text x="${x + 35}" y="${y - 24}" text-anchor="middle" class="label">${label}</text>`;
const switchSvg = (x, y, closed) =>
  `<g class="switch-touch"><circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="#8a83c8" stroke-width="2"/><circle cx="${x}" cy="${y + 35}" r="4" fill="#fff" stroke="#8a83c8" stroke-width="2"/><path d="M${x} ${y + 35} ${closed ? `V${y}` : `l25-30`}" fill="none" stroke="#7770bd" stroke-width="2.7" stroke-linecap="round"/></g>`;
const voltageSource = (x, y, v, polarity = 1) =>
  `<circle class="component" cx="${x}" cy="${y}" r="28"/><text class="label" text-anchor="middle" x="${x}" y="${y - 4}">${polarity === 1 ? '+' : '−'}</text><text class="small" text-anchor="middle" x="${x}" y="${y + 15}">${polarity === 1 ? '−' : '+'}</text><text class="label" x="${x - 42}" y="${y + 5}" text-anchor="end">${v} V</text>`;
const svgWrap = (label, body) =>
  `<svg class="circuit-svg" viewBox="0 0 560 320" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title><defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0 0 6 3 0 6" fill="none" stroke="#9690cf" stroke-width="1"/></marker></defs>${body}</svg>`;
const chartPath = (points, x, y, w, h, maxX, maxY, key = 'voltage') =>
  points
    .map(
      (p, i) =>
        `${i ? 'L' : 'M'}${n(x + (p.time / maxX) * w, 1)} ${n(y + h - (p[key] / maxY) * h, 1)}`,
    )
    .join('');
const stepChartPath = (points, x, y, w, h, maxX, maxY) =>
  points
    .map((p, i) =>
      i
        ? `H${n(x + (p.time / maxX) * w, 1)}V${n(y + h - (p.voltage / maxY) * h, 1)}`
        : `M${n(x + (p.time / maxX) * w, 1)} ${n(y + h - (p.voltage / maxY) * h, 1)}`,
    )
    .join('');

// Reconcile controls in place: never detach an active range or its ancestors.
// Keeping native nodes preserves pointer capture, keyboard focus and selection.
function syncControlNode(current, next) {
  if (current.nodeType !== next.nodeType || current.nodeName !== next.nodeName) {
    current.replaceWith(next.cloneNode(true));
    return;
  }
  if (current.nodeType === 3) {
    if (current.data !== next.data) current.data = next.data;
    return;
  }
  if (current.nodeType !== 1) return;
  for (const attr of Array.from(current.attributes))
    if (!next.hasAttribute(attr.name)) current.removeAttribute(attr.name);
  for (const attr of Array.from(next.attributes))
    if (current.getAttribute(attr.name) !== attr.value) current.setAttribute(attr.name, attr.value);
  for (let i = 0; i < next.childNodes.length; i++) {
    if (current.childNodes[i]) syncControlNode(current.childNodes[i], next.childNodes[i]);
    else current.append(next.childNodes[i].cloneNode(true));
  }
  while (current.childNodes.length > next.childNodes.length) current.lastChild.remove();
  if (current.matches('input,select') && current.value !== next.value) current.value = next.value;
}

function syncControls(container, markup) {
  const template = document.createElement('template');
  template.innerHTML = markup;
  const next = template.content;
  for (let i = 0; i < next.childNodes.length; i++) {
    if (container.childNodes[i]) syncControlNode(container.childNodes[i], next.childNodes[i]);
    else container.append(next.childNodes[i].cloneNode(true));
  }
  while (container.childNodes.length > next.childNodes.length) container.lastChild.remove();
}

export function mountExperiment(container, kind = 'pull') {
  const meta = experiments.find((e) => e.id === kind) || experiments[0];
  kind = meta.id;
  const state = { ...saved };
  let timer = null;
  if (kind === 'rc') state.resistance = Math.max(1000, Math.min(50000, state.resistance));
  if (kind === 'logic') state.vin = Math.round(state.vin * 100) / 100;
  container.innerHTML = `<div class="lab-grid"><section class="circuit-panel" aria-label="회로 시각화"><div class="panel-head"><h3><span class="dot"></span>${meta.subtitle}</h3><small>${meta.tag}</small></div><div class="circuit-stage" data-stage></div><div class="circuit-footer"><span class="legend-item"><i class="legend-line"></i>전위 / 활성 경로</span><span class="legend-item"><i class="legend-line dashed"></i><span data-flow-label>관습적 전류 (+ → −)</span></span>${['pull', 'current', 'rc', 'ohm'].includes(kind) ? '<button type="button" class="mini-button" data-electrons>전자 이동 보기</button>' : '<span class="legend-item">교육용 이상 모델</span>'}</div></section><section class="control-panel" aria-label="실험 설정"><div class="control-title">${icon('sliders')}실험 설정</div><div data-controls style="display:contents"></div><div class="metrics" data-metrics aria-live="polite" aria-atomic="true"></div><p class="control-note" data-note></p></section></div><div class="observation" role="status"><div class="observation-icon">${icon('bulb')}</div><div><strong data-observation-title></strong><p data-observation></p></div></div>`;
  const stage = container.querySelector('[data-stage]'),
    controls = container.querySelector('[data-controls]');
  function draw() {
    let drawing = '',
      control = '',
      metrics = '',
      title = '',
      observation = '',
      note = '';
    if (kind === 'pull') {
      // This experiment has a fixed 3.3 V supply, independent of the Ohm lab.
      const m = solvePull({
        mode: state.mode,
        closed: state.closed,
        vcc: 3.3,
        resistance: state.resistance,
        leakage: state.mode === 'up' ? state.leakage * 1e-6 : -state.leakage * 1e-6,
      });
      const up = state.mode === 'up',
        floating = state.mode === 'none' && !state.closed,
        high = m.logic === 'HIGH',
        volt = m.voltage === null ? '?' : `${n(m.voltage)} V`;
      const rY = up ? 70 : 190,
        swY = up || state.mode === 'none' ? 210 : 80;
      const top = up ? 'VCC · 3.3 V' : state.mode === 'down' ? 'VCC · 3.3 V' : '연결되지 않음';
      drawing = svgWrap(
        `${state.mode} ${state.closed ? '스위치 닫힘' : '스위치 열림'}, GPIO ${m.logic}, ${volt}`,
        `
        <path class="wire" data-power-supply d="M65 130V48H${state.mode === 'none' ? 105 : 155}"/>
        <path class="wire" data-power-return d="M155 268H65V210"/>
        <rect class="component" x="35" y="130" width="60" height="80" rx="8"/>
        <text class="label" x="65" y="149" text-anchor="middle">+</text><text class="label" x="65" y="175" text-anchor="middle">3.3 V</text><text class="label" x="65" y="198" text-anchor="middle">−</text>
        <text class="label" x="155" y="39" text-anchor="middle">${top}</text>
        ${state.mode !== 'none' ? `<path class="wire ${state.closed ? 'energized' : ''}" d="M155 48V${up ? 70 : 80}"/>` : ''}
        ${up ? `${resistor(155, rY, true, ohms(state.resistance))}<path class="wire energized" d="M155 140v30"/>` : state.mode === 'down' ? `${switchSvg(155, swY, state.closed)}<path class="wire" d="M155 115v55"/>` : ''}
        <path class="wire ${high ? 'energized' : ''}" d="M155 170H350"/>
        <circle class="node" cx="155" cy="170" r="5"/>
        <text class="small" x="243" y="153" text-anchor="middle">${state.leakage && state.mode !== 'none' ? `GPIO 누설 · ${state.leakage} µA` : 'GPIO 입력 · 전류 ≈ 0'}</text>
        ${state.leakage && state.mode !== 'none' ? (up ? `<path class="wire" stroke-dasharray="3 4" d="M485 170h38v52m0 24v22"/><circle class="component" cx="523" cy="234" r="12"/><path d="M523 226v15m-4-5 4 5 4-5" stroke="#9489be" stroke-width="1.5" fill="none"/>${ground(523, 268, '')}` : `<path class="wire" stroke-dasharray="3 4" d="M155 48h368v40m0 24v58h-38"/><circle class="component" cx="523" cy="100" r="12"/><path d="M523 92v15m-4-5 4 5 4-5" stroke="#9489be" stroke-width="1.5" fill="none"/>`) : ''}
        <rect x="350" y="142" width="135" height="57" rx="10" class="label-bg"/>
        <text class="label" x="417" y="164" text-anchor="middle">${floating ? 'FLOATING' : m.logic}</text>
        <text class="value" x="417" y="186" text-anchor="middle">${volt}</text>
        <text class="small" x="417" y="223" text-anchor="middle">${floating ? '전압을 정해 줄 연결이 없습니다' : '고임피던스 입력 핀'}</text>
        ${up || state.mode === 'none' ? `<path class="wire" d="M155 170v40"/>${switchSvg(155, swY, state.closed)}<path class="wire" d="M155 245v23"/>` : `<path class="wire" d="M155 170v20"/>${resistor(155, 190, true, ohms(state.resistance))}<path class="wire" d="M155 260v8"/>`}
        ${ground(155, 268)}<text class="small" x="218" y="${swY + 24}">${state.closed ? '스위치 닫힘' : '스위치 열림'}</text>
        ${state.closed && state.mode !== 'none' ? `<path class="flow ${state.electrons ? 'reverse electron' : ''}" d="M65 130V48H155V268H65V210"/>` : ''}
        <text class="small" x="417" y="259" text-anchor="middle">HIGH ≥ 0.7 × VCC</text><text class="small" x="417" y="279" text-anchor="middle">LOW ≤ 0.3 × VCC</text>`,
      );
      control =
        group(
          '입력의 기본 상태',
          segment(
            'mode',
            [
              ['up', '풀업'],
              ['down', '풀다운'],
              ['none', '저항 없음'],
            ],
            state.mode,
          ),
        ) +
        group(
          '풀 저항',
          range('resistance', 1000, 100000, 1000, state.resistance, '풀 저항'),
          ohms(state.resistance),
        ) +
        group(
          '스위치를 바꿔 보세요',
          toggle(state.closed ? '닫힘 · 누른 상태' : '열림 · 놓은 상태', state.closed),
        ) +
        group(
          '누설 전류 · 반대 레일 쪽',
          range('leakage', 0, 20, 1, state.leakage, '입력 누설 전류'),
          `${state.leakage} µA`,
        );
      metrics =
        metric('GPIO 입력 전압', m.voltage === null ? '?' : n(m.voltage), 'V') +
        metric(
          '논리 상태',
          `<span class="logic-badge ${high ? '' : floating || m.logic === 'UNDEFINED' ? 'undefined' : 'low'}">${m.logic}</span>`,
        ) +
        metric('저항 전류', n(m.current * 1000, 3), 'mA') +
        metric(
          '저항 양단 전압',
          state.mode === 'none' ? '—' : n(m.current * state.resistance),
          'V',
        );
      title = floating
        ? '연결이 없다고 LOW가 되는 것은 아닙니다'
        : state.mode === 'none'
          ? '닫힌 스위치가 입력을 GND에 연결합니다'
          : state.closed
            ? `${up ? '풀업' : '풀다운'}: 누르면 ${up ? 'LOW' : 'HIGH'}`
            : `${up ? '풀업' : '풀다운'}: 놓으면 ${up ? 'HIGH' : 'LOW'}`;
      observation = floating
        ? '스위치가 열려 있고 풀 저항도 없으므로 입력 전압은 정해지지 않습니다. 실제로는 누설·주변 잡음·남아 있는 전하에 영향을 받아 오동작할 수 있습니다.'
        : state.mode === 'none'
          ? '닫힌 스위치가 GPIO를 GND에 직접 연결하여 LOW가 됩니다. 스위치를 놓으면 전압을 유지할 저항이 없어 다시 부동 상태입니다.'
          : state.closed
            ? `전원 + → ${up ? '저항 → 스위치' : '스위치 → 저항'} → GND 도선 → 전원 −로 한 바퀴 이어집니다. GPIO는 ${up ? '전원 −와 이어진 0 V 선' : '전원 +'}에 연결되어 ${up ? 'LOW' : 'HIGH'}가 됩니다. 저항 양단에 3.3 V 차이가 생겨 ${amperes(m.current)}가 흐릅니다.`
            : `스위치가 열려도 GPIO는 ${up ? '저항을 통해 VCC' : '저항을 통해 GND'}에 연결되어 ${up ? 'HIGH' : 'LOW'}를 읽습니다. 입력 핀으로 들어가는 전류가 거의 없어 저항의 전압 강하도 거의 0입니다.`;
      note = `저항 소비 전력 ${n(m.power * 1000, 3)} mW. 이상 스위치 · 기본 누설 0 A. 누설은 반대 레일 쪽 등가 전류원이며 임계값은 예시입니다.`;
      if (state.leakage && !state.closed && state.mode !== 'none') {
        title = '풀 저항이 너무 크면 누설의 영향도 커집니다';
        observation = `스위치를 놓아도 ${state.leakage} µA의 누설 경로가 있습니다. 저항에서 I누설 × R = ${n(state.leakage * 1e-6 * state.resistance)} V가 떨어져 GPIO는 ${n(m.voltage)} V, ${m.logic}가 됩니다. 저항을 키워 문턱 사이의 미정 영역에 들어가는지 관찰하세요. 점선 가지는 누설의 등가 모델입니다.`;
      }
    }
    if (kind === 'current') {
      const m = solveCurrent(state);
      const ghigh = state.ground === 'high';
      drawing = svgWrap(
        `스위치 ${state.closed ? '닫힘' : '열림'}, 전류 ${amperes(m.current)}, ${m.direction}`,
        `
        <path class="wire ${state.closed ? 'energized' : ''}" d="M120 132V70H300m70 0h80v115${state.switchPosition === 'high' ? 'M450 220v50H120V188' : 'M450 185v85H120V250M120 215V188'}"/>
        ${voltageSource(120, 160, state.voltage, state.polarity)}${resistor(300, 70, false, ohms(state.resistance))}
        ${state.switchPosition === 'high' ? switchSvg(450, 185, state.closed) : switchSvg(120, 215, state.closed)}
        ${ghigh ? ground(230, 70, 'GND · 위 단자 기준') : `<path class="wire" d="M120 200H55V250"/>${ground(55, 250, 'GND · 아래 단자')}`}
        <text class="small" x="${state.switchPosition === 'high' ? 460 : 139}" y="${state.switchPosition === 'high' ? 160 : 241}">S1</text><text class="small" x="282" y="185" text-anchor="middle">${m.magnitude > 0 ? '닫힌 회로 · 전류가 흐릅니다' : state.closed ? '전위 차 0 V · 전류 0 A' : '열린 회로 · 정상상태 전류 0 A'}</text>
        <rect class="label-bg" x="208" y="204" width="150" height="35" rx="7"/><text class="value" x="283" y="228" text-anchor="middle">I = ${amperes(m.current)}</text>
        <text class="small" x="131" y="50">${n(m.nodeHigh)} V</text><text class="small" x="131" y="204">${n(m.nodeLow)} V</text>
        ${m.magnitude > 0 ? `<path class="flow ${state.polarity < 0 !== state.electrons ? 'reverse' : ''} ${state.electrons ? 'electron' : ''}" d="M120 132V70H450V270H120V188"/>` : ''}`,
      );
      control =
        group(
          '전원 극성',
          segment(
            'polarity',
            [
              [1, '+ 위쪽'],
              [-1, '− 위쪽'],
            ],
            state.polarity,
          ),
        ) +
        group(
          'GND 기준 노드',
          segment(
            'ground',
            [
              ['low', '아래쪽'],
              ['high', '위쪽'],
            ],
            state.ground,
          ),
        ) +
        group(
          '스위치 위치',
          segment(
            'switchPosition',
            [
              ['high', '저항 다음'],
              ['low', '전원 다음'],
            ],
            state.switchPosition,
          ),
        ) +
        group(
          '회로 연결',
          toggle(state.closed ? '닫힘 · 회로 연결' : '열림 · 회로 차단', state.closed),
        );
      metrics =
        metric('관습적 전류', n(m.current * 1000, 3), 'mA') +
        metric(
          '전류 방향',
          m.direction === 'none'
            ? '흐르지 않음'
            : m.direction === 'clockwise'
              ? '시계 방향'
              : '반시계 방향',
        ) +
        metric('위 단자 전압', n(m.nodeHigh), 'V') +
        metric('아래 단자 전압', n(m.nodeLow), 'V');
      title = state.closed
        ? '전류 방향은 두 지점의 전위 차가 정합니다'
        : '전류가 흐르려면 돌아오는 길이 필요합니다';
      observation = state.closed
        ? '저항 양단의 전위 차가 전류를 만듭니다. 전원 극성을 뒤집으면 방향이 바뀝니다. GND 표시는 측정의 0 V 기준이므로 표시 위치만 바꿔서는 실제 전류가 바뀌지 않습니다.'
        : '전원 → 저항 → 전원으로 이어지는 경로 중 한 곳이라도 열리면 전류가 멈춥니다. 이 직렬 회로에서는 스위치를 저항 앞에 두어도 뒤에 두어도 전류 차단 결과가 같습니다.';
      note =
        '이상 전원·저항 직렬 회로. GND는 전하를 없애는 곳이 아닙니다. 전자 이동은 관습적 전류의 반대입니다.';
    }
    if (kind === 'ohm') {
      const r2 = 10000;
      const r1 = state.resistance;
      const m = state.parallel
        ? solveOhm({ voltage: state.voltage, resistance: r1, parallelResistance: r2 })
        : solveDivider({ voltage: state.voltage, resistanceTop: r1, resistanceBottom: r2 });
      const { totalResistance: totalR, current } = m;
      const out = state.parallel ? state.voltage : m.voltage;
      drawing = svgWrap(
        state.parallel ? '병렬 저항의 가지 전류' : '직렬 저항 전압 분배',
        state.parallel
          ? `
        <path class="wire energized" d="M105 122V60H390V120m0 70v70H105V178M250 60v60m0 70v70"/>${voltageSource(105, 150, state.voltage)}
        ${resistor(250, 120, true, 'R1')}${resistor(390, 120, true, 'R2')}<text class="small" x="250" y="222" text-anchor="middle">${amperes(state.voltage / r1)}</text><text class="small" x="410" y="222" text-anchor="middle">${amperes(state.voltage / r2)}</text>
        ${ground(250, 260)}<text class="label" x="282" y="94">${ohms(r1)}</text><text class="label" x="402" y="94">10 kΩ</text>${current !== 0 ? `<path class="flow ${state.electrons ? 'reverse electron' : ''}" d="M105 122V60H250V260H105V178M250 60H390V260H250"/>` : ''}`
          : `
        <path class="wire energized" d="M130 120V50H300v20m0 70v35m0 70v20H130V176"/>${voltageSource(130, 148, state.voltage)}
        ${resistor(300, 70, true, `R1 ${ohms(r1)}`)}${resistor(300, 175, true, 'R2 10 kΩ')}
        <path class="wire energized" d="M300 157h125"/><circle class="node" cx="300" cy="157" r="5"/><rect class="label-bg" x="411" y="137" width="104" height="41" rx="7"/><text class="value" x="463" y="164" text-anchor="middle">${n(out)} V</text>
        ${ground(300, 265)}<text class="small" x="438" y="203" text-anchor="middle">Vout · 부하 없음</text>${current !== 0 ? `<path class="flow ${state.electrons ? 'reverse electron' : ''}" d="M130 120V50H300V265H130V176"/>` : ''}`,
      );
      control =
        group(
          '저항 연결 방식',
          segment(
            'parallel',
            [
              [false, '직렬 · 분압'],
              [true, '병렬 · 분류'],
            ],
            state.parallel,
          ),
        ) +
        group('R1 저항', range('resistance', 1000, 100000, 1000, r1, 'R1 저항'), ohms(r1)) +
        group(
          '전원 전압',
          range('voltage', 0, 5, 0.1, state.voltage, '전원 전압'),
          `${n(state.voltage, 1)} V`,
        );
      metrics =
        metric('합성 저항', n(totalR / 1000, 2), 'kΩ') +
        metric('전체 전류', n(current * 1000, 3), 'mA') +
        metric(state.parallel ? '각 가지 전압' : '분압 출력', n(out), 'V') +
        metric('전체 소비 전력', n(current * state.voltage * 1000, 2), 'mW');
      title = state.parallel ? '갈림길에서는 전류가 나뉩니다' : '저항 비율이 출력 전압을 정합니다';
      observation = state.parallel
        ? '전류는 저항이 가장 작은 한 길로만 흐르지 않습니다. 닫힌 모든 가지에 I = V/R만큼 흐르며, 각 가지 전압은 같습니다. 각 가지 전류를 합하면 전원 전류가 됩니다.'
        : '직렬 저항에는 같은 전류가 흐릅니다. Vout = VCC × R2/(R1+R2). R1을 크게 하면 출력 전압이 낮아집니다. 실제 부하를 연결하면 분압 비율도 변합니다.';
      note = '저항은 이상 소자, R2 = 10 kΩ 고정, 분압 출력의 부하 전류는 0 A로 가정합니다.';
    }
    if (kind === 'rc') {
      const tau = state.resistance * state.capacitance,
        t = state.timeRatio * tau;
      const params = {
        vcc: state.voltage,
        resistance: state.resistance,
        capacitance: state.capacitance,
        charging: state.charging,
        time: t,
      };
      const m = solveRC(params),
        samples = rcSamples(params, 101);
      const graph = chartPath(samples, 330, 80, 185, 143, 5 * tau, state.voltage || 1);
      drawing = svgWrap(
        `${state.charging ? '충전' : '방전'} ${n(state.timeRatio)} τ, 캐패시터 전압 ${n(m.voltage)} V`,
        `
        <path class="wire energized" d="M88 132V65H228v30m0 70v24m0 16v55H88V188"/>
        ${state.charging ? voltageSource(88, 160, state.voltage) : `<path class="wire energized" d="M88 132v56"/><text class="small" x="36" y="160">방전 경로</text>`}
        ${resistor(228, 95, true, 'R')}
        <path d="M208 189h40m-40 16h40" stroke="#7970cb" stroke-width="4"/><text class="label" x="263" y="202">C</text>
        <text class="small" x="228" y="45" text-anchor="middle">${ohms(state.resistance)} · ${n(state.capacitance * 1e6, 0)} µF</text>
        <rect class="label-bg" x="142" y="275" width="157" height="30" rx="6"/><text class="label" x="221" y="296" text-anchor="middle">Vc = ${n(m.voltage)} V</text>
        ${Math.abs(m.current) > 1e-7 ? `<path class="flow ${!state.charging !== state.electrons ? 'reverse' : ''} ${state.electrons ? 'electron' : ''}" d="M88 132V65H228V187M228 207V260H88V188"/>` : ''}
        <text class="small" x="322" y="61">Vc (V)</text><path class="grid" d="M330 80H515M330 151.5H515M330 223H515M330 80V223H515"/>
        <text class="small" x="322" y="85" text-anchor="end">${n(state.voltage, 1)}</text><text class="small" x="322" y="226" text-anchor="end">0</text><text class="small" x="330" y="244">0</text><text class="small" x="511" y="244" text-anchor="end">5τ</text>
        <path class="signal" d="${graph}"/>
        <path d="M${330 + (state.timeRatio / 5) * 185} 80V223" stroke="#c5bfeb" stroke-dasharray="4 4"/><circle class="node" cx="${330 + (state.timeRatio / 5) * 185}" cy="${223 - (m.voltage / (state.voltage || 1)) * 143}" r="5"/>
        <text class="small" x="422" y="277" text-anchor="middle">t = ${n(t, 2)} s · τ = ${n(tau, 2)} s</text>`,
      );
      control =
        group(
          '관찰할 과도 응답',
          segment(
            'charging',
            [
              [true, '충전'],
              [false, '방전'],
            ],
            state.charging,
          ),
        ) +
        group(
          '저항 R',
          range('resistance', 1000, 50000, 1000, state.resistance, 'RC 저항'),
          ohms(state.resistance),
        ) +
        group(
          '캐패시턴스 C',
          range('capacitance', 0.00001, 0.001, 0.00001, state.capacitance, '캐패시턴스'),
          `${n(state.capacitance * 1e6, 0)} µF`,
        ) +
        group(
          '시간 이동',
          range('timeRatio', 0, 5, 0.05, state.timeRatio, 'RC 시간'),
          `${n(state.timeRatio, 2)} τ`,
        ) +
        `<div class="control-group"><button type="button" class="switch-button" data-play><span>${timer ? '일시 정지' : '시간 흐름 재생'}</span>${icon(timer ? 'switch' : 'clock')}</button></div>`;
      metrics =
        metric('캐패시터 전압', n(m.voltage), 'V') +
        metric('순간 전류', n(m.current * 1000, 3), 'mA') +
        metric('시정수 τ', n(tau), 's') +
        metric('저장 에너지', n(m.energy * 1000, 3), 'mJ');
      title = state.charging
        ? '충전이 진행되면 전류는 줄어듭니다'
        : '저장된 에너지가 저항에서 소모됩니다';
      observation = state.charging
        ? '처음에는 캐패시터 양단 전압이 0 V이므로 전류가 가장 큽니다. 전압이 쌓일수록 저항 양단 전압과 전류가 줄어듭니다. 1τ에서 약 63.2%, 5τ에서 약 99.3% 충전됩니다.'
        : '전원을 분리한 뒤 저항을 통해 닫힌 방전 경로를 만든 모델입니다. 캐패시터 전압은 연속적으로 내려가고 저항 전류는 충전 때와 반대입니다. 전하는 유전체를 통과하지 않고 각 판에 드나듭니다.';
      note =
        '충전 시작 Vc = 0 V / 방전 시작 Vc = VCC. 모드 전환은 별도 실험 초기화입니다. ESR·누설은 생략했습니다.';
    }
    if (kind === 'logic') {
      const logic = digitalLogic({ voltage: state.vin, vcc: 3.3 });
      const y =
        state.gate === 'AND'
          ? state.a & state.b
          : state.gate === 'OR'
            ? state.a | state.b
            : state.a ^ state.b;
      const bar = (state.vin / 3.3) * 240;
      drawing = svgWrap(
        `입력 전압 ${n(state.vin)} V는 ${logic}, ${state.gate} 출력 ${y}`,
        `
        <text class="label" x="45" y="48">전압을 논리로 읽기</text>
        <rect x="65" y="85" width="72" height="170" rx="5" fill="#f3f4f9"/>
        <rect x="65" y="85" width="72" height="51" rx="4" fill="#e4f4ed"/><rect x="65" y="136" width="72" height="68" fill="#fff2dd"/><rect x="65" y="204" width="72" height="51" rx="4" fill="#ebe8fb"/>
        <text class="small" x="155" y="108">HIGH ≥ 2.31 V</text><text class="small" x="155" y="173">정의되지 않은 구간</text><text class="small" x="155" y="238">LOW ≤ 0.99 V</text>
        <path d="M50 ${255 - (state.vin / 3.3) * 170}H145" stroke="#7770cb" stroke-width="3"/><circle class="node" cx="50" cy="${255 - (state.vin / 3.3) * 170}" r="4"/><text class="value" x="100" y="287" text-anchor="middle">${n(state.vin)} V</text>
        <path class="wire" d="M330 125h45M330 195h45M450 160h50"/><rect class="component" x="375" y="100" width="75" height="120" rx="10"/>
        <text class="label" x="412" y="165" text-anchor="middle">${state.gate}</text><text class="value" x="326" y="119">${state.a}</text><text class="value" x="326" y="189">${state.b}</text><text class="value" x="511" y="165">${y}</text>
        <text class="small" x="415" y="266" text-anchor="middle">게이트 입력은 아래 A/B로 별도 조작</text>`,
      );
      control =
        group(
          '입력 핀의 전압',
          range('vin', 0, 3.3, 0.01, state.vin, '논리 입력 전압'),
          `${n(state.vin)} V`,
        ) +
        group(
          '논리 게이트',
          segment(
            'gate',
            [
              ['AND', 'AND'],
              ['OR', 'OR'],
              ['XOR', 'XOR'],
            ],
            state.gate,
          ),
        ) +
        group(
          '디지털 입력 A',
          segment(
            'a',
            [
              [0, '0'],
              [1, '1'],
            ],
            state.a,
          ),
        ) +
        group(
          '디지털 입력 B',
          segment(
            'b',
            [
              [0, '0'],
              [1, '1'],
            ],
            state.b,
          ),
        );
      metrics =
        metric(
          '핀 판정',
          `<span class="logic-badge ${logic === 'HIGH' ? '' : logic === 'LOW' ? 'low' : 'undefined'}">${logic}</span>`,
        ) +
        metric('게이트 출력', y) +
        metric('LOW 임계값', '0.99', 'V') +
        metric('HIGH 임계값', '2.31', 'V');
      title = '디지털 0과 1은 전압 범위에 붙인 이름입니다';
      observation =
        '0.99 V 이하를 LOW, 2.31 V 이상을 HIGH로 보는 3.3 V CMOS의 예시입니다. 중간 전압은 둘 중 하나로 보장되지 않습니다. 오른쪽 게이트는 별도의 이상적인 A/B 비트로 연산합니다. XOR는 두 입력이 다를 때만 1입니다.';
      note =
        '임계값과 입력 허용 전압은 소자마다 다릅니다. 실제 신호의 잡음 여유와 히스테리시스도 확인하세요.';
    }
    if (kind === 'pwm') {
      const samples = pwmSamples({ duty: state.duty, frequency: state.frequency, vcc: 3.3 }, 401);
      const duration = 2 / state.frequency;
      const path = stepChartPath(samples, 58, 80, 455, 137, duration, 3.3);
      drawing = svgWrap(
        `듀티 ${state.duty}%, 주파수 ${state.frequency} Hz PWM 파형`,
        `<text class="label" x="55" y="41">PWM · 디지털 출력 파형</text><path class="grid" d="M58 80H513M58 148.5H513M58 217H513M58 80V217"/><text class="small" x="47" y="85" text-anchor="end">3.3 V</text><text class="small" x="47" y="221" text-anchor="end">0 V</text><path class="signal" d="${path}"/><path d="M58 ${217 - (state.duty / 100) * 137}H513" stroke="#d5a15b" stroke-width="1.8" stroke-dasharray="5 5"/><text class="small" x="510" y="253" text-anchor="end">${n(duration * 1000, 2)} ms (2주기)</text><text class="small" x="58" y="253">0</text><rect class="label-bg" x="140" y="278" width="290" height="29" rx="6"/><text class="label" x="285" y="298" text-anchor="middle">평균 전압 = ${n((3.3 * state.duty) / 100)} V</text>`,
      );
      control =
        group('듀티 사이클', range('duty', 0, 100, 1, state.duty, 'PWM 듀티'), `${state.duty}%`) +
        group(
          '주파수',
          range('frequency', 100, 10000, 100, state.frequency, 'PWM 주파수'),
          `${state.frequency} Hz`,
        );
      metrics =
        metric('평균 전압', n((3.3 * state.duty) / 100), 'V') +
        metric('주기 T', n(1000 / state.frequency, 2), 'ms') +
        metric('HIGH 시간', n(((1000 / state.frequency) * state.duty) / 100, 3), 'ms') +
        metric('LOW 시간', n((1000 / state.frequency) * (1 - state.duty / 100), 3), 'ms');
      title = '평균은 아날로그처럼, 순간 출력은 0 또는 3.3 V';
      observation =
        '듀티는 한 주기 중 HIGH인 시간의 비율입니다. 주파수를 바꾸면 주기가 달라지지만 듀티가 같으면 이상적인 평균 전압은 같습니다. LED·모터의 응답이나 RC 필터를 이용하면 이 평균 효과를 활용할 수 있습니다.';
      note =
        '점선은 시간 평균입니다. 실제 핀에 그 전압이 연속 출력되는 것은 아닙니다. 출력 전류 한계를 지키세요.';
    }
    if (kind === 'adc') {
      const m = solveADC({ voltage: state.vin, vref: 3.3, bits: state.bits });
      const levels = 2 ** state.bits,
        step = 455 / Math.min(levels, 32);
      let stairs = '';
      for (let i = 0; i < Math.min(levels, 32); i++) {
        const px = 58 + i * step,
          code = Math.floor((i * levels) / Math.min(levels, 32)),
          py = 231 - (code / (levels - 1)) * 157;
        stairs += `${i ? 'L' : 'M'}${px} ${py}h${step}`;
      }
      drawing = svgWrap(
        `${state.bits}비트 ADC 입력 ${n(state.vin)} V, 코드 ${m.code}`,
        `<text class="label" x="55" y="40">연속적인 전압 → 유한한 숫자</text><path class="grid" d="M58 74V231H513M58 74H513M58 152H513"/><path d="M58 231 513 74" stroke="#e6e3f5" stroke-width="2" stroke-dasharray="4 4"/><path class="signal" d="${stairs}"/><text class="small" x="47" y="79" text-anchor="end">${levels - 1}</text><text class="small" x="47" y="235" text-anchor="end">0</text><text class="small" x="58" y="252">0 V</text><text class="small" x="510" y="252" text-anchor="end">3.3 V</text><path d="M${58 + (state.vin / 3.3) * 455} 74V231" stroke="#a5a0d2" stroke-dasharray="3 4"/><circle class="node" cx="${58 + (state.vin / 3.3) * 455}" cy="${231 - (m.code / (levels - 1)) * 157}" r="5"/><text class="small" x="285" y="285" text-anchor="middle">${state.bits > 5 ? '그래프는 가독성을 위해 32계단으로 축약 · 계산은 실제 비트 수' : '이상 ADC의 양자화 계단'}</text>`,
      );
      control =
        group(
          '아날로그 입력',
          range('vin', 0, 3.3, 0.001, state.vin, 'ADC 입력 전압'),
          `${n(state.vin, 3)} V`,
        ) +
        group(
          'ADC 해상도',
          segment(
            'bits',
            [
              [4, '4 bit'],
              [8, '8 bit'],
              [12, '12 bit'],
            ],
            state.bits,
          ),
        );
      metrics =
        metric('출력 코드', m.code) +
        metric('전체 레벨', levels) +
        metric('1 LSB', n(m.lsb * 1000, 3), 'mV') +
        metric('양자화 값', n(m.quantized, 4), 'V');
      title = '비트 수가 늘면 구별할 수 있는 전압 간격이 작아집니다';
      observation = `${state.bits}비트는 ${levels}개 코드를 표현합니다. 이 모델은 floor(Vin / Vref × 2ⁿ)을 계산하고 최댓값 ${levels - 1}로 제한합니다. 입력을 한 코드 구간 안에서 움직이면 읽는 숫자는 그대로입니다.`;
      note =
        'Vref = 3.3 V. 이상 단극 ADC, 오프셋·게인·노이즈·샘플링 오차 생략. 실제 ADC 전달함수는 데이터시트를 확인하세요.';
    }
    if (kind === 'protocol') {
      const frame = protocolFrames(state.protocol);
      const w = 452,
        start = 75;
      let lanes = '';
      frame.lanes.forEach((lane, i) => {
        const y = 70 + i * (frame.lanes.length > 3 ? 53 : 66);
        let previous = null;
        lanes += `<text class="label" x="61" y="${y + 14}" text-anchor="end">${esc(lane.name)}</text><path class="grid" d="M75 ${y + 24}H527"/>`;
        for (const s of lane.segments) {
          const x = start + (s.start / frame.duration) * w,
            xx = start + (s.end / frame.duration) * w,
            yy = y + (s.value === null ? 12 : s.value === 1 ? 0 : 24);
          if (previous && previous.value !== null && s.value !== null)
            lanes += `<path class="signal" d="M${x} ${previous.y}V${yy}"/>`;
          lanes += `<path class="signal" ${s.value === null ? 'stroke-dasharray="4 3"' : ''} d="M${x} ${yy}H${xx}"/>`;
          if (s.label)
            lanes += `<text class="small" x="${(x + xx) / 2}" y="${y + 43}" text-anchor="middle">${esc(s.label)}</text>`;
          previous = { value: s.value, y: yy };
        }
      });
      drawing = svgWrap(
        `${state.protocol.toUpperCase()} 예시 타이밍 다이어그램. Z는 고임피던스이며 LOW가 아닙니다.`,
        `<text class="label" x="55" y="35">${state.protocol.toUpperCase()} · 한 프레임의 시간 순서</text>${lanes}<path class="grid" d="M75 287H527M75 283v8M301 283v8M527 283v8"/><text class="small" x="75" y="307">0</text><text class="small" x="301" y="307" text-anchor="middle">${frame.duration / 2}</text><text class="small" x="527" y="307" text-anchor="end">${frame.duration} 비트 시간 →</text>`,
      );
      control = group(
        '통신 방식',
        segment(
          'protocol',
          [
            ['i2c', 'I²C'],
            ['spi', 'SPI'],
            ['uart', 'UART'],
          ],
          state.protocol,
        ),
      );
      metrics =
        metric('동기 방식', state.protocol === 'uart' ? '비동기' : '동기') +
        metric('클록 선', state.protocol === 'uart' ? '없음' : '있음') +
        metric(
          '선의 역할',
          state.protocol === 'i2c'
            ? 'SDA / SCL'
            : state.protocol === 'spi'
              ? 'MOSI / SCK'
              : 'TX / RX',
        ) +
        metric('버스 출력', state.protocol === 'i2c' ? '오픈드레인' : '예시 파형');
      title =
        state.protocol === 'i2c'
          ? 'I²C의 HIGH는 풀업 저항이 만듭니다'
          : state.protocol === 'spi'
            ? 'SPI는 클록의 정해진 에지에서 비트를 읽습니다'
            : 'UART는 시작 비트로 수신 타이밍을 맞춥니다';
      observation = frame.description;
      note =
        '교육용 시간축이며 전기적 상승/하강시간은 생략했습니다. 연결 시 전압 레벨과 공통 GND를 먼저 확인하세요.';
    }
    if (kind === 'memory') {
      const value = state.byte;
      let cells = '';
      for (let i = 7; i >= 0; i--) {
        let x = 53 + (7 - i) * 60;
        cells += `<rect class="memory-cell ${value & (1 << i) ? 'active' : ''}" x="${x}" y="91" width="49" height="57" rx="7"/><text class="small" x="${x + 24}" y="76" text-anchor="middle">bit ${i}</text><text class="value" x="${x + 24}" y="126" text-anchor="middle">${(value >> i) & 1}</text>`;
      }
      drawing = svgWrap(
        `레지스터 8비트 값 ${value}, 0x${value.toString(16).toUpperCase().padStart(2, '0')}`,
        `<text class="label" x="54" y="35">8-bit 레지스터 · 비트를 직접 바꿔 보세요</text>${cells}<text class="small" x="54" y="178">MSB · 최상위 비트</text><text class="small" x="521" y="178" text-anchor="end">LSB · 최하위 비트</text><rect class="label-bg" x="53" y="213" width="464" height="61" rx="9"/><text class="label" x="75" y="237">메모리 맵 예시</text><text class="small" x="75" y="257">주소 0x4000_0000 → GPIO 출력 레지스터</text><text class="value" x="495" y="250" text-anchor="end">0x${value.toString(16).toUpperCase().padStart(2, '0')}</text><text class="small" x="55" y="304">주소는 위치, 값은 그 위치에 저장된 데이터입니다.</text>`,
      );
      control =
        group(
          '조작할 비트',
          `<select data-select="bit" aria-label="조작할 비트">${Array.from({ length: 8 }, (_, i) => `<option value="${i}" ${i === state.bit ? 'selected' : ''}>bit ${i} · 2^${i} = ${2 ** i}</option>`).join('')}</select>`,
        ) +
        group(
          '비트 값',
          `<div class="segmented"><button data-bit-op="set">SET · 1</button><button data-bit-op="clear">CLEAR · 0</button><button data-bit-op="toggle">TOGGLE</button></div>`,
        ) +
        group('전체 값', range('byte', 0, 255, 1, value, '8비트 레지스터 값'), String(value));
      metrics =
        metric('10진수', value) +
        metric('16진수', `0x${value.toString(16).toUpperCase().padStart(2, '0')}`) +
        metric('비트 마스크', `1 &lt;&lt; ${state.bit}`) +
        metric('선택 비트', (value >> state.bit) & 1);
      title = '다른 비트는 유지하며 원하는 비트만 바꿉니다';
      observation = `SET은 value | (1 << ${state.bit}), CLEAR는 value & ~(1 << ${state.bit}), TOGGLE은 value ^ (1 << ${state.bit})입니다. 실제 주변장치 레지스터에는 읽기 전용, 쓰면 지워짐 등 특별한 동작이 있으므로 단순 read-modify-write가 항상 안전하지는 않습니다.`;
      note =
        '8비트 교육 모델입니다. 주소는 예시이며 특정 MCU의 실제 레지스터 주소를 의미하지 않습니다.';
    }
    stage.innerHTML = drawing;
    syncControls(controls, control);
    const metricsNode = container.querySelector('[data-metrics]');
    metricsNode.setAttribute('aria-live', timer ? 'off' : 'polite');
    metricsNode.innerHTML = metrics;
    for (const [selector, text] of [
      ['[data-observation-title]', title],
      ['[data-observation]', observation],
      ['[data-note]', note],
    ]) {
      const node = container.querySelector(selector);
      if (node.textContent !== text) node.textContent = text;
    }
    container.querySelector('[data-flow-label]').textContent = state.electrons
      ? '전자 이동 (− → +)'
      : '관습적 전류 (+ → −)';
    const electronButton = container.querySelector('[data-electrons]');
    if (electronButton)
      electronButton.textContent = state.electrons ? '관습적 전류 보기' : '전자 이동 보기';
  }
  function update(key, value) {
    state[key] = value;
    saved = { ...state };
    draw();
  }
  function handleInput(e) {
    if (!e.target.matches('[data-range]')) return;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    update(e.target.dataset.range, Number(e.target.value));
  }
  function handleClick(e) {
    const set = e.target.closest('[data-set]');
    if (set) {
      let value = set.dataset.value;
      if (['true', 'false'].includes(value)) value = value === 'true';
      else if (['polarity', 'a', 'b', 'bits'].includes(set.dataset.set)) value = Number(value);
      update(set.dataset.set, value);
      const target = Array.from(container.querySelectorAll('[data-set]')).find(
        (x) => x.dataset.set === set.dataset.set && x.dataset.value === set.dataset.value,
      );
      target?.focus({ preventScroll: true });
    }
    const togg = e.target.closest('[data-toggle]');
    if (togg) {
      update(togg.dataset.toggle, !state[togg.dataset.toggle]);
      container
        .querySelector(`[data-toggle="${togg.dataset.toggle}"]`)
        ?.focus({ preventScroll: true });
    }
    if (e.target.closest('[data-electrons]')) update('electrons', !state.electrons);
    const bit = e.target.closest('[data-bit-op]');
    if (bit) {
      const mask = 1 << state.bit;
      update(
        'byte',
        bit.dataset.bitOp === 'set'
          ? state.byte | mask
          : bit.dataset.bitOp === 'clear'
            ? state.byte & ~mask
            : state.byte ^ mask,
      );
      container
        .querySelector(`[data-bit-op="${bit.dataset.bitOp}"]`)
        ?.focus({ preventScroll: true });
    }
    if (e.target.closest('[data-play]')) {
      if (timer) {
        clearInterval(timer);
        timer = null;
        draw();
      } else {
        if (state.timeRatio >= 5) state.timeRatio = 0;
        timer = setInterval(() => {
          state.timeRatio = Math.min(5, state.timeRatio + 0.05);
          if (state.timeRatio >= 5) {
            clearInterval(timer);
            timer = null;
          }
          saved = { ...state };
          draw();
        }, 70);
        draw();
      }
    }
  }
  function handleChange(e) {
    if (e.target.matches('[data-select]')) update(e.target.dataset.select, Number(e.target.value));
  }
  container.addEventListener('input', handleInput);
  container.addEventListener('click', handleClick);
  container.addEventListener('change', handleChange);
  draw();
  return () => {
    clearInterval(timer);
    container.removeEventListener('input', handleInput);
    container.removeEventListener('click', handleClick);
    container.removeEventListener('change', handleChange);
  };
}
