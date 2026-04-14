# 프론트엔드 계약서

> 상태: v0.1.0  
> 소유: Codex  
> 앱 위치: `frontend/`  
> 기준 문서: `docs/CONTRACT.md`, `docs/design/DESIGN.md`, `docs/design/design prompt.html`

---

## 1. 목적

프론트엔드는 학교폭력 담당 교사가 사안 접수와 서식별 문구 생성을 빠르게 수행하도록 돕는 업무 화면이다.

MVP는 HWP/HWPX 문서 전체를 편집하는 도구가 아니라, 사용자가 기존 서식과 공문 기록 프로그램에 바로 복사해 붙여넣을 수 있는 `copy_blocks`를 생성하고 검토하는 화면을 우선한다.

---

## 2. 작업 원칙

1. API 경로, enum, 응답 envelope는 `docs/CONTRACT.md`를 따른다.
2. UI 디자인은 `docs/design/DESIGN.md`의 Digital Jurist 방향을 따르되, 한국어 행정 업무 화면으로 자연스럽게 조정한다.
3. 외부 모델이 만든 코드나 시안은 참고 자료로만 사용한다. 적용 전에는 Codex가 빌드, 타입, 계약 준수 여부를 검증한다.
4. 기능은 `pages`, `components`, `types`, `mocks`, 향후 `features` 단위로 분리한다.
5. 긴 행정 문구와 학생/보호자 관련 텍스트는 모바일에서 넘치지 않아야 한다.
6. AI 문구는 초안이며, UI는 항상 교사 검토가 필요하다는 흐름을 유지한다.

---

## 3. 현재 기술 스택

| 항목 | 기준 |
|---|---|
| Framework | React + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | Material Symbols |
| Font | Pretendard 기본, Manrope/Inter 보조 |
| 실행 | `cd frontend && npm run dev -- --host 127.0.0.1` |
| 검증 | `cd frontend && npm run build` |

---

## 4. 폴더 구조 목표

현재 구조는 작은 MVP 화면을 기준으로 유지한다.

```text
frontend/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  postcss.config.js
  tailwind.config.js
  src/
    App.tsx
    main.tsx
    index.css
    components/
      CopyBlockCard.tsx
    pages/
      CaseIntake.tsx
      CaseDocuments.tsx
    mocks/
      api.ts
    types/
      index.ts
```

화면 수가 늘어나면 아래 구조로 확장한다.

```text
frontend/src/
  app/
  components/
  features/
    intake/
    documents/
    cases/
    dashboard/
  mocks/
  styles/
  types/
```

---

## 5. 핵심 화면

### Case Intake

- `<서식10>` 사안접수 보고를 위한 화면이다.
- 사용자의 비정형 `사실 확인내용`을 행정문체 초안으로 정리한다.
- 생성 결과는 `copy_blocks` 카드로 보여준다.
- 판단 단정 표현을 피하고, 교사 검토 필요 상태를 표시한다.

### Case Documents

- `<서식12>` 사안조사 보고서 입력을 핵심 source로 둔다.
- `<서식12>` 저장 전에는 `<서식18/19/20/21/22>` 생성 요청을 막거나 명확한 에러를 보여준다.
- `<서식12>` 저장 후 수정되면 dirty 상태를 표시하고, 저장되지 않은 변경분으로 후속 문구를 생성하지 않는다.
- `<서식22>`는 `<서식19/20/21>` 결과가 필요한 종합 생성 흐름으로 다룬다.

### CopyBlockCard

카드는 아래 값을 표시한다.

- `label`
- `source_form`
- `target_form`
- `target_field`
- `text`
- `char_limit`
- `style_profile`
- `review_required`

필수 액션은 다음과 같다.

- 복사하기
- 복사 성공/실패 상태
- 글자 수 표시
- 글자 수 초과 경고

---

## 6. API 응답 기준

모든 mock JSON은 공통 envelope를 유지한다.

```json
{
  "status": "success",
  "data": {},
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-04-14T09:00:00+09:00"
  }
}
```

문서 생성 결과는 항상 `data.copy_blocks`를 렌더링 기준으로 삼는다.

주요 에러:

- `FORM_SOURCE_REQUIRED`
- `FORM_SOURCE_DIRTY`
- `FORM_DEPENDENCIES_MISSING`
- `DOCUMENT_JOB_RUNNING`
- `AI_SERVICE_UNAVAILABLE`
- `AI_GENERATION_FAILED`

---

## 7. 디자인 기준

- 전체 화면은 단순한 카드 뭉치가 아니라 업무용 workspace처럼 보여야 한다.
- 표면 색, 여백, 타이포 계층으로 구획한다.
- 과한 파란색 단일 팔레트, 과한 border, 카드 안의 카드 중첩을 피한다.
- 버튼 radius는 8px 이하를 기본으로 한다.
- 사용자-facing 문구는 한국어 행정 업무 맥락에 맞춘다.
- `index.html`은 직접 여는 파일이 아니라 Vite 엔트리다. 브라우저에서는 dev server URL로 확인한다.

---

## 8. 완료 기준

프론트 변경 후 아래를 확인한다.

1. `npm run build`가 통과한다.
2. `src` 안에 `.js`, `.d.ts`, `.map` 산출물이 생기지 않는다.
3. `copy_blocks` mock shape가 `docs/CONTRACT.md`와 일치한다.
4. `<서식12>` 저장/dirty/source required 흐름이 깨지지 않는다.
5. 모바일 폭에서 주요 버튼과 긴 문구가 부모 영역을 넘치지 않는다.
