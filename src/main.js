import './styles.css';
import { icon, escapeHTML as esc } from './icons.js';
import { experiments, mountExperiment } from './experiments.js';
import { lessons } from './data/lessons.js';

const base = import.meta.env.BASE_URL;
const categories = [
  {
    id: 'electricity',
    title: '전기와 회로의 기초',
    short: '전기 기초',
    icon: 'circuit',
    description: '전압, 전류와 돌아오는 길',
  },
  {
    id: 'components',
    title: '전자부품과 아날로그',
    short: '전자부품',
    icon: 'resistor',
    description: '저항부터 전원과 신호까지',
  },
  {
    id: 'digital',
    title: '디지털과 논리',
    short: '디지털 논리',
    icon: 'grid',
    description: '0과 1, 신호의 약속',
  },
  {
    id: 'mcu',
    title: 'MCU와 컴퓨터 구조',
    short: 'MCU 구조',
    icon: 'chip',
    description: '프로세서, 메모리와 주변장치',
  },
  {
    id: 'interfaces',
    title: '인터페이스와 통신',
    short: '인터페이스',
    icon: 'graph',
    description: '장치와 장치가 대화하는 방법',
  },
  {
    id: 'firmware',
    title: '펌웨어와 운영체제',
    short: '펌웨어',
    icon: 'book',
    description: '코드가 하드웨어를 움직이는 과정',
  },
];
const categoryFor = (id) =>
  categories.find((c) => c.id === id) || { title: id, short: id, icon: 'book' };
let completed = new Set(),
  storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem('embedded-atlas-progress') || '[]');
  if (Array.isArray(saved))
    completed = new Set(saved.filter((id) => lessons.some((l) => l.id === id)));
} catch {
  storageAvailable = false;
}
let activeTab = 'lab',
  activeExperiment = 'pull',
  filter = 'all',
  query = '',
  cleanup = () => {},
  manifest = null,
  sourceQuery = '';
let correctAnswers = new Set();
const app = document.querySelector('#app');
const progressPercent = () => Math.round((completed.size / lessons.length) * 100);
const navItem = (label, ico, id, active, count) =>
  `<button class="nav-item ${active ? 'active' : ''}" data-nav="${id}" ${active ? 'aria-current="page"' : ''}>${ico ? icon(ico) : '<span class="nav-dot"></span>'}<span>${label}</span>${count === undefined ? '' : `<span class="count">${count}</span>`}</button>`;
const labelLevel = (v) =>
  typeof v === 'number' ? ['입문', '입문', '기초', '확장'][Math.min(v, 3)] : esc(v || '기초');
const lessonButton = (l, extra = '') =>
  `<button class="prerequisite" data-lesson="${esc(l.id)}">${esc(l.title)} ${extra}</button>`;

function shell() {
  app.innerHTML = `<div class="layout"><aside class="sidebar" aria-label="주 탐색"><a class="brand" href="#lab"> <span class="brand-icon">${icon('circuit')}</span><span><strong>Embedded Atlas</strong><small>SEE. EXPLORE. UNDERSTAND.</small></span></a><nav><div class="side-label">WORKSPACE</div><div data-main-nav></div></nav><nav><div class="side-label">LEARNING PATH</div>${categories.map((c) => navItem(c.short, null, `category/${c.id}`, false, lessons.filter((l) => l.category === c.id).length)).join('')}</nav><nav><div class="side-label">RESOURCES</div>${navItem('출처와 학습 안내', 'source', 'sources', false)}<a class="nav-item" href="${base}architecture.html" target="_blank" rel="noopener">${icon('graph')}프로젝트 구조도 ${icon('source')}</a></nav><div class="side-progress"><div class="row"><strong>나의 학습 여정</strong><span data-progress-count></span></div><div class="progress-track"><div class="progress-fill" data-progress-fill></div></div><p>${storageAvailable ? '작은 이해가 모여, 단단한 기초로.' : '저장 공간에 접근할 수 없어 이번 방문에서만 기록됩니다.'}</p></div><div class="side-footer"><span></span>브라우저에서 바로 실험하세요</div></aside><div class="sidebar-backdrop" hidden></div><div class="workspace"><header class="topbar"><button class="mobile-menu" aria-label="메뉴 열기" aria-expanded="false">${icon('menu')}</button><div class="breadcrumb"><span class="home-crumb">학습 공간</span><span class="home-crumb">/</span><strong data-breadcrumb>회로 실험실</strong></div><div class="top-actions"><span class="edition">INTERACTIVE LEARNING</span><a class="github-link" href="https://github.com/hundong2/embedded" target="_blank" rel="noopener">${icon('github')}<span class="github-text">View on GitHub</span>${icon('source')}</a></div></header><main id="main-content"><div data-page></div><footer class="page-footer"><span>© ${new Date().getFullYear()} Embedded Atlas · 이해는 직접 해 보는 데서 시작됩니다.</span><div class="footer-links"><a href="#sources">출처 및 모델 가정</a><a href="https://recipes.tistory.com/" target="_blank" rel="noopener">임베디드 레시피 ↗</a></div></footer></main></div></div>`;
  app.addEventListener('click', onAppClick);
  document.querySelector('.skip-link').addEventListener('click', (e) => {
    e.preventDefault();
    const main = app.querySelector('main');
    main.tabIndex = -1;
    main.focus();
    main.scrollIntoView();
  });
  app
    .querySelector('.mobile-menu')
    .addEventListener('click', () =>
      setMobileMenu(!app.querySelector('.sidebar').classList.contains('open')),
    );
  app.querySelector('.sidebar-backdrop').addEventListener('click', () => setMobileMenu(false));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMobileMenu(false);
  });
  window.addEventListener('resize', () => {
    if (!app.querySelector('.sidebar').classList.contains('open'))
      app.querySelector('.sidebar').inert = window.matchMedia('(max-width:760px)').matches;
  });
  setMobileMenu(false);
  updateProgress();
}
function setMobileMenu(open) {
  const side = app.querySelector('.sidebar');
  const hadFocus = side.contains(document.activeElement);
  side.classList.toggle('open', open);
  side.inert = !open && window.matchMedia('(max-width:760px)').matches;
  app.querySelector('.sidebar-backdrop').hidden = !open;
  app.querySelector('.mobile-menu').setAttribute('aria-expanded', String(open));
  if (open) side.querySelector('a,button')?.focus();
  else if (hadFocus) app.querySelector('.mobile-menu').focus();
}
function updateProgress() {
  app.querySelector('[data-progress-count]').textContent = `${completed.size} / ${lessons.length}`;
  app.querySelector('[data-progress-fill]').style.width = `${progressPercent()}%`;
}
function updateNav() {
  app.querySelector('[data-main-nav]').innerHTML =
    navItem('회로 실험실', 'circuit', 'lab', activeTab === 'lab') +
    navItem('학습 로드맵', 'map', 'roadmap', activeTab === 'roadmap') +
    navItem('전체 강의', 'book', 'lessons', activeTab === 'lessons', lessons.length);
  app
    .querySelectorAll('[data-nav^="category/"]')
    .forEach((b) =>
      b.classList.toggle(
        'active',
        activeTab === 'lessons' && filter === b.dataset.nav.split('/')[1],
      ),
    );
  app.querySelector('[data-nav="sources"]').classList.toggle('active', activeTab === 'sources');
  app.querySelector('[data-breadcrumb]').textContent = {
    lab: '회로 실험실',
    roadmap: '학습 로드맵',
    lessons: '전체 강의',
    sources: '출처와 학습 안내',
    lesson: '학습 노트',
  }[activeTab];
}
function tabs() {
  return `<div class="tabs" role="navigation" aria-label="학습 보기">${[
    ['lab', '회로 실험실'],
    ['roadmap', '학습 로드맵'],
    ['lessons', '전체 강의'],
    ['sources', '출처 · 안내'],
  ]
    .map(
      ([id, t]) =>
        `<a href="#${id}" class="tab ${activeTab === id ? 'active' : ''}" ${activeTab === id ? 'aria-current="page"' : ''}>${t}${id === 'lessons' ? `<span>${lessons.length}</span>` : ''}</a>`,
    )
    .join('')}</div>`;
}
function intro() {
  return `<div class="intro"><div><div class="eyebrow">YOUR EMBEDDED JOURNEY STARTS HERE</div><h1>${activeTab === 'lab' ? '전류의 흐름을, 눈으로 이해하세요.' : activeTab === 'roadmap' ? '흩어진 개념을, 하나의 지도로.' : activeTab === 'sources' ? '배움의 근거를 투명하게.' : '기초부터 차근차근, 나만의 속도로.'}</h1><p>${activeTab === 'lab' ? '스위치를 누르고, 저항을 바꾸며 회로의 변화를 직접 살펴보세요.<br>외우던 전기·전자 개념이 이해하는 지식으로 바뀝니다.' : activeTab === 'roadmap' ? '전기 기초에서 펌웨어까지, 개념 사이의 연결을 따라가 보세요.<br>각 강의에서 먼저 알아야 할 개념을 함께 안내합니다.' : activeTab === 'sources' ? '원문은 존중하고, 학습 자료는 새롭게 만듭니다.<br>참고한 자료, 확인 범위와 시뮬레이션의 가정을 공개합니다.' : `임베디드 개발에 필요한 ${lessons.length}개 주제를 실험과 시각 자료로 만나보세요.<br>학습 기록은 이 브라우저에 저장됩니다.`}</p></div><span class="intro-badge">${icon('check')}설치 없이, 브라우저에서</span></div>${tabs()}`;
}
function heading(index, title, sub = '') {
  return `<div class="section-heading"><h2><span class="section-index">${index}</span>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>`;
}
function render() {
  cleanup();
  cleanup = () => {};
  updateNav();
  const page = app.querySelector('[data-page]');
  if (activeTab === 'lesson') {
    renderLesson(page);
    return;
  }
  page.innerHTML = intro() + `<div data-content></div>`;
  const content = page.querySelector('[data-content]');
  if (activeTab === 'lab') renderLab(content);
  else if (activeTab === 'lessons') renderCatalog(content);
  else if (activeTab === 'roadmap') renderRoadmap(content);
  else if (activeTab === 'sources') renderSources(content);
}
const insights = {
  pull: [
    [
      'switch',
      '스위치를 놓으면 어떻게 될까요?',
      '풀 저항이 입력 핀의 기본 전압을 정합니다. 풀업은 HIGH, 풀다운은 LOW로 안정시킵니다.',
    ],
    [
      'resistor',
      '저항은 왜 꼭 필요할까요?',
      '스위치를 눌렀을 때 전원과 GND 사이의 전류를 제한하고 단락을 막아 줍니다.',
    ],
    [
      'bulb',
      '전류 없이도 HIGH일 수 있나요?',
      '전압과 전류는 다릅니다. 고임피던스 입력은 전류를 거의 소비하지 않고 전압을 읽습니다.',
    ],
  ],
  current: [
    [
      'circuit',
      '전기는 어디로 돌아갈까요?',
      '닫힌 경로가 있어야 지속적인 전류가 흐릅니다. GND도 전원으로 이어지는 경로의 일부입니다.',
    ],
    [
      'switch',
      '스위치를 옮기면 달라질까요?',
      '직렬 회로에서는 어느 한 곳을 끊어도 전체 전류가 멈춥니다.',
    ],
    [
      'source',
      'GND와 마이너스는 같을까요?',
      'GND는 선택한 0 V 기준입니다. 기준만 옮겨도 전압 표시는 달라지지만 실제 전류는 같습니다.',
    ],
  ],
  rc: [
    [
      'capacitor',
      '캐패시터는 전하를 저장합니다',
      '양쪽 판에 전하가 쌓이며 전압이 바뀝니다. 이상적인 DC 정상상태에서는 전류가 0에 가까워집니다.',
    ],
    [
      'clock',
      '시정수는 회로의 시간 척도입니다',
      'τ = R × C. 저항이나 용량을 크게 하면 충전과 방전 모두 느려집니다.',
    ],
    [
      'wave',
      '처음과 나중의 전류가 다릅니다',
      '전압이 쌓일수록 충전 전류는 줄어듭니다. 방전하면 저장 전압이 반대 방향 전류를 만듭니다.',
    ],
  ],
};
function renderLab(c) {
  const info = experiments.find((x) => x.id === activeExperiment);
  const cards = insights[activeExperiment] || [
    [
      'bulb',
      '직접 바꾸며 결과를 확인하세요',
      '설정 하나를 바꾸고 파형, 값과 설명이 어떻게 바뀌는지 비교해 보세요.',
    ],
    [
      'graph',
      '수식과 그림을 연결하세요',
      '강의에서 개념을 확인하고, 실험에서 수치와 신호의 관계를 확인할 수 있습니다.',
    ],
    [
      'book',
      '실제 장치의 조건을 확인하세요',
      '이상 모델로 원리를 이해한 뒤 데이터시트의 전압, 시간과 전류 조건을 확인하세요.',
    ],
  ];
  c.innerHTML =
    heading('01', '직접 해 보는 회로 실험실', '한 번의 조작, 하나의 새로운 이해') +
    `<div class="experiment-switcher" role="group" aria-label="실험 선택">${experiments.map((e) => `<button class="experiment-chip ${e.id === activeExperiment ? 'active' : ''}" data-experiment="${e.id}" aria-pressed="${e.id === activeExperiment}">${icon(e.icon)}${e.title}</button>`).join('')}</div><div data-experiment-host></div>` +
    heading('02', '이 실험에서 이해할 것', '원리를 연결하면 응용이 쉬워집니다') +
    `<div class="understand-grid">${cards.map(([ico, t, p], i) => `<article class="insight"><div class="insight-top"><span class="insight-icon">${icon(ico)}</span><span class="insight-number">0${i + 1}</span></div><h3>${t}</h3><p>${p}</p><button class="text-button" data-related="${activeExperiment}" data-related-index="${i}">개념 더 알아보기 ${icon('arrow')}</button></article>`).join('')}</div><div class="continue-banner"><div class="banner-icon">${icon('map')}</div><div><h3>실험의 발견을, 단단한 기초 지식으로.</h3><p>전기부터 임베디드 소프트웨어까지, 연결된 학습 경로를 따라가 보세요.</p></div><button data-nav="roadmap">학습 로드맵 보기 →</button></div>`;
  cleanup = mountExperiment(c.querySelector('[data-experiment-host]'), activeExperiment);
}
function renderCatalog(c) {
  c.innerHTML = `<label class="search-box">${icon('search')}<input type="search" data-search placeholder="어떤 개념이 궁금한가요?" aria-label="강의 검색" value="${esc(query)}"></label><div class="filter-row" role="group" aria-label="강의 분류">${[{ id: 'all', short: '전체' }, ...categories].map((cat) => `<button class="filter-chip ${filter === cat.id ? 'active' : ''}" data-filter="${cat.id}" aria-pressed="${filter === cat.id}">${cat.short}</button>`).join('')}</div><div class="lesson-count" data-lesson-count aria-live="polite"></div><div class="lesson-grid" data-lesson-grid></div>`;
  c.querySelector('[data-search]').addEventListener('input', (e) => {
    query = e.target.value;
    renderCards();
  });
  renderCards();
}
function renderCards() {
  const found = lessons.filter(
    (l) =>
      (filter === 'all' || l.category === filter) &&
      `${l.title} ${l.summary} ${(l.objectives || []).join(' ')}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  app.querySelector('[data-lesson-count]').textContent =
    `${found.length}개의 학습 노트 ${filter !== 'all' ? `· ${categoryFor(filter).short}` : ''}`;
  app.querySelector('[data-lesson-grid]').innerHTML =
    found
      .map(
        (l) =>
          `<article class="lesson-card"><div class="lesson-category">${icon(categoryFor(l.category).icon)}${categoryFor(l.category).short}${completed.has(l.id) ? '<span class="done">✓ 학습 완료</span>' : ''}</div><h3>${esc(l.title)}</h3><p>${esc(l.summary)}</p><div class="lesson-meta"><span>${labelLevel(l.level)} · ${l.minutes}분</span><span>실험하며 학습 →</span></div><button class="lesson-open" data-lesson="${esc(l.id)}" aria-label="${esc(l.title)} 학습하기"></button></article>`,
      )
      .join('') ||
    '<div class="empty-state">일치하는 강의가 없습니다. 다른 단어나 분류로 찾아보세요.</div>';
}
function renderRoadmap(c) {
  const paths = categories.map((cat) => ({
    cat,
    items: lessons.filter((l) => l.category === cat.id),
  }));
  let graph =
    '<svg viewBox="0 0 840 230" role="img" aria-label="전기 기초, 전자부품, 디지털 논리, MCU 구조, 인터페이스, 펌웨어의 연결"><title>개념 학습 경로</title><defs><marker id="road-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="m0 0 6 3-6 3" fill="none" stroke="#cbc5e3"/></marker></defs>';
  const nodes = [
    [32, 85],
    [296, 25],
    [296, 145],
    [555, 25],
    [555, 145],
    [692, 85],
  ];
  const links = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [3, 4],
    [3, 5],
    [4, 5],
  ];
  for (const [a, b] of links) {
    const [ax, ay] = nodes[a],
      [bx, by] = nodes[b];
    graph += `<path d="M${ax + 115} ${ay + 25}C${(ax + bx + 115) / 2} ${ay + 25} ${(ax + bx + 115) / 2} ${by + 25} ${bx - 5} ${by + 25}" fill="none" stroke="#d7d2e6" stroke-width="1.5" marker-end="url(#road-arrow)"/>`;
  }
  paths.forEach(({ cat, items }, i) => {
    const [x, y] = nodes[i];
    graph += `<a class="graph-node" href="#category/${cat.id}" aria-label="${cat.short} 강의 보기"><rect x="${x}" y="${y}" width="115" height="50" rx="9" fill="${i === 0 ? '#efecfb' : '#f8f8fc'}" stroke="#e5e2ef"/><text x="${x + 57.5}" y="${y + 23}" text-anchor="middle" font-size="12" fill="#746a9e">${cat.short}</text><text x="${x + 57.5}" y="${y + 39}" text-anchor="middle" font-size="8" fill="#a69ebb">${items.length} LESSONS</text></a>`;
  });
  graph += '</svg>';
  c.innerHTML = `<div class="roadmap-intro"><div><h3>기초부터, 연결하며 이해하기</h3><p>아래는 권장 학습 순서입니다. 강의별 선수 개념은 각 학습 노트에서 확인할 수 있습니다.<br>모든 개념과 선수 관계는 저장소의 지식 그래프로도 관리합니다.</p></div><div class="roadmap-count">${lessons.length}<small>CONNECTED LESSONS</small></div></div><div class="graph-view">${graph}<div class="graph-caption">범주 사이의 권장 흐름 · 범주를 선택하거나 아래에서 강의를 선택하세요. <a href="${base}data/knowledge-graph.json" target="_blank" rel="noopener">전체 지식 그래프 JSON ↗</a></div></div>${paths.map(({ cat, items }, i) => `<section class="roadmap-section"><div class="roadmap-section-head">0${i + 1} · ${cat.title}<span>${cat.description}</span></div><div class="roadmap-nodes">${items.map((l, j) => `<button class="roadmap-node ${completed.has(l.id) ? 'completed' : ''}" data-lesson="${esc(l.id)}"><span>${completed.has(l.id) ? '✓' : String(j + 1).padStart(2, '0')}</span>${esc(l.title)}</button>`).join('')}</div></section>`).join('')}`;
}
let lessonId = '';
function renderLesson(page) {
  const l = lessons.find((x) => x.id === lessonId);
  if (!l) {
    page.innerHTML = `<div class="info-panel"><h1>강의를 찾을 수 없습니다.</h1><p>주소를 확인하거나 전체 강의에서 다시 선택하세요.</p><a class="text-button" href="#lessons">전체 강의로 →</a></div>`;
    return;
  }
  const pre = (l.prerequisites || []).map((id) => lessons.find((x) => x.id === id)).filter(Boolean);
  const kind = typeof l.experiment === 'object' ? l.experiment.kind : l.experiment;
  page.innerHTML = `<article class="reader"><button class="back-button" data-nav="lessons">${icon('back')}전체 강의로 돌아가기</button><header class="reader-header"><div class="eyebrow">${categoryFor(l.category).short} · LEARNING NOTE</div><h1>${esc(l.title)}</h1><p class="summary">${esc(l.summary)}</p><div class="reader-meta"><span>${labelLevel(l.level)}</span><span>약 ${l.minutes}분</span><span>${completed.has(l.id) ? '✓ 학습 완료' : '실험 + 개념 + 이해 확인'}</span></div></header>${pre.length ? `<section class="reader-section"><h2>먼저 연결할 개념</h2><div class="prerequisites">${pre.map((x) => lessonButton(x)).join('')}</div></section>` : ''}<section class="reader-section"><h2>이 노트의 학습 목표</h2><ul>${l.objectives.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></section>${l.visual ? `<section class="reader-section"><h2>개념을 그림으로 연결하기</h2><div data-concept-visual></div></section>` : ''}<section class="reader-section"><h2>직접 관찰하기</h2><div data-experiment-host></div><p class="physics-note">이 실험은 관련 기초 원리를 관찰하는 교육용 모델입니다. 아래 개념 그림과 설명에서 이 주제의 구조와 동작을 함께 확인하세요.</p></section><section class="reader-section"><h2>원리 이해하기</h2>${(Array.isArray(l.explanation) ? l.explanation : [l.explanation]).map((p) => `<p>${esc(p)}</p>`).join('')}${l.formula ? `<div class="formula-box">${esc(l.formula)}</div>` : ''}</section><section class="reader-section pitfall"><h3>자주 헷갈리는 점</h3><p>${esc(l.pitfall)}</p></section><section class="reader-section quiz"><div class="eyebrow">CHECK YOUR UNDERSTANDING</div><h3>${esc(l.quiz.question)}</h3><div class="quiz-options">${l.quiz.options.map((opt, i) => `<button class="quiz-option" data-answer="${i}" aria-pressed="false"><span class="option-num">${i + 1}</span><span>${esc(opt)}</span></button>`).join('')}</div><div data-quiz-feedback aria-live="polite"></div></section><section class="reader-section"><h2>참고한 원문</h2><div class="source-list">${l.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`).join('')}</div></section><div class="reader-complete"><span class="complete-hint">${completed.has(l.id) ? '이 강의의 학습 완료가 기록되어 있습니다.' : '이해 확인 문제를 맞힌 뒤 학습을 완료하세요.'}<br>${storageAvailable ? '학습 기록은 이 기기에만 저장됩니다.' : '기기 저장 기능을 사용할 수 없어 이번 방문에서만 기록됩니다.'}</span><button class="primary-button" data-complete ${!completed.has(l.id) && !correctAnswers.has(l.id) ? 'disabled' : ''}>${icon('check')}${completed.has(l.id) ? '완료 기록 취소' : '이 강의 학습 완료'}</button></div></article>`;
  cleanup = mountExperiment(page.querySelector('[data-experiment-host]'), kind);
  if (l.visual) renderConcept(page.querySelector('[data-concept-visual]'), l.visual);
}
function renderConcept(container, visual) {
  const nodes = visual.nodes || [];
  if (!nodes.length) return;
  const edges = visual.edges || [];
  const width = Math.max(500, nodes.length * 135),
    nodeWidth = 112,
    step = (width - nodeWidth - 24) / Math.max(1, nodes.length - 1);
  const pos = nodes.map((_, i) => ({ x: 12 + i * step, y: 85 }));
  const resolved = edges
    .map((edge) => ({
      from: typeof edge.from === 'number' ? edge.from : nodes.findIndex((n) => n.id === edge.from),
      to: typeof edge.to === 'number' ? edge.to : nodes.findIndex((n) => n.id === edge.to),
      label: edge.label || '',
    }))
    .filter((e) => pos[e.from] && pos[e.to]);
  let drawing = `<svg class="concept-diagram" viewBox="0 0 ${width} 200" role="img" aria-label="${esc(visual.caption || '주제의 개념 관계')}"><defs><marker id="concept-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="m0 0 6 3-6 3" fill="none" stroke="#aaa0c4"/></marker></defs>`;
  resolved.forEach((edge, i) => {
    const from = pos[edge.from],
      to = pos[edge.to],
      forward = edge.to > edge.from,
      adjacent = Math.abs(edge.to - edge.from) === 1;
    const x1 = forward ? from.x + nodeWidth : from.x,
      x2 = forward ? to.x - 4 : to.x + nodeWidth + 4;
    const y = 111;
    const arc = forward ? 22 + (i % 3) * 13 : 177 - (i % 2) * 13;
    const path =
      adjacent && forward
        ? `M${x1} ${y}H${x2}`
        : `M${x1} ${y}C${x1} ${arc} ${x2} ${arc} ${x2} ${y}`;
    drawing += `<path d="${path}" fill="none" stroke="#c6bed7" stroke-width="1.4" marker-end="url(#concept-arrow)"/>`;
  });
  nodes.forEach((node, i) => {
    const label = typeof node === 'string' ? node : node.label;
    const { x, y } = pos[i];
    const pieces = label.length > 10 ? [label.slice(0, 10), label.slice(10)] : [label];
    drawing += `<g><rect x="${x}" y="${y}" width="${nodeWidth}" height="54" rx="8" fill="${i === 0 ? '#eee9fa' : '#f8f7fc'}" stroke="#ddd6e9"/><text x="${x + nodeWidth / 2}" y="${y - 10}" text-anchor="middle" font-size="9" fill="#b3a7c1">${String(i + 1).padStart(2, '0')}</text>${pieces.map((text, j) => `<text x="${x + nodeWidth / 2}" y="${y + (pieces.length === 1 ? 31 : 23 + j * 17)}" text-anchor="middle" font-size="11" fill="#7f6c97">${esc(text)}</text>`).join('')}</g>`;
  });
  drawing += '</svg>';
  container.innerHTML = `<div class="concept-flow"><div class="concept-diagram-scroll">${drawing}</div><div class="concept-nodes" role="group" aria-label="각 개념의 설명 보기">${nodes.map((node, i) => `<button class="concept-node ${i === 0 ? 'active' : ''}" data-concept-node="${i}" aria-pressed="${i === 0}"><span>${String(i + 1).padStart(2, '0')}</span><strong>${esc(typeof node === 'string' ? node : node.label)}</strong></button>`).join('')}</div><p class="concept-detail" aria-live="polite">${esc(nodes[0].detail || nodes[0].label || nodes[0])}</p>${resolved.length ? `<div class="concept-edges" aria-label="개념 사이 관계">${resolved.map((edge) => `<span class="concept-edge">${esc(nodes[edge.from].label || nodes[edge.from])} → ${esc(nodes[edge.to].label || nodes[edge.to])}${edge.label ? ` · ${esc(edge.label)}` : ''}</span>`).join('')}</div>` : ''}${visual.caption ? `<p class="concept-caption">${esc(visual.caption)}</p>` : ''}</div>`;
  container.addEventListener('click', (e) => {
    const b = e.target.closest('[data-concept-node]');
    if (!b) return;
    container.querySelectorAll('[data-concept-node]').forEach((n) => {
      n.classList.toggle('active', n === b);
      n.setAttribute('aria-pressed', String(n === b));
    });
    const node = nodes[Number(b.dataset.conceptNode)];
    container.querySelector('.concept-detail').textContent = node.detail || node.label || node;
  });
}
async function renderSources(c) {
  c.innerHTML = `<div class="info-panel"><h2>공개 원문에 연결되는 학습 자료</h2><p><a href="https://recipes.tistory.com/" target="_blank" rel="noopener">임베디드 레시피</a>의 강의실 전체맵과 공개 게시글을 참고하여, 설명·회로·학습 자료를 새롭게 작성했습니다. 원문 및 원본 그림은 이 저장소에 복제하지 않습니다.</p><div data-source-stats>출처 목록을 불러오는 중…</div></div><div class="info-panel"><h2>확인 범위와 한계</h2><p data-source-scope></p><p data-source-boundary></p><p>원문이 다루는 주제는 연결된 학습 노트에서 찾을 수 있습니다. ‘매핑’은 관련 주제를 다룬다는 뜻이며, 모든 세부 문장·회로·외부 문서를 재현했다는 뜻은 아닙니다. 공개되지 않은 글과 확인할 수 없는 연결 문서는 완전 수록을 보장할 수 없습니다.</p><div class="source-update" data-source-date></div></div><div class="info-panel"><h2>계산 모델을 읽는 방법</h2><ul><li>점선 흐름은 관습적 전류의 방향을 나타냅니다. ‘전자 이동 보기’를 선택하면 반대 방향을 표시합니다. 점의 속도는 실제 전하의 속도가 아닙니다.</li><li>전기 회로는 선형 저항, 이상 전원과 이상 스위치로 계산한 제한된 모델입니다. 범용 SPICE 해석기는 아닙니다.</li><li>GND는 0 V의 기준이며 전하가 사라지는 곳이 아닙니다. 스위치 위치와 극성을 분리해 관찰하세요.</li><li>GPIO는 기본적으로 누설 0 A인 고임피던스 입력입니다. 풀 실험에서 누설을 추가하면 반대 레일로 흐르는 등가 전류원으로 계산합니다. 부동 입력을 임의의 고정 전압으로 표시하지 않습니다. 논리 임계값은 VCC의 30% / 70% 예시입니다.</li><li>RC 모델은 이상 캐패시터의 지수 응답입니다. 충전과 방전의 시작 전압을 명시하며, 유전체에 전류가 통과하는 그림을 사용하지 않습니다.</li><li>통신·메모리 그림은 교육용 예시입니다. 실제 전압, 레지스터 주소, 에지·타이밍 조건은 해당 데이터시트를 확인하세요.</li></ul></div><div class="info-panel"><h2>공개 출처 인벤토리</h2><p>발견한 글의 접근·학습 매핑 상태를 그대로 공개합니다. 제외 글도 목록에서 확인할 수 있습니다.</p><label class="search-box">${icon('search')}<input data-source-search type="search" placeholder="원문 제목이나 URL 검색" aria-label="출처 검색" value="${esc(sourceQuery)}"></label><div data-source-table></div><p><a class="text-button" href="${base}data/source-manifest.json" target="_blank" rel="noopener">전체 인벤토리 JSON ↗</a></p></div><div class="info-panel"><h2>다음 학습을 위한 제안</h2><p>시뮬레이션으로 원리를 이해한 다음, 저전압 브레드보드와 멀티미터로 실제 값을 비교해 보세요. MCU 핀의 허용 전압과 전류, 부품의 정격과 극성을 데이터시트에서 먼저 확인하세요.</p><p>사이트 개선이나 내용 수정은 <a href="https://github.com/hundong2/embedded/issues" target="_blank" rel="noopener">GitHub Issues ↗</a>에서 제안할 수 있습니다.</p></div>`;
  try {
    if (!manifest) {
      const response = await fetch(`${base}data/source-manifest.json`);
      if (!response.ok) throw Error(response.status);
      manifest = await response.json();
    }
    if (activeTab !== 'sources') return;
    const entries = manifest.entries || [],
      counts = manifest.counts || {};
    const mapped = entries.filter((x) => x.lessonIds?.length).length;
    const inaccessible = entries.filter((x) => x.access !== 'accessible').length;
    c.querySelector('[data-source-stats]').innerHTML = `<div class="source-stats">${[
      [entries.length, '발견한 원문'],
      [mapped, '학습 노트에 연결'],
      [entries.filter((x) => x.coverage === 'out-of-scope').length, '범위 밖 · 이유 기록'],
      [inaccessible, '접근 확인 필요'],
    ]
      .map(
        ([value, label]) =>
          `<div class="source-stat"><strong>${value}</strong><small>${label}</small></div>`,
      )
      .join(
        '',
      )}</div><p class="source-update">본문 접근 가능 ${entries.filter((x) => x.access === 'accessible').length}개 · 본문 검토 ${entries.filter((x) => x.reviewed).length}개 · 접근과 검토를 별도 기록합니다.</p>`;
    c.querySelector('[data-source-scope]').textContent = manifest.scope?.inventory || '';
    c.querySelector('[data-source-boundary]').textContent = manifest.scope?.externalBoundary || '';
    c.querySelector('[data-source-date]').textContent =
      `목록 확인: ${String(manifest.generatedAt || '').slice(0, 10)} · ${manifest.scope?.completeness || ''}`;
    c.querySelector('[data-source-search]').addEventListener('input', (e) => {
      sourceQuery = e.target.value;
      renderSourceTable(c);
    });
    renderSourceTable(c);
    renderExternalSources(c);
  } catch {
    if (c.isConnected)
      c.querySelector('[data-source-stats]').innerHTML =
        `<p role="alert">출처 목록을 불러오지 못했습니다. <a href="${base}data/source-manifest.json">인벤토리 파일</a>을 직접 확인하거나 새로고침해 주세요.</p>`;
  }
}
function renderSourceTable(c) {
  const entries = (manifest?.entries || []).filter((x) =>
    `${x.title} ${x.url}`.toLowerCase().includes(sourceQuery.toLowerCase()),
  );
  c.querySelector('[data-source-table]').innerHTML =
    `<p class="source-update">${entries.length}개 원문</p><div class="source-table-wrap"><table class="source-table"><thead><tr><th>원문</th><th>상태</th><th>연결된 학습 노트 / 제외 이유</th></tr></thead><tbody>${
      entries
        .map(
          (e) =>
            `<tr><td><a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.title || e.url)}</a></td><td><span class="status ${e.access !== 'accessible' ? 'unreviewed' : e.coverage === 'out-of-scope' ? 'excluded' : ''}">${e.access !== 'accessible' ? '접근 불가' : e.lessonIds?.length ? '학습 연결' : e.coverage === 'out-of-scope' ? '범위 밖' : '검토 필요'}</span></td><td>${
              e.lessonIds?.length
                ? e.lessonIds
                    .map((id) => {
                      const l = lessons.find((x) => x.id === id);
                      return l ? `<a href="#lesson/${esc(id)}">${esc(l.title)}</a>` : esc(id);
                    })
                    .join(' · ')
                : esc(e.exclusionReason || e.reason || e.error || e.scope || '미검토')
            }</td></tr>`,
        )
        .join('') || '<tr><td colspan="3">일치하는 출처가 없습니다.</td></tr>'
    }</tbody></table></div>`;
}
function externalLink(record) {
  try {
    const url = new URL(record.url);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
      throw new Error('invalid source URL');
    return `<a href="${esc(record.url)}" target="_blank" rel="noopener">${esc(record.title || record.url)}</a>`;
  } catch {
    return `<span>${esc(record.url)} · 원문 URL 형식 오류</span>`;
  }
}
function renderExternalSources(c) {
  const refs = manifest?.externalReferences || [];
  if (!refs.length) return;
  const panel = document.createElement('details');
  panel.className = 'info-panel external-panel';
  panel.innerHTML = `<summary>블로그에서 연결한 외부 자료 ${refs.length}개 · 접근 상태와 주제 연결</summary><p>외부 링크의 첫 응답과 링크 제목의 주제 대응을 확인했습니다. HTTP 응답 성공은 내용 검토를 의미하지 않습니다. 외부 본문 전체와 추가 연결 문서는 수록·검토하지 않았습니다.</p><p class="source-update">HTTP 접근 가능 ${refs.filter((r) => r.access === 'http-accessible-unreviewed').length}개 · 주제 연결 ${refs.filter((r) => r.topicLessonIds?.length).length}개 · 외부 본문 전체 검토 ${refs.filter((r) => r.reviewed).length}개</p><div class="source-table-wrap"><table class="source-table"><thead><tr><th>외부 자료</th><th>접근 확인</th><th>본문 검토</th><th>제목에 대응하는 학습 주제</th></tr></thead><tbody>${refs
    .map(
      (r) =>
        `<tr data-external-source><td>${externalLink(r)}</td><td>${r.httpStatus ? `HTTP ${r.httpStatus}` : '네트워크 오류'}</td><td>${r.reviewed ? '검토' : '미검토'}</td><td>${
          r.topicLessonIds?.length
            ? r.topicLessonIds
                .map((id) => {
                  const l = lessons.find((x) => x.id === id);
                  return l ? `<a href="#lesson/${esc(id)}">${esc(l.title)}</a>` : esc(id);
                })
                .join(' · ')
            : esc(r.scopeNote || '직접 대응 주제 미확인')
        }</td></tr>`,
    )
    .join('')}</tbody></table></div>`;
  c.querySelector('[data-source-table]').closest('.info-panel').after(panel);
}
function onAppClick(e) {
  const nav = e.target.closest('[data-nav]');
  if (nav) {
    const dest = nav.dataset.nav;
    setMobileMenu(false);
    if (dest.startsWith('category/')) {
      filter = dest.split('/')[1];
      query = '';
      if (location.hash === '#lessons') {
        activeTab = 'lessons';
        render();
        window.scrollTo(0, 0);
      } else location.hash = 'lessons';
    } else {
      if (dest === 'lessons') filter = 'all';
      if (location.hash === `#${dest}`) {
        activeTab = dest;
        render();
      } else location.hash = dest;
    }
    return;
  }
  const exp = e.target.closest('[data-experiment]');
  if (exp) {
    activeExperiment = exp.dataset.experiment;
    history.replaceState(null, '', `#lab/${activeExperiment}`);
    render();
    return;
  }
  const l = e.target.closest('[data-lesson]');
  if (l) {
    location.hash = `lesson/${l.dataset.lesson}`;
    return;
  }
  const f = e.target.closest('[data-filter]');
  if (f) {
    filter = f.dataset.filter;
    app.querySelectorAll('[data-filter]').forEach((b) => {
      b.classList.toggle('active', b === f);
      b.setAttribute('aria-pressed', String(b === f));
    });
    updateNav();
    renderCards();
    return;
  }
  const cat = e.target.closest('[data-graph-category]');
  if (cat) {
    filter = cat.dataset.graphCategory;
    query = '';
    location.hash = 'lessons';
    return;
  }
  const related = e.target.closest('[data-related]');
  if (related) {
    const curated = {
      pull: ['pull-up', 'pull-sizing', 'gpio'],
      current: ['current-loop', 'current-loop', 'ground-reference'],
      rc: ['capacitor', 'rc-transient', 'rc-transient'],
    };
    const matches = lessons.filter(
      (l) =>
        (typeof l.experiment === 'object' ? l.experiment.kind : l.experiment) ===
        related.dataset.related,
    );
    const index = Number(related.dataset.relatedIndex);
    const target = curated[related.dataset.related]?.[index] || matches[index % matches.length]?.id;
    if (target) location.hash = `lesson/${target}`;
    return;
  }
  const answer = e.target.closest('[data-answer]');
  if (answer) {
    const lesson = lessons.find((l) => l.id === lessonId);
    const chosen = Number(answer.dataset.answer),
      correct = chosen === lesson.quiz.answer;
    app.querySelectorAll('[data-answer]').forEach((b) => {
      b.classList.remove('selected', 'correct', 'wrong');
      b.setAttribute('aria-pressed', String(b === answer));
    });
    answer.classList.add(correct ? 'correct' : 'wrong');
    app.querySelector('[data-quiz-feedback]').innerHTML =
      `<div class="quiz-feedback">${correct ? '✓ 맞았습니다.' : '다시 생각해 보세요.'} ${esc(lesson.quiz.explanation)}</div>`;
    if (correct) {
      correctAnswers.add(lesson.id);
      app.querySelector('[data-complete]').disabled = false;
    }
    return;
  }
  if (e.target.closest('[data-complete]')) {
    if (!completed.has(lessonId) && !correctAnswers.has(lessonId)) return;
    const was = completed.has(lessonId);
    was ? completed.delete(lessonId) : completed.add(lessonId);
    try {
      localStorage.setItem('embedded-atlas-progress', JSON.stringify([...completed]));
    } catch {
      storageAvailable = false;
    }
    updateProgress();
    render();
    toast(
      was
        ? '학습 완료 기록을 취소했습니다.'
        : storageAvailable
          ? '학습 완료! 이 브라우저에 기록했습니다.'
          : '학습 완료! 이번 방문에 기록했습니다.',
    );
  }
}
function toast(message) {
  app.querySelector('.toast')?.remove();
  const node = document.createElement('div');
  node.className = 'toast';
  node.setAttribute('role', 'status');
  node.textContent = message;
  app.append(node);
  setTimeout(() => node.remove(), 3500);
}
function route() {
  const [tab, id] = location.hash.slice(1).split('/');
  if (tab === 'lesson') {
    activeTab = 'lesson';
    try {
      lessonId = decodeURIComponent(id || '');
    } catch {
      lessonId = '';
    }
  } else if (tab === 'category') {
    activeTab = 'lessons';
    filter = id || 'all';
  } else {
    activeTab = ['lab', 'roadmap', 'lessons', 'sources'].includes(tab) ? tab : 'lab';
    if (activeTab === 'lab' && experiments.some((e) => e.id === id)) activeExperiment = id;
  }
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
shell();
window.addEventListener('hashchange', route);
route();
