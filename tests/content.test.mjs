import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLessons } from '../scripts/validate-content.mjs';
import { createKnowledgeGraph, serializeGraph } from '../scripts/build-graph.mjs';

function fixture() {
  const lesson = {
    id: 'closed-loop',
    title: '닫힌 회로',
    category: 'electricity',
    level: '기초',
    minutes: 8,
    summary: '닫힌 경로에서 전류가 흐른다.',
    objectives: ['귀환 경로를 찾는다.'],
    explanation: ['전원과 부하와 귀환선이 닫힌 경로를 이룬다.'],
    formula: 'I = V / R',
    pitfall: 'GND는 전하를 버리는 곳이 아니다.',
    experiment: { kind: 'current' },
    visual: {
      nodes: [
        { label: '전원', detail: '전위차를 만든다.' },
        { label: '부하', detail: '전기 에너지를 전달받는다.' },
      ],
      edges: [{ from: 0, to: 1, label: '에너지 전달' }],
      caption: '전원과 부하의 관계',
    },
    sources: [{ title: '검토한 출처', url: 'https://recipes.tistory.com/1' }],
    prerequisites: [],
    quiz: {
      question: '전류가 흐르는 조건은?',
      options: ['닫힌 경로', '열린 경로'],
      answer: 0,
      explanation: '귀환 경로가 필요하다.',
    },
  };
  const manifest = {
    schemaVersion: 1,
    counts: {
      articles: 1,
      accessible: 1,
      unavailable: 0,
      mapped: 1,
      pending: 0,
      excluded: 0,
      externalLinks: 0,
      externalChecked: 0,
      externalHttpAccessible: 0,
      externalTopicMapped: 0,
      supplementalReviewed: 0,
    },
    entries: [
      {
        id: '1',
        url: lesson.sources[0].url,
        title: '검토한 출처',
        access: 'accessible',
        reviewed: true,
        coverage: 'mapped',
        lessonIds: [lesson.id],
        aliases: [],
      },
    ],
    externalReferences: [],
    supplementalReferences: [],
  };
  return { lessons: [lesson], manifest };
}

test('a reviewed, reciprocally mapped source satisfies the content contract', () => {
  const { lessons, manifest } = fixture();
  assert.deepEqual(validateLessons(lessons, manifest), []);
});

test('a prerequisite cycle fails even when all target lessons exist', () => {
  const { lessons, manifest } = fixture();
  lessons.push({
    ...structuredClone(lessons[0]),
    id: 'reference-ground',
    prerequisites: ['closed-loop'],
  });
  lessons[0].prerequisites = ['reference-ground'];
  manifest.entries[0].lessonIds.push('reference-ground');
  assert.ok(
    validateLessons(lessons, manifest).some((error) => error.includes('Prerequisite cycle')),
  );
});

test('an unavailable or unreviewed post cannot silently become lesson evidence', () => {
  const { lessons, manifest } = fixture();
  manifest.entries[0].access = 'unavailable';
  manifest.entries[0].reviewed = false;
  manifest.counts.accessible = 0;
  manifest.counts.unavailable = 1;
  const errors = validateLessons(lessons, manifest);
  assert.ok(
    errors.some((error) => error.includes('mapped evidence must be accessible and reviewed')),
  );
  assert.ok(errors.some((error) => error.includes('citation was not reviewed')));
});

test('a changed source mapping cannot leave a stale reciprocal lesson citation', () => {
  const { lessons, manifest } = fixture();
  lessons[0].sources[0].url = 'https://example.org/alternate';
  assert.ok(
    validateLessons(lessons, manifest).some((error) =>
      error.includes('must cite its mapped source'),
    ),
  );
});

test('an out-of-range quiz answer is rejected', () => {
  const { lessons, manifest } = fixture();
  lessons[0].quiz.answer = 2;
  assert.ok(
    validateLessons(lessons, manifest).some((error) => error.includes('answer index is invalid')),
  );
});

test('a malformed concept visual is rejected before it can break the lesson renderer', () => {
  const { lessons, manifest } = fixture();
  lessons[0].visual = { nodes: [{ label: '전원', detail: '' }, null] };
  const errors = validateLessons(lessons, manifest);
  assert.equal(errors.filter((error) => error.includes('visual node')).length, 2);
});

test('a concept edge cannot silently disappear because it points beyond the node list', () => {
  const { lessons, manifest } = fixture();
  lessons[0].visual.edges[0].to = 2;
  assert.ok(
    validateLessons(lessons, manifest).some((error) => error.includes('endpoint does not resolve')),
  );
});

test('graph encodes prerequisite direction and remains byte deterministic', () => {
  const { lessons } = fixture();
  lessons.push({
    ...structuredClone(lessons[0]),
    id: 'reference-ground',
    prerequisites: ['closed-loop'],
  });
  const graph = createKnowledgeGraph(lessons);
  assert.deepEqual(
    graph.edges.find((edge) => edge.type === 'prerequisite'),
    {
      id: 'prerequisite:closed-loop:reference-ground',
      source: 'closed-loop',
      target: 'reference-ground',
      type: 'prerequisite',
    },
  );
  assert.equal(serializeGraph(lessons), serializeGraph(structuredClone(lessons)));
  assert.equal(graph.nodes.filter((node) => node.type === 'category').length, 1);
});

test('shared evidence is one source node with separate, traceable lesson citation edges', () => {
  const { lessons } = fixture();
  lessons.push({
    ...structuredClone(lessons[0]),
    id: 'reference-ground',
    prerequisites: ['closed-loop'],
  });
  lessons[1].sources[0].url += '#section';
  const graph = createKnowledgeGraph(lessons);
  assert.deepEqual(
    graph.nodes.filter((node) => node.type === 'source'),
    [
      {
        id: 'source:https://recipes.tistory.com/1',
        type: 'source',
        label: '검토한 출처',
        url: 'https://recipes.tistory.com/1',
      },
    ],
  );
  const citations = graph.edges.filter((edge) => edge.type === 'citation');
  assert.equal(citations.length, 2);
  assert.deepEqual(
    new Set(citations.map((edge) => edge.source)),
    new Set(['closed-loop', 'reference-ground']),
  );
  assert.ok(citations.every((edge) => edge.target === 'source:https://recipes.tistory.com/1'));
});

test('HTTP discovery alone cannot approve a supplemental source used as lesson evidence', () => {
  const { lessons, manifest } = fixture();
  const source = { title: '공식 보충 자료', url: 'https://example.org/official' };
  lessons[0].sources.push(source);
  manifest.supplementalReferences = [
    {
      ...source,
      reviewed: false,
      access: 'http-accessible-unreviewed',
      lessonIds: ['closed-loop'],
    },
  ];
  assert.ok(
    validateLessons(lessons, manifest).some((error) => error.includes('must be content-reviewed')),
  );
  Object.assign(manifest.supplementalReferences[0], {
    reviewed: true,
    access: 'primary-content-checked',
    reviewedAt: '2026-10-16',
    reviewMethod: '해당 개념의 공식 설명을 확인함.',
  });
  manifest.counts.supplementalReviewed = 1;
  assert.deepEqual(validateLessons(lessons, manifest), []);
});

test('external metadata cannot point to a missing lesson or overstate its published counts', () => {
  const { lessons, manifest } = fixture();
  manifest.externalReferences = [
    {
      url: 'https://example.org/external',
      reviewed: false,
      topicLessonIds: ['deleted-topic'],
      checkedAt: '2026-10-16',
      access: 'http-accessible-unreviewed',
      httpStatus: 200,
    },
  ];
  const errors = validateLessons(lessons, manifest);
  assert.ok(errors.some((error) => error.includes('topic lesson deleted-topic does not exist')));
  assert.ok(errors.some((error) => error.includes('counts.externalLinks must equal 1')));
  assert.ok(errors.some((error) => error.includes('counts.externalHttpAccessible must equal 1')));
  Object.assign(manifest.externalReferences[0], {
    url: 'http://git@bitbucket.org',
    topicLessonIds: ['closed-loop'],
    access: 'network-error',
    httpStatus: 0,
    error: 'Original public URL has Git user syntax.',
  });
  Object.assign(manifest.counts, {
    externalLinks: 1,
    externalChecked: 1,
    externalHttpAccessible: 0,
    externalTopicMapped: 1,
  });
  assert.deepEqual(validateLessons(lessons, manifest), []);
  manifest.externalReferences[0].reviewed = true;
  assert.ok(
    validateLessons(lessons, manifest).some((error) => error.includes('invalid HTTP(S) URL')),
  );
});
