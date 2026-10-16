import { solveCurrent } from './sim/models.js';
import { icon } from './icons.js';

const state = { step: 1, closed: false, returnConnected: true };

/** Show the whole external loop before teaching the ground-symbol abbreviation. */
export function mountFoundations(container) {
  function draw(focusSelector) {
    const circuit = solveCurrent({
      voltage: 3.3,
      resistance: 10000,
      closed: state.closed && state.returnConnected,
    });
    const flowing = circuit.magnitude > 0;
    const resistorDrop = circuit.magnitude * 10000;
    const afterResistor = 3.3 - resistorDrop;
    const titles = [
      '전압이 있어도, 전류가 흐르지 않을 수 있습니다.',
      flowing
        ? '스위치를 닫으면, 전원으로 돌아오는 길이 완성됩니다.'
        : '열린 틈 하나가 전체 전류의 길을 끊습니다.',
      state.returnConnected
        ? '이 회로에서는 전원 −와 이어진 선을 GND라고 부릅니다.'
        : '스위치가 닫혀 있어도, 돌아오는 선이 끊기면 전류는 0입니다.',
    ];
    const explanations = [
      '전원은 +와 − 두 단자 사이에 3.3 V의 차이를 유지합니다. −단자를 0 V 기준으로 잡으면 +단자는 3.3 V입니다. 지금은 스위치의 틈 때문에 고리가 완성되지 않았으므로 저항 전류가 0입니다.',
      flowing
        ? '선을 한 바퀴 따라가 보세요. 전원 + → 저항 → 닫힌 스위치 → 아래쪽 도선 → 전원 −로 이어집니다. 전원이 유지하는 전압 차이 때문에 이 닫힌 경로로 전류가 흐릅니다. 저항은 전하를 없애지 않고 전달받은 에너지를 열로 바꿉니다.'
        : '위쪽 선에는 전압이 있지만, 스위치의 열린 틈을 건너 돌아갈 수 없습니다. 이 직렬 회로에서는 저항 앞과 뒤 모두 정상상태 전류가 0입니다. 스위치를 닫아 두 단자를 이어 보세요.',
      state.returnConnected
        ? 'GND 표시는 이 도선을 0 V의 기준으로 부른다는 뜻입니다. 전류는 표시 안에서 사라지지 않고, 이 도선을 따라 전원 −단자로 이어집니다. 일반 회로도는 이 귀환선을 GND 기호로 줄여 그리는 경우가 많습니다.'
        : '끊어진 틈 때문에 전원 −단자까지 이어지지 않습니다. GND 기호가 있다고 회로가 저절로 연결되지는 않습니다. 귀환선을 다시 연결해야 고리가 완성되고 전류가 흐릅니다.',
    ];
    const lowerWire = state.returnConnected
      ? 'M450 185V260H120V200'
      : 'M450 185V260H330M260 260H120V200';
    const svg = `<svg class="circuit-svg foundation-svg" viewBox="0 0 600 340" role="img" aria-label="전원의 양단과 귀환선을 모두 그린 회로. 스위치 ${state.closed ? '닫힘' : '열림'}, 귀환선 ${state.returnConnected ? '연결' : '끊김'}, 저항 전류 ${(circuit.magnitude * 1000).toFixed(2)} mA"><title>전류는 전원 +에서 부하를 거쳐 전원 −로 돌아옵니다.</title>
      <path class="wire" d="M120 120V60H260M330 60H450V145${lowerWire}"/>
      <rect class="component" x="88" y="120" width="64" height="80" rx="9"/>
      <text class="label" x="120" y="139" text-anchor="middle">+</text><text class="label" x="120" y="166" text-anchor="middle">3.3 V</text><text class="label" x="120" y="190" text-anchor="middle">−</text>
      <text class="small" x="120" y="108" text-anchor="middle">전원 · 배터리</text>
      <rect class="component" x="260" y="49" width="70" height="22" rx="2"/><text class="label" x="295" y="20" text-anchor="middle">저항 10 kΩ</text>
      <text class="small" x="295" y="96" text-anchor="middle">저항 양단 전압 ${resistorDrop.toFixed(2)} V</text>
      <circle class="node" cx="210" cy="60" r="4"/><text class="small" x="210" y="45" text-anchor="middle">3.3 V</text>
      <circle class="node" cx="375" cy="60" r="4"/><text class="small" x="375" y="45" text-anchor="middle">${afterResistor.toFixed(1)} V</text>
      <circle class="component" cx="450" cy="145" r="4"/><circle class="component" cx="450" cy="185" r="4"/><path d="M450 185${state.closed ? 'V145' : 'l30-34'}" stroke="#7970bd" stroke-width="3" fill="none" stroke-linecap="round"/>
      <text class="small" x="480" y="170">${state.closed ? '스위치 닫힘' : '스위치 열림'}</text>
      <text class="small" x="295" y="156" text-anchor="middle">저항을 흐르는 전류</text><text class="value" x="295" y="190" text-anchor="middle">${(circuit.magnitude * 1000).toFixed(2)} mA</text>
      <text class="small" x="295" y="219" text-anchor="middle">${flowing ? '돌아오는 길까지 연결됨' : '고리 중 한 곳이 끊어짐'}</text>
      ${flowing ? '<path class="flow" d="M120 120V60H450V260H120V200"/><path class="current-arrow" d="M385 55l10 5-10 5ZM445 225l5 10 5-10ZM335 255l-10 5 10 5ZM115 95l5-10 5 10Z"/>' : ''}
      ${state.returnConnected ? '<text class="small" x="330" y="288" text-anchor="middle">전원 −로 돌아가는 도선</text>' : '<circle class="component" cx="260" cy="260" r="4"/><circle class="component" cx="330" cy="260" r="4"/><text class="small" x="330" y="289" text-anchor="middle">귀환선 끊김</text>'}
      ${state.step === 3 ? '<path class="ground" d="M120 260v31m-18 0h36m-29 7h22m-16 7h10"/><text class="label" x="120" y="330" text-anchor="middle">GND · 0 V</text>' : '<text class="small" x="120" y="310" text-anchor="middle">−단자 기준 0 V</text>'}
    </svg>`;
    container.innerHTML = `<section class="foundation" aria-label="전류와 그라운드 첫걸음"><div class="foundation-heading"><span class="section-index">START HERE</span><h2>왜 스위치를 닫으면 GND로 전류가 흐를까요?</h2></div><p class="foundation-intro">GND 기호를 보기 전에, 전원의 두 단자와 실제 도선을 먼저 따라가 보세요.</p><div class="foundation-steps" role="group" aria-label="기초 설명 단계">${['전압 차이', '닫힌 전류의 길', 'GND와 귀환선'].map((name, i) => `<button type="button" data-f-step="${i + 1}" aria-pressed="${state.step === i + 1}"><span>${i + 1}</span>${name}</button>`).join('')}</div><div class="foundation-body"><div class="foundation-stage">${svg}<div class="foundation-legend">움직이는 점: 관습적 전류의 방향 (+ → −, 외부 회로)</div></div><div class="foundation-explanation"><h3 data-foundation-title>${titles[state.step - 1]}</h3><p data-foundation-text>${explanations[state.step - 1]}</p><div class="foundation-actions">${state.step >= 2 ? `<button class="switch-button" data-f-switch aria-pressed="${state.closed}"><span>${state.closed ? '스위치 열기' : '스위치 닫기'}</span><span class="toggle" aria-hidden="true"></span></button>` : ''}${state.step === 3 ? `<button class="foundation-return" data-f-return aria-pressed="${!state.returnConnected}">${state.returnConnected ? '아래쪽 귀환선을 끊어 보기' : '귀환선을 다시 연결하기'}</button>` : ''}${state.step < 3 ? `<button class="primary-button" data-f-next>${state.step === 1 ? '스위치를 바꿔 보세요' : '이제 GND 이름 붙이기'} ${icon('arrow')}</button>` : ''}</div><p class="foundation-state" role="status" data-foundation-state>스위치 ${state.closed ? '닫힘' : '열림'} · 귀환선 ${state.returnConnected ? '연결' : '끊김'} → 저항 전류 ${(circuit.magnitude * 1000).toFixed(2)} mA</p></div></div><p class="foundation-conclusion">${state.step === 1 ? '전압은 두 지점 사이의 차이, 전류는 전하의 이동입니다.' : state.step === 2 ? '전류가 흐르려면 전압 차이와 돌아오는 연결 경로가 함께 필요합니다.' : '이 예시에서 “GND로 흐른다”는 말은 “전원 −로 이어진 귀환선을 흐른다”는 뜻입니다.'}</p></section>`;
    if (focusSelector) container.querySelector(focusSelector)?.focus({ preventScroll: true });
  }
  function selectStep(next) {
    state.step = next;
    state.returnConnected = true;
    state.closed = next === 3;
    draw(`[data-f-step="${next}"]`);
  }
  function onClick(event) {
    const step = event.target.closest('[data-f-step]');
    if (step) return selectStep(Number(step.dataset.fStep));
    if (event.target.closest('[data-f-next]')) return selectStep(state.step + 1);
    if (event.target.closest('[data-f-switch]')) {
      state.closed = !state.closed;
      draw('[data-f-switch]');
    }
    if (event.target.closest('[data-f-return]')) {
      state.returnConnected = !state.returnConnected;
      draw('[data-f-return]');
    }
  }
  container.addEventListener('click', onClick);
  draw();
  return () => container.removeEventListener('click', onClick);
}
