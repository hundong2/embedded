import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { categoryLabels, verifyGraph } from './build-graph.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const experiments = new Set([
  'current',
  'pull',
  'rc',
  'ohm',
  'logic',
  'pwm',
  'adc',
  'protocol',
  'memory',
]);
const categories = new Set(Object.keys(categoryLabels));
const notEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
const stringArray = (value, allowEmpty = false) =>
  Array.isArray(value) && (allowEmpty || value.length > 0) && value.every(notEmpty);

function normalizeUrl(value, allowUserInfo = false) {
  try {
    const parsed = new URL(value);
    if (!['https:', 'http:'].includes(parsed.protocol)) return null;
    if (!allowUserInfo && (parsed.username || parsed.password)) return null;
    parsed.hash = '';
    return parsed.href.replace(/\/$/, '');
  } catch {
    return null;
  }
}

export function validateLessons(lessons, manifest) {
  const errors = [];
  const require = (condition, message) => {
    if (!condition) errors.push(message);
  };
  require(Array.isArray(lessons) && lessons.length > 0, 'Lessons must be a nonempty array.');
  if (!Array.isArray(lessons)) return errors;
  const ids = new Set();
  lessons.forEach((lesson, index) => {
    const at = `lesson[${index}] ${lesson?.id ?? '(missing id)'}`;
    if (!lesson || typeof lesson !== 'object') {
      errors.push(`${at}: record must be an object.`);
      return;
    }
    require(typeof lesson.id === 'string' &&
      /^[a-z][a-z0-9-]*$/.test(lesson.id), `${at}: id must be a lowercase slug.`);
    require(!ids.has(lesson.id), `${at}: duplicate id.`);
    ids.add(lesson.id);
    ['title', 'level', 'summary', 'formula', 'pitfall'].forEach((field) =>
      require(notEmpty(lesson[field]), `${at}: ${field} must be nonempty text.`),
    );
    require(categories.has(lesson.category), `${at}: unknown category ${lesson.category}.`);
    require(Number.isInteger(lesson.minutes) &&
      lesson.minutes > 0 &&
      lesson.minutes <= 180, `${at}: minutes must be an integer in 1..180.`);
    require(stringArray(lesson.objectives), `${at}: objectives must contain nonempty text.`);
    require(stringArray(
      lesson.explanation,
    ), `${at}: explanation must contain nonempty paragraphs.`);
    require(stringArray(
      lesson.prerequisites,
      true,
    ), `${at}: prerequisites must be a string array.`);
    require(experiments.has(lesson.experiment?.kind), `${at}: unknown experiment kind.`);
    const visualNodes = Array.isArray(lesson.visual?.nodes) ? lesson.visual.nodes : [];
    require(visualNodes.length >= 2, `${at}: visual needs at least 2 nodes.`);
    require(notEmpty(lesson.visual?.caption), `${at}: visual caption must be nonempty text.`);
    const visualIds = new Map();
    for (const [nodeIndex, node] of visualNodes.entries()) {
      require(notEmpty(node) ||
        (notEmpty(node?.label) &&
          notEmpty(node?.detail)), `${at}: visual node[${nodeIndex}] needs text or label/detail.`);
      if (node?.id !== undefined) {
        require(notEmpty(node.id) &&
          !visualIds.has(
            node.id,
          ), `${at}: visual node[${nodeIndex}] id must be unique nonempty text.`);
        visualIds.set(node.id, nodeIndex);
      }
    }
    const visualEdges = Array.isArray(lesson.visual?.edges) ? lesson.visual.edges : [];
    require(visualEdges.length > 0, `${at}: visual needs nonempty edges.`);
    for (const [edgeIndex, edge] of visualEdges.entries()) {
      const endpointIndex = (endpoint) =>
        typeof endpoint === 'number'
          ? Number.isInteger(endpoint) && endpoint >= 0 && endpoint < visualNodes.length
            ? endpoint
            : -1
          : (visualIds.get(endpoint) ?? -1);
      const from = endpointIndex(edge?.from),
        to = endpointIndex(edge?.to);
      require(from >= 0 &&
        to >= 0, `${at}: visual edge[${edgeIndex}] endpoint does not resolve to a node.`);
      require(from < 0 ||
        to < 0 ||
        from !== to, `${at}: visual edge[${edgeIndex}] cannot point to itself.`);
      require(notEmpty(
        edge?.label,
      ), `${at}: visual edge[${edgeIndex}] needs a relationship label.`);
    }
    require(Array.isArray(lesson.sources) &&
      lesson.sources.length > 0, `${at}: sources must be nonempty.`);
    for (const [index, source] of (Array.isArray(lesson.sources) ? lesson.sources : []).entries()) {
      require(notEmpty(source?.title), `${at}: source[${index}] needs a title.`);
      require(Boolean(
        normalizeUrl(source?.url),
      ), `${at}: source[${index}] needs a public HTTP(S) URL.`);
    }
    const quiz = lesson.quiz;
    require(notEmpty(quiz?.question), `${at}: quiz question is missing.`);
    require(stringArray(quiz?.options) &&
      quiz.options.length >= 2, `${at}: quiz needs at least 2 options.`);
    require(Number.isInteger(quiz?.answer) &&
      quiz.answer >= 0 &&
      quiz.answer < (quiz.options?.length ?? 0), `${at}: quiz answer index is invalid.`);
    require(notEmpty(quiz?.explanation), `${at}: quiz explanation is missing.`);
  });

  const byId = new Map(lessons.filter(Boolean).map((lesson) => [lesson.id, lesson]));
  const visited = new Set();
  const active = new Set();
  function visit(id, chain = []) {
    if (active.has(id)) {
      errors.push(`Prerequisite cycle: ${[...chain, id].join(' → ')}`);
      return;
    }
    if (visited.has(id) || !byId.has(id)) return;
    active.add(id);
    const prerequisites = byId.get(id).prerequisites;
    if (Array.isArray(prerequisites)) {
      require(new Set(prerequisites).size ===
        prerequisites.length, `${id}: duplicate prerequisite.`);
      prerequisites.forEach((prerequisite) => {
        require(ids.has(prerequisite), `${id}: prerequisite ${prerequisite} does not exist.`);
        visit(prerequisite, [...chain, id]);
      });
    }
    active.delete(id);
    visited.add(id);
  }
  for (const id of ids) visit(id);

  require(manifest?.schemaVersion === 1, 'Source manifest schemaVersion must be 1.');
  require(Array.isArray(manifest?.entries) &&
    manifest.entries.length > 0, 'Source manifest entries must be nonempty.');
  if (!Array.isArray(manifest?.entries)) return errors;
  const sourceByUrl = new Map();
  const articleIds = new Set();
  for (const entry of manifest.entries) {
    if (!entry || typeof entry !== 'object') {
      errors.push('Source manifest entries must contain objects.');
      continue;
    }
    const at = `source ${entry.id ?? entry.url}`;
    require(notEmpty(String(entry.id ?? '')), `${at}: id is missing.`);
    require(!articleIds.has(entry.id), `${at}: duplicate source id.`);
    articleIds.add(entry.id);
    require(notEmpty(entry.title), `${at}: title is missing.`);
    require(Boolean(normalizeUrl(entry.url)), `${at}: invalid URL.`);
    require(['accessible', 'unavailable'].includes(entry.access), `${at}: unknown access state.`);
    require(typeof entry.reviewed === 'boolean', `${at}: reviewed must be boolean.`);
    require(['mapped', 'pending-lesson', 'out-of-scope'].includes(
      entry.coverage,
    ), `${at}: unknown coverage state.`);
    require(stringArray(entry.lessonIds, true), `${at}: lessonIds must be a string array.`);
    const urls = [entry.url, ...(Array.isArray(entry.aliases) ? entry.aliases : [])];
    for (const url of urls) {
      const normalized = normalizeUrl(url);
      if (normalized) {
        require(!sourceByUrl.has(normalized) ||
          sourceByUrl.get(normalized) ===
            entry, `${at}: URL or alias is shared by multiple articles: ${normalized}`);
        sourceByUrl.set(normalized, entry);
      }
    }
    if (entry.access === 'unavailable')
      require(!entry.reviewed, `${at}: unavailable article cannot be marked reviewed.`);
    if (entry.coverage === 'mapped') {
      require(entry.access === 'accessible' &&
        entry.reviewed, `${at}: mapped evidence must be accessible and reviewed.`);
      require(entry.lessonIds?.length > 0, `${at}: mapped article needs lessonIds.`);
      for (const lessonId of Array.isArray(entry.lessonIds) ? entry.lessonIds : []) {
        require(ids.has(lessonId), `${at}: mapped lesson ${lessonId} does not exist.`);
        const citations = byId.get(lessonId)?.sources ?? [];
        require(citations.some((citation) =>
          urls.some((url) => normalizeUrl(url) === normalizeUrl(citation.url)),
        ), `${at}: ${lessonId} must cite its mapped source.`);
      }
    }
    if (entry.coverage === 'out-of-scope') {
      require(notEmpty(entry.reason) ||
        notEmpty(entry.exclusionReason), `${at}: excluded article needs a reason.`);
      require(entry.lessonIds?.length === 0, `${at}: excluded article cannot map to lessons.`);
    }
    if (entry.coverage === 'pending-lesson')
      require(entry.lessonIds?.length ===
        0, `${at}: pending article cannot already map to lessons.`);
  }
  require(Array.isArray(
    manifest.supplementalReferences,
  ), 'Source manifest supplementalReferences must be an array.');
  const supplementalReferences = Array.isArray(manifest.supplementalReferences)
    ? manifest.supplementalReferences
    : [];
  const supplementalByUrl = new Map();
  for (const entry of supplementalReferences) {
    const at = `supplemental source ${entry?.url ?? '(missing URL)'}`;
    const url = normalizeUrl(entry?.url);
    require(Boolean(url), `${at}: invalid HTTP(S) URL.`);
    require(notEmpty(entry?.title), `${at}: title is missing.`);
    require(entry?.reviewed === true &&
      entry?.access ===
        'primary-content-checked', `${at}: supplemental evidence must be content-reviewed.`);
    require(notEmpty(entry?.reviewMethod) &&
      notEmpty(entry?.reviewedAt) &&
      Number.isFinite(
        Date.parse(entry.reviewedAt),
      ), `${at}: review method and valid date are required.`);
    require(stringArray(entry?.lessonIds) &&
      entry.lessonIds.every((id) => ids.has(id)), `${at}: lessonIds must resolve to lessons.`);
    if (url) {
      require(!supplementalByUrl.has(url), `${at}: duplicate supplemental URL.`);
      supplementalByUrl.set(url, entry);
    }
    for (const lessonId of Array.isArray(entry?.lessonIds) ? entry.lessonIds : []) {
      require(byId
        .get(lessonId)
        ?.sources?.some(
          (citation) => normalizeUrl(citation.url) === url,
        ), `${at}: ${lessonId} must cite its supplemental source.`);
    }
  }
  require(Array.isArray(
    manifest.externalReferences,
  ), 'Source manifest externalReferences must be an array.');
  const externalReferences = Array.isArray(manifest.externalReferences)
    ? manifest.externalReferences
    : [];
  const externalUrls = new Set();
  for (const entry of externalReferences) {
    const at = `external reference ${entry?.url ?? '(missing URL)'}`;
    // Keep malformed public evidence exactly as discovered; it cannot qualify
    // as reviewed content or a successful HTTP check, or become a citation.
    const retainedError =
      entry?.reviewed === false &&
      ['network-error', 'http-error'].includes(entry?.access) &&
      entry?.httpStatus === 0 &&
      notEmpty(entry?.error);
    const url = normalizeUrl(entry?.url) || (retainedError ? normalizeUrl(entry?.url, true) : null);
    require(Boolean(url), `${at}: invalid HTTP(S) URL.`);
    require(typeof entry?.reviewed === 'boolean', `${at}: reviewed must be boolean.`);
    require(stringArray(
      entry?.topicLessonIds,
      true,
    ), `${at}: topicLessonIds must be a string array.`);
    for (const id of Array.isArray(entry?.topicLessonIds) ? entry.topicLessonIds : [])
      require(ids.has(id), `${at}: topic lesson ${id} does not exist.`);
    if (url) {
      require(!externalUrls.has(url), `${at}: duplicate external URL.`);
      externalUrls.add(url);
    }
    if (entry?.finalUrl !== undefined)
      require(Boolean(normalizeUrl(entry.finalUrl)), `${at}: invalid final HTTP(S) URL.`);
    if (entry?.checkedAt)
      require(Number.isFinite(Date.parse(entry.checkedAt)), `${at}: invalid checkedAt date.`);
    if (entry?.access === 'http-accessible-unreviewed')
      require(Number.isInteger(entry.httpStatus) &&
        entry.httpStatus >= 200 &&
        entry.httpStatus < 300, `${at}: HTTP accessible status must be 2xx.`);
  }
  for (const lesson of lessons.filter(Boolean)) {
    for (const citation of Array.isArray(lesson.sources) ? lesson.sources : []) {
      const url = normalizeUrl(citation.url);
      if (!url) continue;
      if (new URL(url).hostname !== 'recipes.tistory.com') {
        const supplemental = supplementalByUrl.get(url);
        require(Boolean(
          supplemental,
        ), `${lesson.id}: citation is absent from reviewed supplemental references: ${url}`);
        if (supplemental)
          require(supplemental.reviewed === true &&
            supplemental.lessonIds?.includes(
              lesson.id,
            ), `${lesson.id}: supplemental citation must be reviewed and map to this lesson: ${url}`);
        continue;
      }
      const source = sourceByUrl.get(url);
      require(Boolean(
        source,
      ), `${lesson.id}: cited article is absent from the discovered inventory: ${url}`);
      if (source) {
        require(source.access === 'accessible' &&
          source.reviewed, `${lesson.id}: citation was not reviewed: ${url}`);
        require(source.coverage === 'mapped' &&
          source.lessonIds?.includes(
            lesson.id,
          ), `${lesson.id}: source mapping must include this lesson: ${url}`);
      }
    }
  }
  const counts = {
    articles: manifest.entries.length,
    accessible: manifest.entries.filter((entry) => entry?.access === 'accessible').length,
    unavailable: manifest.entries.filter((entry) => entry?.access === 'unavailable').length,
    mapped: manifest.entries.filter((entry) => entry?.coverage === 'mapped').length,
    pending: manifest.entries.filter((entry) => entry?.coverage === 'pending-lesson').length,
    excluded: manifest.entries.filter((entry) => entry?.coverage === 'out-of-scope').length,
    externalLinks: externalReferences.length,
    externalChecked: externalReferences.filter((entry) => entry?.checkedAt).length,
    externalHttpAccessible: externalReferences.filter(
      (entry) => entry?.access === 'http-accessible-unreviewed',
    ).length,
    externalTopicMapped: externalReferences.filter((entry) => entry?.topicLessonIds?.length > 0)
      .length,
    supplementalReviewed: supplementalReferences.filter((entry) => entry?.reviewed === true).length,
  };
  if (Object.hasOwn(manifest.counts ?? {}, 'reviewed'))
    counts.reviewed = manifest.entries.filter((entry) => entry?.reviewed === true).length;
  for (const [key, expected] of Object.entries(counts))
    require(manifest.counts?.[key] ===
      expected, `Source manifest counts.${key} must equal ${expected}.`);
  return errors;
}

async function main() {
  const { lessons } = await import(pathToFileURL(resolve(root, 'src/data/lessons.js')));
  const manifest = JSON.parse(
    await readFile(resolve(root, 'public/data/source-manifest.json'), 'utf8'),
  );
  const errors = validateLessons(lessons, manifest);
  if (errors.length === 0 && !(await verifyGraph(lessons)))
    errors.push('Knowledge graph is missing or stale. Run npm run graph.');
  if (errors.length) {
    console.error(
      `Content validation failed (${errors.length}):\n${errors.map((message) => `- ${message}`).join('\n')}`,
    );
    process.exitCode = 1;
    return;
  }
  console.log(
    `Content contract: ${lessons.length} lessons; ${manifest.entries.length} sources; acyclic prerequisites; graph current.`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
