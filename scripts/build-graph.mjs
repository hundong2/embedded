import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const graphPath = resolve(root, 'public/data/knowledge-graph.json');

export const categoryLabels = {
  electricity: '전기의 기초',
  components: '소자와 회로',
  digital: '디지털 신호',
  mcu: '마이크로컨트롤러',
  interfaces: '통신과 인터페이스',
  firmware: '펌웨어와 개발 도구',
};

/** Stable, timestamp-free graph: content changes are visible in a normal diff. */
export function createKnowledgeGraph(lessons) {
  const categories = [...new Set(lessons.map((lesson) => lesson.category))].sort();
  const sourceByUrl = new Map();
  const canonicalUrl = (url) => {
    const parsed = new URL(url);
    parsed.hash = '';
    return parsed.href.replace(/\/$/, '');
  };
  for (const lesson of lessons) {
    for (const source of lesson.sources) {
      const url = canonicalUrl(source.url);
      if (!sourceByUrl.has(url)) sourceByUrl.set(url, { title: source.title, url });
    }
  }
  const sources = [...sourceByUrl.values()].sort((a, b) => a.url.localeCompare(b.url, 'en'));
  const nodes = [
    ...categories.map((category) => ({
      id: `category:${category}`,
      type: 'category',
      label: categoryLabels[category] ?? category,
    })),
    ...lessons.map((lesson) => ({
      id: lesson.id,
      type: 'lesson',
      label: lesson.title,
      category: lesson.category,
      experiment: lesson.experiment.kind,
    })),
    ...sources.map((source) => ({
      id: `source:${source.url}`,
      type: 'source',
      label: source.title,
      url: source.url,
    })),
  ];
  const edges = lessons
    .flatMap((lesson) => [
      {
        id: `contains:${lesson.category}:${lesson.id}`,
        source: `category:${lesson.category}`,
        target: lesson.id,
        type: 'contains',
      },
      ...lesson.prerequisites.map((prerequisite) => ({
        id: `prerequisite:${prerequisite}:${lesson.id}`,
        source: prerequisite,
        target: lesson.id,
        type: 'prerequisite',
      })),
      ...[...new Set(lesson.sources.map((source) => canonicalUrl(source.url)))].map((url) => ({
        id: `citation:${lesson.id}:${url}`,
        source: lesson.id,
        target: `source:${url}`,
        type: 'citation',
      })),
    ])
    .sort((a, b) => a.id.localeCompare(b.id, 'en'));

  return {
    schemaVersion: 1,
    generatedFrom: ['src/data/lessons.js'],
    nodes,
    edges,
  };
}

export function serializeGraph(lessons) {
  return `${JSON.stringify(createKnowledgeGraph(lessons), null, 2)}\n`;
}

export async function verifyGraph(lessons) {
  const expected = serializeGraph(lessons);
  let actual;
  try {
    actual = await readFile(graphPath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
  return actual === expected;
}

async function main() {
  const { lessons } = await import(pathToFileURL(resolve(root, 'src/data/lessons.js')));
  if (!Array.isArray(lessons)) throw new Error('src/data/lessons.js must export a lessons array.');
  if (process.argv.includes('--check')) {
    if (!(await verifyGraph(lessons))) {
      console.error('Knowledge graph is stale. Run npm run graph after editing lessons.');
      process.exitCode = 1;
      return;
    }
    console.log('Knowledge graph matches lesson records.');
    return;
  }
  await mkdir(dirname(graphPath), { recursive: true });
  await writeFile(graphPath, serializeGraph(lessons));
  const graph = createKnowledgeGraph(lessons);
  console.log(`Knowledge graph: ${graph.nodes.length} nodes, ${graph.edges.length} edges.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
