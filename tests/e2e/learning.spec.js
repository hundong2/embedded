import { test, expect } from '@playwright/test';
import { lessons } from '../../src/data/lessons.js';

test('pull resistor truth table and floating state are observable', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  await expect(
    page.getByRole('heading', { name: '전류의 흐름을, 눈으로 이해하세요.' }),
  ).toBeVisible();
  if (test.info().project.name === 'desktop') {
    await page.screenshot({ path: 'artifacts/site-desktop.png', fullPage: false });
  }
  const metrics = page.locator('[data-metrics]');
  await expect(metrics).toContainText('HIGH');
  await expect(metrics).toContainText('3.30');
  await page.locator('[data-toggle="closed"]').click();
  await expect(metrics).toContainText('LOW');
  await expect(metrics).toContainText('0.330');
  await page.locator('[data-set="mode"][data-value="down"]').click();
  await expect(metrics).toContainText('HIGH');
  await page.locator('[data-toggle="closed"]').click();
  await expect(metrics).toContainText('LOW');
  await page.locator('[data-set="mode"][data-value="none"]').click();
  await expect(metrics).toContainText('FLOATING');
  await expect(metrics).toContainText('?');
  await expect(page.locator('[data-observation]')).toContainText('정해지지');
  await expect(page.locator('.circuit-stage .circuit-svg')).toHaveAccessibleName(/GPIO FLOATING/);
  expect(errors).toEqual([]);
});

test('all nine experiments work at production base and controls affect results', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  for (const kind of [
    'current',
    'ohm',
    'rc',
    'logic',
    'pwm',
    'adc',
    'protocol',
    'memory',
    'pull',
  ]) {
    await page.locator(`[data-experiment="${kind}"]`).click();
    await expect(page.locator('.circuit-stage svg')).toBeVisible();
    await expect(page.locator('[data-observation]')).not.toBeEmpty();
    await expect(page).toHaveURL(new RegExp(`#lab/${kind}$`));
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBeTruthy();
  }
  await page.locator('[data-experiment="pwm"]').click();
  const duty = page.getByRole('slider', { name: 'PWM 듀티' });
  await duty.fill('75');
  await expect(page.locator('[data-metrics]')).toContainText('2.48');
  await duty.focus();
  await page.keyboard.press('ArrowRight');
  await expect(duty).toHaveValue('76');
  await expect(duty).toBeFocused();
  await page.locator('[data-experiment="memory"]').click();
  await page.getByRole('button', { name: 'SET · 1' }).click();
  await expect(page.locator('[data-metrics]')).toContainText('0x01');
  await page.getByRole('button', { name: 'TOGGLE', exact: true }).click();
  await expect(page.locator('[data-metrics]')).toContainText('0x00');
  await page.locator('[data-experiment="protocol"]').click();
  await page.locator('[data-set="protocol"][data-value="spi"]').click();
  await expect(page.locator('.circuit-stage')).toContainText('MISO');
  expect(errors).toEqual([]);
});

test('ground reference does not reverse physical current, polarity does', async ({ page }) => {
  await page.goto('./#lab/current');
  await page.locator('[data-toggle="closed"]').click();
  await expect(page.locator('[data-metrics]')).toContainText('시계 방향');
  const previous = await page.locator('[data-metrics] .metric').first().textContent();
  await page.locator('[data-set="ground"][data-value="high"]').click();
  await expect(page.locator('[data-metrics] .metric').first()).toHaveText(previous);
  await page.locator('[data-set="polarity"][data-value="-1"]').click();
  await expect(page.locator('[data-metrics]')).toContainText('반시계 방향');
});

test('search, a lesson quiz and completion persist after reload', async ({ page }) => {
  const lesson = lessons[0];
  await page.goto('./#lessons');
  await page.getByRole('searchbox', { name: '강의 검색' }).fill(lesson.title);
  await expect(page.locator('[data-lesson-grid]')).toContainText(lesson.title);
  await page.getByRole('button', { name: `${lesson.title} 학습하기`, exact: true }).click();
  await expect(page.getByRole('heading', { name: lesson.title, exact: true })).toBeVisible();
  await expect(page.locator('[data-complete]')).toBeDisabled();
  await page.locator(`[data-answer="${lesson.quiz.answer}"]`).click();
  await expect(page.locator('[data-quiz-feedback]')).toContainText('맞았습니다');
  await page.locator('[data-complete]').click();
  await expect(page.locator('[data-complete]')).toContainText('완료 기록 취소');
  await page.reload();
  await expect(page.locator('[data-complete]')).toContainText('완료 기록 취소');
  await page.locator('[data-complete]').click();
  await expect(page.locator('[data-complete]')).toContainText('이 강의 학습 완료');
});

test('curriculum, source inventory and unknown lesson route remain usable', async ({ page }) => {
  await page.goto('./#roadmap');
  await expect(page.locator('.roadmap-node')).toHaveCount(lessons.length);
  await page.locator('.roadmap-node').first().click();
  await expect(page.locator('.reader-header h1')).toBeVisible();
  await page.goto('./#sources');
  await expect(page.locator('.source-stat')).toHaveCount(4);
  await expect(page.locator('.source-table tbody tr')).not.toHaveCount(0);
  await page.locator('.external-panel summary').click();
  await expect(page.locator('[data-external-source]')).not.toHaveCount(0);
  await expect(page.locator('.external-panel')).toContainText('외부 본문 전체 검토 0개');
  await page.getByRole('searchbox', { name: '출처 검색' }).fill('xyz-no-such-source-123');
  await expect(page.locator('[data-source-table]')).toContainText('일치하는 출처가 없습니다');
  await page.goto('./#lesson/no-such-lesson');
  await expect(page.getByRole('heading', { name: '강의를 찾을 수 없습니다.' })).toBeVisible();
});

test('mobile navigation and reduced-motion accessibility', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  if (isMobile) {
    await page.getByRole('button', { name: '메뉴 열기' }).click();
    await expect(page.locator('.sidebar')).toHaveClass(/open/);
    await page.locator('.sidebar [data-nav="roadmap"]').click();
    await expect(page.locator('.sidebar')).not.toHaveClass(/open/);
    await expect(page).toHaveURL(/#roadmap$/);
  }
  await page.goto('./#lab');
  const flow = page.locator('.flow').first();
  await page.locator('[data-toggle="closed"]').click();
  await expect(flow).toHaveCSS('animation-name', 'none');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBeTruthy();
});

test('every published lesson has a working deep link, its own diagram and quiz', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const lesson of lessons) {
    await page.goto(`./#lesson/${lesson.id}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.reader-header h1')).toHaveText(lesson.title);
    await expect(page.locator('.concept-diagram')).toBeVisible();
    await expect(page.locator('[data-concept-node]')).toHaveCount(lesson.visual.nodes.length);
    await expect(page.locator('[data-answer]')).toHaveCount(lesson.quiz.options.length);
    await expect(page.locator('.circuit-stage svg')).toBeVisible();
    const last = page.locator('[data-concept-node]').last();
    await last.click();
    await expect(page.locator('.concept-detail')).toHaveText(lesson.visual.nodes.at(-1).detail);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBeTruthy();
  }
  expect(errors).toEqual([]);
});

test('range drag retains its input and a zero-volt experiment cannot corrupt GPIO supply', async ({
  page,
  isMobile,
}) => {
  await page.goto('./#lab/ohm');
  await page.getByRole('slider', { name: '전원 전압' }).fill('0');
  await expect(page.locator('[data-metrics]')).toContainText('0.00');
  await page.locator('[data-experiment="pull"]').click();
  await expect(page.locator('[data-metrics]')).toContainText('3.30');
  const slider = page.getByRole('slider', { name: '풀 저항' });
  const originalSlider = await slider.elementHandle();
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  expect(
    await originalSlider.evaluate(
      (node) => node.isConnected && node === document.querySelector('[data-range="resistance"]'),
    ),
  ).toBeTruthy();
  await expect(slider).toBeFocused();
  if (!isMobile) {
    const box = await slider.boundingBox();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, { steps: 15 });
    await page.mouse.up();
    expect(Number(await slider.inputValue())).toBeGreaterThan(65_000);
  }
});

test('pull resistance and leakage explain an undefined idle input', async ({ page }) => {
  await page.goto('./#lab/pull');
  await page.getByRole('slider', { name: '풀 저항' }).fill('100000');
  await page.getByRole('slider', { name: '입력 누설 전류' }).fill('20');
  await expect(page.locator('[data-metrics]')).toContainText('1.30');
  await expect(page.locator('[data-metrics]')).toContainText('UNDEFINED');
  await expect(page.locator('[data-observation]')).toContainText('2.00 V');
  await page.getByRole('slider', { name: '풀 저항' }).fill('10000');
  await expect(page.locator('[data-metrics]')).toContainText('3.10');
  await expect(page.locator('[data-metrics]')).toContainText('HIGH');
  await page.locator('[data-toggle="closed"]').click();
  await expect(page.locator('[data-metrics]')).toContainText('LOW');
});

test('beginner walkthrough shows both power terminals and requires an intact return wire', async ({
  page,
  isMobile,
}) => {
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await expect(page.locator('.skip-link')).toHaveCSS('opacity', '1');
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  const foundation = page.getByRole('region', { name: '전류와 그라운드 첫걸음' });
  await expect(foundation).toBeVisible();
  await expect(foundation.locator('[data-foundation-state]')).toContainText('0.00 mA');
  await foundation.locator('[data-f-next]').click();
  await foundation.locator('[data-f-switch]').click();
  await expect(foundation.locator('[data-foundation-state]')).toContainText('0.33 mA');
  await expect(foundation.locator('.foundation-svg')).toHaveAccessibleName(/귀환선 연결/);
  await foundation.locator('[data-f-next]').click();
  await expect(foundation.locator('[data-foundation-text]')).toContainText('전원 −단자');
  if (!isMobile) await foundation.screenshot({ path: 'artifacts/ground-return.png' });
  else await foundation.screenshot({ path: 'artifacts/ground-return-mobile.png' });
  await foundation.locator('[data-f-return]').click();
  await expect(foundation.locator('[data-foundation-state]')).toContainText(
    '스위치 닫힘 · 귀환선 끊김 → 저항 전류 0.00 mA',
  );
  await foundation.locator('[data-f-return]').press('Enter');
  await expect(foundation.locator('[data-foundation-state]')).toContainText('0.33 mA');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
  ).toBeTruthy();
  await expect(page.locator('[data-power-return]')).toBeAttached();
  await page.locator('[data-toggle="closed"]').click();
  const metrics = page.locator('[data-metrics] .metric');
  await expect(metrics.filter({ hasText: 'GPIO 입력 전압' })).toContainText('0.00');
  await expect(metrics.filter({ hasText: '저항 양단 전압' })).toContainText('3.30');
});
