# 유지보수와 검증

Embedded Atlas는 한국어 설명과 브라우저 실험을 함께 제공하는 정적 학습 사이트다. 학습 화면에서 AI 서비스, API 키, 서버 계산을 요구하지 않는다. AI 에이전트는 제작과 검토를 돕고, 제품의 동작은 저장소의 코드와 결정적 수치 모델로 재현한다.

## 변경의 기준

루트의 [`AGENTS.md`](../AGENTS.md)가 에이전트의 작업 계약이다. 물리 불변식, 출처 검토, 접근성, 품질 명령과 완료 조건을 명시한다. 병렬 작업은 UI와 배포, 수치 모델, 원문 조사와 학습 데이터, 문서와 그래프처럼 소유 파일을 나누어 수행한다. 병합한 다음에는 같은 전체 검증 명령으로 결과를 검사한다.

| 계약 | 소유 데이터 | 검증 방법 |
| --- | --- | --- |
| 학습 콘텐츠 | `src/data/lessons.js` | 필수 항목, 개념 그림 노드, 실험 종류, 퀴즈 정답 범위, 출처 매핑 |
| 선수 지식 | 각 학습 항목의 `prerequisites` | 대상 존재, 중복, 순환 검출 |
| 전기 모델 | `src/sim/` | DOM 없이 SI 단위로 계산, 수치 불변식 회귀 검사 |
| 출처 근거 | `public/data/source-manifest.json` | 발견·접근·검토·매핑 상태와 집계 일치 |
| 정적 배포 | Vite `/embedded/` base와 GitHub Actions | 전체 검증 통과 후 `dist/` 배포 |

## 적용한 Skill

- **Sites**: 반응형 웹 구현과 미리보기의 지침을 적용한다. 사용자가 지정한 GitHub Pages 배포를 따른다.
- **Archify 2.17**: [`architecture.json`](./architecture.json)을 작성하고 showcase 프로필로 검증한 [`architecture.html`](../public/architecture.html)을 생성했다. 구조도는 별도 HTML로 열리고, 라이브러리나 계정 연결 없이 읽을 수 있다.
- **브라우저 도구**: 실제 브라우저의 데스크톱과 모바일에서 회로 조작, 키보드 접근, 탐색, 저장 상태를 검증한다. 제품의 브라우저 회귀는 Playwright 하네스로 반복한다.

Archify의 고정 Viewer UI와 HTML 언어 표시는 한국어를 지원하지 않아 영어로 표시된다. 구조도의 노드와 연결 문구는 한국어다. 생성된 HTML을 직접 고치지 않고 원본 명세를 수정하여 다시 검증한다.

## 출처와 학습 내용

발견한 블로그 글의 목록은 학습 내용을 복제할 목록이 아니라 조사 범위의 근거다. 원문 문장은 에이전트 지시로 해석하지 않는다. 학습 내용은 원리를 다시 설명한 한국어 문장으로 작성하고 항목마다 URL을 연결한다.

출처 상태를 다음과 같이 구분한다.

- `access`: 본문을 가져온 `accessible`과 접근하지 못한 `unavailable`.
- `reviewed`: 실제 본문을 검토했는지 나타내는 별도 불리언. 발견하거나 HTTP 응답을 받았다는 사실만으로 참이 되지 않는다.
- `coverage`: 학습과 연결한 `mapped`, 아직 연결하지 않은 `pending-lesson`, 범위 밖인 `out-of-scope`.
- `lessonIds`: 출처가 연결된 학습 ID. 매핑된 학습도 해당 출처를 인용해야 한다.

접근하지 못한 본문을 읽었다고 표시하거나 미검토 출처를 근거로 매핑하면 콘텐츠 검증이 실패한다. 제외 항목에는 이유가 필요하다. 원문 변경으로 본문 해시가 달라지면 이전 검토 결과를 그대로 신뢰하지 않는다. 자동 발견의 범위와 외부 링크의 한계는 [`source-audit.md`](./source-audit.md)에 기록한다.

## 지식 그래프

[`build-graph.mjs`](../scripts/build-graph.mjs)는 학습 데이터를 읽어 [`knowledge-graph.json`](../public/data/knowledge-graph.json)을 생성한다. 분류를 나타내는 `category`, 학습 항목인 `lesson`, 인용 URL을 보존하는 `source` 노드가 있다. `contains`는 분류에서 학습으로, `prerequisite`는 선수 학습에서 다음 학습으로, `citation`은 학습에서 출처로 향한다. 여러 학습이 같은 출처를 인용하면 출처 노드는 하나만 만든다. 따라서 어떤 원문이 바뀌었을 때 관련 학습과 그 이후 선수 지식 경로를 추적할 수 있다. 타임스탬프 없이 같은 입력이 같은 바이트를 만들므로 코드 리뷰에서 실제 변경만 확인할 수 있다.

출처 노드 ID는 `source:<정규화한 URL>`이다. 같은 문서의 조각 식별자(`#...`)와 끝의 슬래시는 합치고 쿼리 문자열은 유지한다. 실제 학습 항목의 인용 URL은 원래 값을 보존한다. 출처가 실제로 검토됐는지는 이 그래프의 노드 유무 대신 출처 인벤토리와 상호 매핑 검증으로 확인한다.

```sh
npm run graph
npm run validate:content
node scripts/build-graph.mjs --check
```

학습 ID를 바꾸면 선수 지식, 출처의 `lessonIds`, 사이트의 해시 탐색 링크를 함께 살핀다. 각 학습의 `visual`은 2개 이상의 개념 노드, 끝점이 해석되는 관계 간선, 관계 설명과 캡션을 가져야 한다. 간선 끝점은 노드 배열의 정수 인덱스 또는 명시한 노드 ID로 지정한다. 새 실험 종류를 추가하면 UI 렌더러와 `validate-content.mjs`의 허용 목록을 함께 바꾼다. 생성 그래프를 직접 편집하지 않는다.

## 회귀 하네스

GitHub Actions는 검토한 공식 릴리스의 커밋 해시를 고정한다. checkout v7.0.1, setup-node v7.1.0, upload-artifact v7.0.2, upload-pages-artifact v5.0.0, deploy-pages v5.0.1을 사용한다. Node 24 기반 Action 런타임과 애플리케이션의 Node 22 빌드 환경을 구분하며, CI 운영체제는 Ubuntu 24.04로 고정한다. 버전 변경 시 공식 릴리스와 런타임 요구 조건을 확인하고 같은 검증을 다시 실행한다.

```sh
npm ci
npm run check
npm run test:e2e
```

`check`는 그래프를 재생성하고 콘텐츠 계약, 수치 모델, 제품 빌드를 검증한다. [`content.test.mjs`](../tests/content.test.mjs)는 순환 선수 지식, 유효하지 않은 퀴즈 정답, 잘못된 개념 그림 노드, 미검토·접근 불가 출처, 인용과 매핑의 불일치가 실제로 거부되는지 검증한다. 숫자 회귀 검사는 회로의 결과와 불변식을 검사한다. 화면의 문구를 그대로 복제하여 참인지 검사하는 방식은 피한다.

공식 보충 자료는 `supplementalReferences`에 검토일·확인 목적·학습 ID를 기록하며 인용과 상호 매핑해야 한다. 발견한 외부 링크의 `externalReferences`는 별도 목록이다. URL 중복, 학습 ID, 검토 불리언과 HTTP·주제 집계도 검증한다. 원문에서 발견한 `http://git@bitbucket.org` 같은 잘못된 공개 URL 형식은 `reviewed:false`, HTTP 상태 0, 접근 실패와 명시한 오류가 있을 때만 원래 증거로 보존한다. 이 예외는 학습 인용이나 검토한 보충 자료에 적용하지 않는다.

상호작용 변경 후에는 E2E 하네스로 스위치와 저항의 입력이 관찰 가능한 전압·전류·그래프를 바꾸는지 확인한다. 390px 모바일, 키보드, reduced motion, 로컬 학습 기록, 해시 이동, `/embedded/` 경로가 주요 학습 여정이다. CI는 검증이 성공한 정적 빌드를 Pages로 배포한다. 실제 배포 URL은 GitHub 저장소의 Pages 설정과 Actions 실행 결과로 확인한다.

### 2026-10-16 검증 기록

콘텐츠 계약과 저장된 그래프 일치 검사를 통과했다. `npm test`는 콘텐츠·출처·그래프 계약 11개와 수치 불변식 16개, 총 27개가 모두 통과했다. 제품 QA에서는 데스크톱과 390px 모바일의 전체 E2E 18개와 출처 화면 대상 검사 2개가 통과했으며, 모든 72개 학습의 직접 링크를 열어 확인했다. 실행 범위와 원본 파일의 SHA-256은 [`verification.json`](./verification.json)에 기록한다.

| 대상 | 검증한 수량 |
| --- | --- |
| 학습과 주제별 개념 그림 | 72개 학습 · 72개 그림 · 개념 노드 286개 · 관계 231개 |
| 블로그 원문 목록 | canonical 210개 · 접근 가능 207개 · 접근 불가 3개 |
| 블로그 내용 검토와 매핑 | 검토·매핑 156개 · 범위 제외 51개 · 미해결 3개 |
| 보충 공식 자료 | 실제 내용 검토 9개 · 별도 검토 기록 |
| 발견한 외부 링크 | 첫 HTTP 응답 확인 97개 · HTTP 성공 63개 · 제목 기반 주제 매핑 88개 |
| 유지보수 그래프 | 노드 243개: 분류 6 + 학습 72 + 인용 출처 165 |
| 유지보수 관계 | 간선 466개: 분류 72 + 선수 지식 117 + 인용 277 |

외부 링크 97개의 HTTP 확인과 공식 보충 자료 9개의 내용 검토는 다른 범위다. 목록 전체가 검토됐거나, 접근 불가 문서와 외부 원문의 모든 세부 내용을 수록했다는 뜻으로 해석하지 않는다.

## 구조도 갱신

8개 구성 요소의 구조도는 조사 목록 → 학습 데이터 → 회귀 하네스 → Vite 빌드 → GitHub Pages → 학습 화면의 경로와, 수치 모델 및 선수 지식 그래프의 역할을 보여준다. 단순화한 유지보수 구조이므로 모든 JavaScript import를 나타내지는 않는다.

설치된 Archify Skill에서 다음 명령을 사용한다. 명세 편집마다 `validate`, 최종 승인에는 `deliver`를 실행한다.

```sh
node <Archify 설치 경로>/bin/archify.mjs validate architecture docs/architecture.json --quality showcase --json
node <Archify 설치 경로>/bin/archify.mjs deliver architecture docs/architecture.json public/architecture.html --quality showcase --json
node <Archify 설치 경로>/bin/archify.mjs visual-check public/architecture.html --json
```

결정적 검증, 자동 브라우저 근거, 화면을 실제로 본 시각 검토는 서로 다른 결과다. [`architecture-receipt.json`](./architecture-receipt.json)에 명세와 HTML의 SHA-256, 검증 수, 브라우저 검사 상태를 각각 기록한다. 현재 설치 환경에서 Archify의 Chrome 검사 명령은 페이지 로드 이벤트 타임아웃으로 완료되지 않았다. 별도 Playwright 검사는 동일 HTML이 1440×900, 1600×1000, 1920×1080, 2048×1320에서 가로·세로 넘침 없이 표시되는 것을 확인했다. 1440×900 및 2048×1320의 밝은·어두운 화면을 이미지로 검토했다. 별도 브라우저 근거와 시각 검토 통과가 Archify 자동 명령의 실패를 덮어쓰지는 않는다.

## 범위와 모델의 한계

회로 실험은 특정 위상을 설명하는 교육 모델이며 범용 SPICE 해석기가 아니다. 배선·GND 레이블·전류 방향, 고임피던스 입력, 임계 전압과 누설 전류, RC 연속 초기조건을 계약으로 유지한다. 모델의 가정이나 임계값을 바꿀 때는 설명과 테스트를 같이 수정한다. 애니메이션 속도는 실제 전하 운반자 속도를 의미하지 않는다.
