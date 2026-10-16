/**
 * Rebuild the public provenance index without copying the author's prose or images.
 * Usage: node scripts/sync-sources.mjs [--refresh] [--max=500]
 * Raw HTML is an ignored local research cache; never publish .cache/sources.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://recipes.tistory.com';
const cache = path.join(root, '.cache/sources');
const refresh = process.argv.includes('--refresh');
const checkExternal = process.argv.includes('--check-external');
const max = Number(process.argv.find((x) => x.startsWith('--max='))?.split('=')[1] ?? 500);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await mkdir(cache, { recursive: true });
await mkdir(path.join(root, 'public/data'), { recursive: true });

const decode = (text) =>
  text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
const plain = (html) =>
  decode(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
function normalize(raw, base = origin) {
  try {
    const u = new URL(decode(raw), base);
    u.hash = '';
    if (u.hostname === 'recipes.tistory.com') {
      u.protocol = 'https:';
      u.search = ''; // internal tracking does not identify a different blog article
    }
    return u.href.replace(/\/$/, '');
  } catch {
    return null;
  }
}
const article = (u) => /^https:\/\/recipes\.tistory\.com\/(?:\d+|entry\/[^?#]+)$/.test(u);
const urls = (html) =>
  [...html.matchAll(/(?:href\s*=\s*["']([^"']+)["']|<loc>([^<]+)<\/loc>)/gi)]
    .map((m) => normalize(m[1] || m[2]))
    .filter(Boolean);
const errors = [];
const discovery = [];
async function fetchPage(url) {
  const key =
    url === origin
      ? 'home'
      : /^\d+$/.test(url.split('/').at(-1))
        ? url.split('/').at(-1)
        : createHash('sha256').update(url).digest('hex').slice(0, 18);
  const file = path.join(cache, `${key}.html`);
  if (!refresh) {
    try {
      return { html: await readFile(file, 'utf8'), status: 200, cached: true };
    } catch {}
  }
  await pause(170); // single-request crawl; intentionally modest request rate
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EmbeddedAtlasSourceAudit/1.0 (+https://github.com/hundong2/embedded)',
      },
      signal: AbortSignal.timeout(30000),
      redirect: 'follow',
    });
    const html = await response.text();
    if (response.ok) await writeFile(file, html, 'utf8');
    return { html, status: response.status, cached: false };
  } catch (error) {
    return { html: '', status: 0, error: String(error.message) };
  }
}

const queue = new Map();
function enqueue(url, via) {
  if (article(url) && !queue.has(url)) queue.set(url, new Set([via]));
  else if (article(url)) queue.get(url).add(via);
}
for (const seed of [`${origin}/sitemap.xml`, origin]) {
  const result = await fetchPage(seed);
  discovery.push({
    url: seed,
    httpStatus: result.status,
    urlCount: urls(result.html).length,
    error: result.error ?? null,
  });
  if (result.status !== 200)
    errors.push({ url: seed, status: result.status, error: result.error ?? 'HTTP failure' });
  for (const url of urls(result.html)) enqueue(url, seed);
  // Sitemap categories provide independent inventory checks, including map articles.
  if (seed.endsWith('sitemap.xml')) {
    for (const url of [
      ...new Set(urls(result.html).filter((x) => x.startsWith(`${origin}/category`))),
    ]) {
      const category = await fetchPage(url);
      discovery.push({
        url,
        httpStatus: category.status,
        urlCount: urls(category.html).filter(article).length,
      });
      for (const linked of urls(category.html)) enqueue(linked, url);
    }
  }
}

const entries = new Map();
const externalLabels = new Map();
let read = 0;
for (const [url, foundVia] of queue) {
  if (read >= max) break;
  const result = await fetchPage(url);
  read++;
  const canonical = normalize(
    result.html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ?? url,
  );
  const title = decode(
    result.html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)/i)?.[1] ??
      '접근 확인 필요',
  );
  const category = result.html.match(/"categoryLabel":"([^"]*)"/)?.[1] ?? '';
  // Stop before imported comment threads: external references belong to article prose only.
  const body = (
    result.html.split(/<div class=["'][^"']*\bcontents_style\b[^"']*["'][^>]*>/i)[1] ?? ''
  )
    .split(/<div class=["']comment["']/i)[0]
    .split(/<!-- System - START -->/)[0];
  const links = [...new Set(urls(body))];
  for (const match of body.matchAll(
    /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
  )) {
    const linked = normalize(match[1]);
    if (linked && /^https?:/.test(linked) && !linked.startsWith(origin)) {
      const label = plain(match[2]);
      const old = externalLabels.get(linked) ?? { title: label, discoveredVia: [] };
      if (!old.title && label) old.title = label;
      old.discoveredVia.push(canonical);
      externalLabels.set(linked, old);
    }
  }
  for (const linked of links) enqueue(linked, canonical);
  const old = entries.get(canonical);
  const record = {
    id: canonical.split('/').at(-1),
    url: canonical,
    title,
    blogCategory: category,
    httpStatus: result.status,
    access: result.status === 200 && body.length ? 'accessible' : 'unavailable',
    reviewed: false,
    scope: 'pending-classification',
    lessonIds: [],
    coverage: 'unmapped',
    discoveredVia: [...new Set([...(old?.discoveredVia ?? []), ...foundVia])],
    aliases: [...new Set([...(old?.aliases ?? []), ...(url !== canonical ? [url] : [])])],
    bodyTextLength: plain(body).length,
    bodySha256: createHash('sha256').update(plain(body)).digest('hex'),
    internalLinks: links.filter(article),
    externalLinks: links.filter((x) => !x.startsWith(origin) && /^https?:/.test(x)),
    error: result.error ?? null,
  };
  entries.set(canonical, record);
  if (read % 25 === 0) console.log(`Indexed ${read} pages; ${queue.size} discovered URLs`);
}

// Refresh title metadata before loading lessons so new citations resolve in one run.
await mkdir(path.join(root, 'src/data'), { recursive: true });
await writeFile(
  path.join(root, 'src/data/source-index.js'),
  `// Source metadata; regenerated by scripts/sync-sources.mjs.\nexport const sourceIndex = ${JSON.stringify(Object.fromEntries([...entries.values()].sort((a, b) => Number(a.id) - Number(b.id)).map((e) => [e.id, { title: e.title, url: e.url }])), null, 2)};\n`,
  'utf8',
);
const { lessons } = await import('../src/data/lessons.js');
const { primarySourceReviews } = await import('../src/data/primary-source-reviews.js');
let prior = {};
try {
  prior = JSON.parse(await readFile(path.join(root, 'public/data/source-manifest.json'), 'utf8'));
} catch {}
const before = new Map((prior.entries ?? []).map((x) => [x.url, x]));
const nonTechnical = /미분류|브레인몰랑몰랑/;
const excludedIds = {
  196: '진로 상담: 취업·진학 선택. 전기전자·임베디드 기술 설명의 범위 밖입니다.',
  197: '진로 상담: 연봉·채용. 전기전자·임베디드 기술 설명의 범위 밖입니다.',
  198: '진로 상담: 졸업 준비·연구 경험. 기술 개념 강의의 범위 밖입니다.',
  201: '진로 상담: 인적 네트워크. 기술 개념 강의의 범위 밖입니다.',
};
for (const entry of entries.values()) {
  const previous = before.get(entry.url);
  entry.lessonIds = lessons
    .filter((l) => l.sources.some((s) => normalize(s.url) === entry.url))
    .map((l) => l.id);
  entry.reviewed = previous?.reviewed ?? false;
  entry.scope = entry.lessonIds.length
    ? 'embedded-learning'
    : nonTechnical.test(entry.blogCategory) || excludedIds[entry.id]
      ? 'context-or-non-technical'
      : 'embedded-learning';
  entry.coverage = entry.lessonIds.length
    ? 'mapped'
    : entry.scope === 'context-or-non-technical'
      ? 'out-of-scope'
      : 'pending-lesson';
  if (entry.coverage === 'out-of-scope') {
    entry.exclusionReason =
      excludedIds[entry.id] ??
      (entry.id === '244'
        ? '강의실 목차 페이지입니다. 링크된 개별 기술 글을 별도로 수집하고 매핑했습니다.'
        : entry.id === '54'
          ? '블로그 소개·저작권·공유 정책입니다. 기술 lesson 대신 출처 정책 확인에 사용했습니다.'
          : entry.blogCategory.includes('브레인')
            ? '퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다.'
            : '서적 사진·생활글·커뮤니티·개별 에디터 운영 팁 등으로 전기전자 및 임베디드 기초 기술 범위 밖입니다.');
  }
  if (previous?.bodySha256 && previous.bodySha256 !== entry.bodySha256) entry.reviewed = false;
  if (previous?.reviewed && entry.reviewed) {
    entry.reviewMethod = previous.reviewMethod;
    entry.reviewedAt = previous.reviewedAt;
  }
}
const records = [...entries.values()].sort((a, b) => Number(a.id) - Number(b.id));
const supplements = new Map();
for (const lesson of lessons)
  for (const source of lesson.sources) {
    if (!source.url.startsWith(origin)) {
      const ref = supplements.get(source.url) ?? {
        ...source,
        ...primarySourceReviews[source.url],
        lessonIds: [],
      };
      ref.lessonIds.push(lesson.id);
      supplements.set(source.url, ref);
    }
  }
const supplementalReferences = [...supplements.values()];
const oldExternal = new Map((prior.externalReferences ?? []).map((x) => [x.url, x]));
const topicRules = [
  [/회로 심벌/, ['current-loop']],
  [/charge pump/i, ['charge-pump']],
  [/레귤레이터|LDO|PMIC/, ['power-regulators']],
  [/PLL|rfdh/, ['clocks-pll']],
  [/오버슈트|언더슈트/, ['signal-integrity']],
  [/임피던스/, ['impedance']],
  [/TR.*그래프|kitkorea/, ['transistor-amplifier']],
  [/A\/D Converter/, ['adc']],
  [/SoC/, ['core-soc']],
  [/ASSEMB|Assembly|Instruction/i, ['asm-abi']],
  [/Cache/, ['dma-cache-mmu']],
  [/Make|make-ko/, ['make-build']],
  [/gcc|컴파일러/, ['compile-pipeline']],
  [/링크 에러/, ['libraries']],
  [/Bootup|부트로더/, ['reset-boot']],
  [/LED 켜/, ['diode-led']],
  [/exception|시스템 콜/, ['exceptions']],
  [/인터럽트/, ['interrupts']],
  [/Timer Service|와치독/, ['timers-watchdog']],
  [/메모리 맵/, ['linker-map']],
  [/Stack|stack|heap/, ['c-memory']],
  [/TCB|태스크|테스크|Context Switch|컨텍스트/, ['scheduler']],
  [/동기화|세마포어|뮤택스/, ['synchronization']],
  [/동적 할당/, ['dynamic-allocation']],
  [/드라이버|Device Driver/i, ['device-drivers']],
  [/OS 계층|Operating System|RTOS|L4 Programming/, ['rtos-tasks']],
  [/이차원 배열|함수 포인터/, ['pointers-structs']],
  [/C\+\+|객체/, ['object-model']],
  [/case 문/, ['compile-pipeline']],
  [/Linked List|Queue/, ['queues']],
  [/USB|descriptor/i, ['usb-basics']],
  [/Serial 통신/, ['serial-uart']],
  [/SDRAM|DDR|NAND|Flash Memory/, ['flash-ram']],
  [/EBI/, ['memory-bus']],
  [/MMU|MPU/, ['memory-protection']],
  [/Android|안드로이드|Zygote/, ['android-stack']],
  [/좀비/, ['linux-process']],
  [/Debugging|Trace32|디버깅|rmalloc/, ['debugging']],
  [/아두이노|Cygwin|Source Insight|git|ssh|bitbucket/i, ['dev-environment']],
  [/reverseMe|odbg/, ['asm-abi']],
  [/elec\.slowgoing/, ['ohms-law', 'capacitor']],
];
const externalReferences = [...externalLabels].map(([url, meta]) => ({
  ...oldExternal.get(url),
  url,
  title: meta.title || '제목 없는 외부 참고 링크',
  discoveredVia: [...new Set(meta.discoveredVia)],
  access: oldExternal.get(url)?.access ?? 'not-checked',
  reviewed: false,
  coverage: 'external-content-not-reproduced',
  topicLessonIds: [
    ...new Set(
      topicRules
        .filter(([pattern]) => pattern.test(`${meta.title} ${url}`))
        .flatMap(([, ids]) => ids),
    ),
  ],
  mappingBasis:
    '링크 제목과 목차 주제의 대응만 표시합니다. 외부 원문을 전체 검토·수록했다는 뜻이 아닙니다.',
  lessonIds: lessons
    .filter((l) => l.sources.some((s) => normalize(s.url) === url))
    .map((l) => l.id),
}));
for (const ref of externalReferences) {
  if (!ref.topicLessonIds.length)
    ref.scopeNote = /베이즈|개발자심리학|power-mode|page\.click|keys\.the|mysql|appster/i.test(
      `${ref.title} ${ref.url}`,
    )
      ? '일반 수학·심리·에디터·데이터베이스·자동링크 등 기초 임베디드 범위 밖의 참고 링크입니다.'
      : '직접 대응할 기술 주제를 확인하지 못한 보조·메타 링크입니다. 원 URL과 접근 상태만 보존합니다.';
}
if (checkExternal) {
  let next = 0;
  // Check only first-level links; never recursively crawl arbitrary external sites.
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      while (next < externalReferences.length) {
        const ref = externalReferences[next++];
        if (!refresh && ref.checkedAt) continue;
        await pause(250);
        try {
          const response = await fetch(ref.url, {
            signal: AbortSignal.timeout(6000),
            redirect: 'follow',
          });
          ref.httpStatus = response.status;
          ref.access = response.ok ? 'http-accessible-unreviewed' : 'http-error';
          ref.finalUrl = response.url;
          ref.contentType = response.headers.get('content-type');
          await response.body?.cancel();
          ref.error = null;
        } catch (error) {
          ref.httpStatus = 0;
          ref.access = 'network-error';
          ref.error = String(error.message);
        }
        ref.checkedAt = new Date().toISOString();
      }
    }),
  );
}
await mkdir(path.join(root, 'src/data'), { recursive: true });
await writeFile(
  path.join(root, 'src/data/source-index.js'),
  `// Source metadata; regenerated by scripts/sync-sources.mjs.\nexport const sourceIndex = ${JSON.stringify(Object.fromEntries(records.map((e) => [e.id, { title: e.title, url: e.url }])), null, 2)};\n`,
  'utf8',
);
const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  origin,
  scope: {
    inventory:
      '공개 sitemap, 홈페이지 강의실 전체맵, 전체 카테고리와 발견된 글 본문의 블로그 내부 링크',
    externalBoundary:
      '글 본문의 외부 링크는 제목·원 URL과 첫 응답 접근 상태를 보존. HTTP 성공은 내용 검토가 아님. 외부 사이트 및 종료된 egloos 사이트의 재귀 수집은 포함하지 않음.',
    reproduction: '원문·그림을 배포하지 않음. 제목·URL·접근 상태·독창적 학습 자료와의 매핑만 공개.',
    completeness:
      '공개적으로 발견 가능한 URL 기준. 비공개·삭제·검색 비노출 글 및 외부 링크의 모든 내용을 수록했다는 의미가 아님.',
  },
  discovery,
  errors,
  externalReferences,
  supplementalReferences,
  counts: {
    discoveredUrls: queue.size,
    processedUrls: read,
    articles: records.length,
    accessible: records.filter((x) => x.access === 'accessible').length,
    unavailable: records.filter((x) => x.access !== 'accessible').length,
    reviewed: records.filter((x) => x.reviewed).length,
    mapped: records.filter((x) => x.coverage === 'mapped').length,
    pending: records.filter((x) => x.coverage === 'pending-lesson').length,
    excluded: records.filter((x) => x.coverage === 'out-of-scope').length,
    externalLinks: externalReferences.length,
    externalChecked: externalReferences.filter((x) => x.checkedAt).length,
    externalHttpAccessible: externalReferences.filter(
      (x) => x.access === 'http-accessible-unreviewed',
    ).length,
    externalTopicMapped: externalReferences.filter((x) => x.topicLessonIds.length).length,
    supplementalReviewed: supplementalReferences.filter((x) => x.reviewed).length,
  },
  truncated: read < queue.size,
  entries: records,
};
await writeFile(
  path.join(root, 'public/data/source-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);
const escapeCell = (value) =>
  String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
const report =
  `# 출처 범위와 커버리지 감사\n\n갱신: ${manifest.generatedAt}\n\n` +
  `이 자료는 [Embedded Recipes](https://recipes.tistory.com/)의 공개 목차를 출발점으로 작성한 독창적 한국어 학습 사이트입니다. 원문 본문·그림·첨부 파일을 복제하지 않습니다. [공유 정책](https://recipes.tistory.com/54)을 참고했습니다.\n\n` +
  `## 확인한 범위\n\n` +
  `- 공개 sitemap, 홈페이지의 강의실 전체맵, sitemap의 전체 카테고리, 발견한 글 본문의 내부 링크를 합쳐 중복 canonical URL을 제거했습니다. 카테고리의 페이지 전체를 재귀 수집했다는 뜻은 아닙니다. 누락 검사는 sitemap과 본문 내부 링크에 의존합니다.\n` +
  `- 발견 ${manifest.counts.discoveredUrls} URL, canonical 항목 ${manifest.counts.articles}개, 본문 접근 가능 ${manifest.counts.accessible}개, 접근 불가 ${manifest.counts.unavailable}개입니다.\n` +
  `- 기술 개념 매핑 ${manifest.counts.mapped}개, 범위 제외 ${manifest.counts.excluded}개, 미해결 ${manifest.counts.pending}개입니다. ${lessons.length}개 lesson에 관련 글을 개념 단위로 묶었습니다. 한 글의 모든 문단을 재현하거나 개별 문장을 모두 교정한 것은 아닙니다.\n` +
  `- reviewed는 lesson에 사용한 본문의 주요 개념·인용 목적을 확인했다는 기록입니다. HTTP 성공만으로 자동 부여하지 않습니다. 제외 글은 제목·카테고리·본문 도입에 따라 범위를 판정하며 exclusionReason을 남깁니다.\n` +
  `- 외부 첫 링크 ${manifest.counts.externalLinks}개를 보존했고 ${manifest.counts.externalChecked}개의 첫 HTTP 응답을 확인했습니다. ${manifest.counts.externalHttpAccessible}개가 HTTP 성공이었으며, 이는 본문 접근·현재 내용·첨부 안전성·전체 검토를 보장하지 않습니다. 이동·로그인·도메인 전환 페이지도 HTTP 200일 수 있습니다.\n` +
  `- 외부 링크의 topicLessonIds는 링크 제목의 주제 대응입니다. reviewed=false이며 외부 원문 전체의 내용 수록을 주장하지 않습니다. URL의 쿼리는 콘텐츠 식별에 필요하므로 보존합니다. 공개 첨부의 만료형 URL은 시간이 지나면 접근 상태가 달라질 수 있습니다. 외부 사이트 전체 재귀 수집, 비공개·삭제 글은 범위에 포함하지 않습니다.\n\n` +
  `- 위 ${manifest.counts.externalLinks}개와 별도로, 보충 출처 ${manifest.counts.supplementalReviewed}개는 공식/유지관리 원문의 해당 내용을 실제 확인했습니다. supplementalReferences에 개별 검토일과 확인 목적을 기록합니다. 이 기록은 외부 첫 링크의 HTTP 확인과 구분됩니다.\n\n` +
  `## 재실행\n\n\`npm run sources:sync\`는 로컬 캐시를 활용하여 인벤토리와 lesson 매핑을 갱신합니다. \`npm run sources:sync -- --refresh\`로 내부 원문을 다시 받고, \`npm run sources:sync -- --check-external\`로 처음 발견한 외부 링크를 확인합니다. 외부도 새로 확인하려면 두 옵션을 함께 사용합니다. 한 번에 외부 3개까지만 확인하며 각 요청은 6초 timeout을 둡니다. 원문 캐시 \`.cache/sources/\`는 Git과 배포에서 제외합니다.\n\n` +
  `원문 본문 해시가 달라지면 기존 reviewed가 해제됩니다. 새 글·변경 글은 사람이 실제 본문과 lesson을 대조한 뒤 manifest의 reviewed, reviewMethod, reviewedAt을 갱신하고 \`npm run check\`를 실행합니다. 동기화가 임의로 새 글을 검토 완료 처리하지 않습니다. 알려진 404 항목은 목록에 남기며, 미처리 URL·발견 단계 실패는 동기화 명령의 실패로 보고합니다.\n\n` +
  `## 해석·모델 범위\n\n클래식 ARM7/ARM9·ADS·WinCE 등 역사적 예는 현대 Cortex-M·Thumb-2와 구분했습니다. 캐시는 MMU 없이 존재할 수 있고, 스택·힙은 반드시 C 전역 배열로 구현되지 않으며, RAM 예산은 중복 영역을 합산하지 않습니다. 동적 원문 지식은 TI·Murata·USB-IF·Linux man-pages·AOSP 등의 공식/유지관리 원문으로 보충했습니다. 각 lesson의 출처 링크를 확인하세요.\n\n모든 lesson에는 고유 개념 관계도와 연결된 실험이 있지만, 인덕터·증폭기·전원 변환기·전송선·실제 CPU·RTOS·USB/Android 전체를 수치 시뮬레이션하지 않습니다. 9종의 결정론적 학습 실험을 관련 개념과 연결합니다. 이것은 SPICE나 보드 검증 도구가 아닙니다.\n\n` +
  `## 전체 내부 인벤토리\n\n| ID | 원문 | 상태 | 대응 lesson / 제외 이유 |\n|---|---|---|---|\n` +
  records
    .map(
      (e) =>
        `| ${e.id} | [${escapeCell(e.title)}](${e.url}) | ${e.httpStatus} · ${e.coverage} · reviewed=${e.reviewed} | ${escapeCell(e.lessonIds.join(', ') || e.exclusionReason || e.error || '접근 불가; 내용 검토 불가')} |`,
    )
    .join('\n') +
  `\n\n## 외부 첫 링크 인벤토리\n\n아래 HTTP 상태는 확인 시점의 첫 응답만 나타냅니다. 모든 항목의 외부 본문은 reviewed=false입니다.\n\n| 링크 제목 | HTTP / 상태 | 주제 대응 lesson |\n|---|---|---|\n` +
  externalReferences
    .map(
      (e) =>
        `| [${escapeCell(e.title)}](${e.url}) | ${e.httpStatus ?? '미확인'} · ${e.access} | ${escapeCell(e.topicLessonIds.join(', ') || e.scopeNote)} |`,
    )
    .join('\n') +
  '\n';
await mkdir(path.join(root, 'docs'), { recursive: true });
await writeFile(path.join(root, 'docs/source-audit.md'), report, 'utf8');
console.log(JSON.stringify(manifest.counts, null, 2));
if (manifest.truncated || errors.length) process.exitCode = 1;
