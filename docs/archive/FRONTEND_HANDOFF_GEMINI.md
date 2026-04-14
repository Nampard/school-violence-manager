# Frontend Handoff for Gemini 3.1

> 보관용 문서다. 현재 구현 기준은 `docs/FRONTEND_CONTRACT.md`이며, 프론트엔드는 Codex가 관리한다.

> 대상: VS Code Copilot 내 Gemini 3.1  
> 목적: 학교폭력 관리 프로그램 프론트엔드 구현 지시서  
> 기준 문서: `API_CONTRACT.md`, `stitch/DESIGN.md`, `stitch/design prompt.html`

---

## 1. 먼저 읽을 파일

프론트 구현 전에 아래 파일을 순서대로 읽는다.

1. `API_CONTRACT.md` - API, enum, 권한, 서식 생성 파이프라인의 원본 계약
2. `stitch/DESIGN.md` - "Digital Jurist" 디자인 시스템
3. `stitch/design prompt.html` - Tailwind/Material Symbols 기반 화면 참고

API 경로, enum, 응답 shape는 프론트에서 임의 변경하지 않는다. 변경이 필요하면 제안만 남긴다.

---

## 2. 핵심 제품 방향

이 앱은 HWP/HWPX 파일을 매번 직접 작성하는 편집기가 아니다. MVP의 핵심은 사용자가 공문/서식 프로그램에 바로 복사해 붙여넣을 수 있는 행정문체 텍스트 블록을 생성하는 것이다.

중심 흐름은 다음과 같다.

```text
<서식10> 사안접수 보고
  -> <서식12> 사안조사 보고서 입력
  -> <서식18/19> 전담기구 심의결과 보고서 문구 생성
  -> <서식20/21> 학교장 자체해결/종결 동의서 문구 생성
  -> <서식22> 학교장 자체해결/종결 결과 보고서 문구 생성
```

특히 `<서식12>`는 외주 조사관이 작성해 오는 핵심 source다. `<서식12>`가 저장되어야 `<서식18/19/20/21/22>` 생성 액션이 활성화된다.

---

## 3. 화면 구성

### Dashboard

- 진행 중 사안, 긴급 작업, 마감일, 상태별 집계를 보여준다.
- 큰 숫자와 주요 타이틀은 `Manrope`, 본문과 메타 정보는 `Inter`를 사용한다.

### Case Intake

- `<서식10>` 사안접수 보고를 위한 입력 화면이다.
- 사용자가 두서없이 적은 `사실 확인내용`을 받아 행정문체로 정리하는 생성 버튼을 둔다.
- 출력은 `copy_blocks` 카드로 보여준다.

### Case Documents

- 프론트 MVP의 핵심 화면이다.
- 상단에는 `<서식12>` 사안조사 보고서 입력/저장 영역을 둔다.
- 하단에는 `<서식18>`, `<서식19>`, `<서식20>`, `<서식21>`, `<서식22>` 생성 버튼과 결과 카드를 둔다.
- `<서식12>`가 없으면 파생 서식 생성 버튼은 비활성화하거나, API의 `FORM_SOURCE_REQUIRED` 에러를 "먼저 사안조사 보고서를 입력해 주세요"로 표시한다.

### Templates

- 서식 목록과 설명을 탐색하는 화면이다.
- 전체 파일 편집보다 "필요한 칸에 붙여넣을 문구 생성" 흐름을 우선한다.

---

## 4. copy_blocks 카드 UX

API 응답의 `copy_blocks`를 카드 목록으로 렌더링한다.

각 카드에 반드시 표시할 값:

- `label`: 카드 제목
- `source_form`: 생성 근거 서식
- `target_form`: 붙여넣을 대상 서식
- `target_field`: 붙여넣을 칸, 예: `심의내용`, `사안조사 내용`
- `text`: 복사할 문구
- `char_limit`: 글자 수 제한
- `style_profile`: 문체 유형
- `review_required`: 교사 검토 필요 여부

카드 액션:

- `복사` 버튼
- 복사 성공 상태
- 글자 수 표시: `현재 글자 수 / 제한`
- 제한 초과 시 경고 표시
- `review_required=true`이면 "교사 검토 필요" 표시

---

## 5. API 응답 처리 규칙

모든 JSON 응답은 공통 envelope를 기준으로 처리한다.

```json
{
  "status": "success",
  "data": {},
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-04-13T09:00:00+09:00"
  }
}
```

목록 응답에는 `pagination`이 추가된다.

파일 다운로드/export만 JSON envelope 예외다.

문서 생성 요청은 `/api/v1/cases/{case_id}/documents/generate`를 사용한다. 프론트는 job polling 또는 동기 응답 모두를 수용하되, 결과 렌더링 기준은 항상 `data.copy_blocks`다.

주요 에러:

- `FORM_SOURCE_REQUIRED`: `<서식12>` 등 필수 source가 없음
- `DOCUMENT_JOB_RUNNING`: 생성 작업 진행 중
- `DOCUMENT_ALREADY_APPROVED`: 승인된 문서 수정 시도
- `AI_SERVICE_UNAVAILABLE`: AI 서비스 장애
- `AI_GENERATION_FAILED`: AI 생성 실패

---

## 6. 서식별 프론트 동작

| DocumentType | 화면 동작 | 출력 |
|---|---|---|
| `FORM_10_CASE_INTAKE` | 비정형 `사실 확인내용` 입력 후 행정문체 정리 | `사실 확인내용` copy block |
| `FORM_12_INVESTIGATION_REPORT` | 조사관 보고서 입력/저장 | 후속 생성 source |
| `FORM_18_COMMITTEE_REVIEW_RESULT` | `<서식12>` 기반 생성 | `심의내용`, 500자 이내 |
| `FORM_19_COMMITTEE_CLOSURE_RESULT` | `<서식12>` 기반 생성 | 종결용 `심의내용`, 500자 이내 |
| `FORM_20_SELF_RESOLUTION_CONSENT` | `<서식12>` 기반 생성 | 보호자 대상 중립 문체, 400자 이내 |
| `FORM_21_SELF_RESOLUTION_RESULT` | `<서식12>` 기반 생성 | 보호자 대상 중립 문체, 400자 이내 |
| `FORM_22_FINAL_CASE_SUMMARY` | `<서식19/20/21>` 결과 종합 | `사안조사 내용`, 400자 이내 |

AI 문구는 최종 판단이 아니라 초안이다. UI에서도 "판정", "결정"보다 "초안 생성", "요약", "검토 필요"라는 표현을 사용한다.

---

## 7. 디자인 주의사항

- `stitch/DESIGN.md`의 "Digital Jurist" 방향을 따른다.
- 1px divider로 화면을 나누지 말고, 표면 색과 여백으로 구획한다.
- Tailwind CSS와 Material Symbols를 사용한다.
- 주요 작업 영역은 카드 안에 또 카드를 중첩하지 않는다.
- 버튼 radius는 8px 이하로 유지한다.
- 긴 학생 이름, 서식명, 행정 문구가 모바일에서 넘치지 않게 한다.
- 민감 정보 영역에는 접근 경고와 감사 로그 안내를 둔다.

---

## 8. Gemini에게 줄 첫 작업

1. `API_CONTRACT.md`, `stitch/DESIGN.md`, `stitch/design prompt.html`, 이 파일을 읽는다.
2. React/Tailwind 기준으로 화면 구조를 제안한다.
3. 먼저 `Case Documents` 화면의 `<서식12>` 입력 영역과 `copy_blocks` 카드 목록 mock을 만든다.
4. API mock은 `status/data/meta` envelope를 반드시 포함한다.
5. API 계약 변경 없이 필요한 타입과 컴포넌트를 기능별로 분리한다.
