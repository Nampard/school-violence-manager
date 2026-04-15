# 백엔드 작업 메모

> 작성일: 2026-04-15  
> 상태: 초안  
> 목적: 학교폭력 관리 프로그램의 백엔드 구조와 문구 생성 API 운용 방식을 다음 검토 전까지 보존한다.

---

## 1. 기본 방향

문구 생성은 프론트에서 AI API를 직접 호출하지 않고, 백엔드 API를 통해 운용한다.

프론트는 사용자 입력과 서식별 생성 요청을 백엔드에 전달하고, 백엔드는 권한 확인, 입력 검증, 생성 이력 저장, 감사 로그 기록, AI provider 호출을 담당한다.

```text
프론트
사용자 입력 / 서식12 조사관 입력
        ↓
백엔드 API
사안 권한 확인, 입력 저장, 생성 요청 검증
        ↓
AI 생성 서비스
서식별 프롬프트, 글자 수 제한, 문체 규칙 적용
        ↓
백엔드 DB 저장
generated_text_blocks 기록, source_form 연결, 감사 로그
        ↓
프론트
복사 가능한 문구 카드로 표시
```

---

## 2. 백엔드를 거치는 이유

학교폭력 사안은 학생 이름, 보호자 연락처, 진술, 조사 내용, 증거 등 민감정보가 포함될 수 있다. 따라서 프론트가 AI API를 직접 호출하지 않고 백엔드가 중간에서 통제해야 한다.

백엔드가 담당할 항목:

- API 키와 모델 설정 보호
- 사용자 권한과 사안별 접근 범위 확인
- 학교 단위 데이터 격리
- 사안 입력과 조사관 입력 저장
- 서식별 글자 수 제한 검증
- 문체 규칙과 금지 표현 관리
- 생성 결과 이력 저장
- 담당 교사 검토 필요 표시
- 감사 로그 기록

---

## 3. 핵심 API 형태

문서 생성 요청은 기존 계약의 방향을 유지해 아래 API를 중심으로 설계한다.

```http
POST /api/v1/cases/{case_id}/documents/generate
```

요청 예시:

```json
{
  "document_type": "FORM_18_COMMITTEE_REVIEW_RESULT",
  "source_form": "FORM_12_INVESTIGATION_REPORT",
  "target_fields": ["심의내용"],
  "style_profile": "ADMIN_BULLET_SUMMARY",
  "char_limit": 500
}
```

응답은 프론트가 바로 복사 카드로 렌더링할 수 있게 `copy_blocks`를 포함한다.

```json
{
  "data": {
    "case_id": "case_001",
    "document_type": "FORM_18_COMMITTEE_REVIEW_RESULT",
    "copy_blocks": [
      {
        "label": "심의내용",
        "source_form": "FORM_12_INVESTIGATION_REPORT",
        "target_field": "심의내용",
        "text": "조사 결과 관련 학생 간 언어적 갈등이 확인되었으며...",
        "char_limit": 500,
        "style_profile": "ADMIN_BULLET_SUMMARY",
        "review_required": true
      }
    ]
  },
  "meta": {
    "request_id": "req_..."
  }
}
```

---

## 4. 우선 구현 순서

1. `backend/` FastAPI 골격 생성
2. 공통 응답 envelope, 에러 코드, RBAC 기본 구조 생성
3. `Case`, `InvestigationReport`, `GeneratedTextBlock`, `DocumentTemplate` 모델 정의
4. `<서식12>` 조사관 입력 저장 API 구현
5. `<서식10/18/19/20/21/22>` 문구 생성 API 구현
6. 실제 AI API 호출부는 인터페이스만 먼저 만들고 mock provider로 테스트
7. 이후 OpenAI 등 실제 provider를 환경변수 기반으로 연결

---

## 5. AI Provider 설계 원칙

초기 개발 단계에서는 실제 AI API에 강하게 묶지 않는다.

`AiTextGenerator` 같은 서비스 인터페이스를 두고 아래 provider를 교체 가능하게 구성한다.

- `MockGenerator`: 개발과 테스트용 고정 응답 생성기
- `OpenAIGenerator`: 실제 API 연결용 provider

이 구조를 사용하면 토큰을 아끼면서 백엔드 API, DB 저장, 프론트 렌더링, 에러 처리 테스트를 먼저 진행할 수 있다.

---

## 6. 서식별 생성 기준

이 표는 9번의 Draft 선택 흐름 규칙을 축약한 운용 표다. `<서식18~22>`의 source, 활성 흐름, 사안 내용 서술 방식은 9번 상세 규칙과 반드시 일치해야 하며, 구현과 테스트는 아래 표를 기준으로 검증한다.

| 서식 | 활성 흐름 | 입력 source | 생성 대상 | 서술 방식 | 제한 |
|---|---|---|---|---|---|
| `<서식10>` | 사안접수 | 사용자가 두서없이 입력한 사실 확인내용 | 사안접수 보고용 초안 | 사실 확인내용을 행정문체로 정리하되, 확정 판단이 아니라 접수 단계 초안으로 작성 | 복사 가능한 문구 |
| `<서식12>` | 조사관 입력 | 외주 조사관 입력 | 이후 서식들의 핵심 source | 원문 저장. 후속 Draft 18~22의 1차 근거로 사용 | 원문 저장 |
| `<서식18>` | `SELF_RESOLUTION` | `<서식12>` | 전담기구 보고서: 자체해결 판단 사안내용 | `양측 간 사과`, `신체적/정신적 피해 경미`, `지속적이거나 반복적으로 보기 어려운 점`, `보복행위가 없었던 점`을 포함하고, `학교폭력 예방 및 대책에 관한 법률 상 학교장 자체해결 요건에 해당하는 것으로 판단됨` 문구를 포함 | 500자 이내 |
| `<서식18>` | `COMMITTEE_REQUEST` | `<서식12>` | 전담기구 보고서: 심의위원회 요청 사안내용 | 치료 진단서, 재산상 피해, 지속성, 보복행위, 피해관련 학생의 심의위원회 요청 의사 중 1개 이상을 근거로 심의 요청 필요성을 행정문체로 서술 | 500자 이내 |
| `<서식19>` | `CLOSURE_*` | `<서식12>` | 전담기구 보고서: 종결 사안내용 | `오인신고`, `의심사안`, `관련자 성인 등 특정 불가` 중 선택 사유를 명시하고, `학교폭력 예방 및 대책에 관한 법률 상 학교장 종결 처리에 해당하는 것으로 판단됨` 취지로 서술 | 500자 이내 |
| `<서식20>` | `SELF_RESOLUTION` | `<서식12>` + `<서식18>` | 자체해결 동의서: 사안조사 내용 | 보호자가 읽는 문서이므로 `<서식18>`의 자체해결 판단 근거를 더 완곡하고 중립적인 표현으로 재서술. 상대방 보호자가 보더라도 불필요한 논란이 적은 문체 유지 | 400자 이내 |
| `<서식21>` | `CLOSURE_*` | `<서식12>` + `<서식19>` | 종결처리 동의서: 사안조사 내용 | 보호자가 읽는 문서이므로 `<서식19>`의 종결 판단 근거를 더 완곡하고 중립적인 표현으로 재서술 | 400자 이내 |
| `<서식22>` | `SELF_RESOLUTION` | `<서식12>` + `<서식18>` | 학교장 자체해결 결과 보고서: 사안조사 내용 | 자체해결 흐름의 최종 보고서에 붙여넣을 수 있도록 `<서식12>` 조사 내용과 `<서식18>` 자체해결 판단을 종합해 행정문체로 서술 | 400자 이내 |
| `<서식22>` | `CLOSURE_*` | `<서식12>` + `<서식19>` | 학교장 종결 결과 보고서: 사안조사 내용 | 종결 흐름의 최종 보고서에 붙여넣을 수 있도록 `<서식12>` 조사 내용과 `<서식19>` 종결 판단을 종합해 행정문체로 서술 | 400자 이내 |

비활성 흐름은 생성하지 않는다. 예를 들어 `COMMITTEE_REQUEST`에서는 `<서식18>`만 생성하고 `<서식19/20/21/22>`는 비활성으로 처리한다. 비활성 Draft의 프론트 표시 문구는 `비활성 상태임`이며, 백엔드에 잘못 요청되면 `DRAFT_DISABLED_BY_FLOW`를 반환한다.

---

## 7. 다음 검토 포인트

- API 응답 envelope의 `meta` 필수 여부
- `GeneratedTextBlock` 저장 범위와 재생성 이력 관리 방식
- 실제 AI provider 연결 시 사용할 환경변수 이름
- 서식별 prompt template을 코드에 둘지 DB에 둘지
- 학교별 데이터 격리와 사용자 권한 모델
- 문구 생성 실패 시 에러 코드
- 개인정보 마스킹 또는 최소 전송 정책

---

## 8. 1차 구현 반영 상태

현재 구현은 `MockGenerator` 기반으로 문구 생성 흐름을 먼저 검증하는 단계다. 실제 AI provider와 DB 저장은 아직 붙이지 않았고, 프론트-백엔드 API 계약과 DRAFT 선택 흐름을 우선 고정했다.

구현된 API:

```http
POST /api/v1/cases/{case_id}/documents/generate
```

```http
POST /api/v1/cases/{case_id}/intake/generate
```

요청 핵심 필드:

```json
{
  "document_type": "FORM_18_COMMITTEE_REVIEW_RESULT",
  "flow_selection": "SELF_RESOLUTION",
  "source_text": "서식12 사안조사 보고서 원문",
  "source_blocks": {
    "form_18_text": "선택적으로 전달되는 Draft18 생성문",
    "form_19_text": "선택적으로 전달되는 Draft19 생성문"
  },
  "output_mode": "COPY_BLOCKS"
}
```

응답은 단일 `copy_block`을 반환한다. 공통 envelope는 `status`, `data`, `meta.request_id`를 포함한다.

선택 흐름별 활성 Draft:

| 선택 흐름 | 활성 Draft | 비활성 Draft |
|---|---|---|
| `SELF_RESOLUTION` | DRAFT 18, 20, 22 | DRAFT 19, 21 |
| `COMMITTEE_REQUEST` | DRAFT 18 | DRAFT 19, 20, 21, 22 |
| `CLOSURE_FALSE_REPORT` | DRAFT 19, 21, 22 | DRAFT 18, 20 |
| `CLOSURE_SUSPECTED_CASE` | DRAFT 19, 21, 22 | DRAFT 18, 20 |
| `CLOSURE_ADULT_OR_UNIDENTIFIABLE` | DRAFT 19, 21, 22 | DRAFT 18, 20 |

비활성 Draft 생성 요청이 백엔드에 들어오면 `422 DRAFT_DISABLED_BY_FLOW`를 반환한다. `source_text`가 비어 있으면 `422 FORM_SOURCE_REQUIRED`를 반환한다.

`<서식10>` 사안접수 초안은 `statement`, `tone`을 받아 `FORM_10_CASE_INTAKE` 문서 구조로 반환한다. `statement`가 비어 있으면 `422 INTAKE_SOURCE_REQUIRED`를 반환한다.

---

## 9. 백엔드 1차 구현 플랜: Draft 선택 흐름 기반 문구 생성 API

> 이 섹션은 2026-04-15에 구현 기준으로 사용한 원문 플랜을 보존한 것이다. 현재 구현은 이 플랜에 더해 `<서식10>` 사안접수 초안 생성 API도 추가된 상태다.

### Summary

- FastAPI 백엔드를 새로 만들고, 프론트의 DRAFT 18/19 선택 옵션에 따라 각 Draft의 생성 방향과 활성/비활성 상태가 일관되게 동작하도록 한다.
- 사용자가 선택한 방식에 따라 **개별 Draft 생성 API**를 유지한다. 프론트는 선택 흐름을 기준으로 어떤 Draft가 활성/비활성인지 계산하고, 활성 Draft만 백엔드에 개별 생성 요청을 보낸다.
- AI 연동은 1차에서 `MockGenerator`로 구현한다. 실제 OpenAI provider는 같은 인터페이스에 나중에 붙인다.
- 기존 미커밋 프론트 변경과 `docs/BACKEND_PLAN.md`는 보존하고 덮어쓰지 않는다.

### Key Changes

- `backend/` FastAPI 골격을 추가한다.
  - `app/main.py`, `app/api/v1/documents.py`, `app/core/errors.py`, `app/schemas/documents.py`, `app/services/generated_text_blocks/`, `app/ai/generator.py`로 기능별 분리한다.
  - DB는 1차에서 실제 영속 저장보다 API/흐름 검증을 우선하고, in-memory mock repository를 사용한다.
  - 추후 SQLAlchemy/Alembic으로 교체 가능한 service/repository 경계를 둔다.

- 개별 Draft 생성 API를 만든다.
  - `POST /api/v1/cases/{case_id}/documents/generate`
  - 요청 필드는 `document_type`, `flow_selection`, `source_text`, `source_blocks`, `output_mode`를 받는다.
  - `flow_selection` enum:
    - `SELF_RESOLUTION`
    - `COMMITTEE_REQUEST`
    - `CLOSURE_FALSE_REPORT`
    - `CLOSURE_SUSPECTED_CASE`
    - `CLOSURE_ADULT_OR_UNIDENTIFIABLE`
  - 응답은 단일 Draft의 `copy_block`을 반환한다.
  - 공통 envelope는 `data`와 `meta.request_id`를 포함한다.

- 비활성 Draft 정책을 백엔드와 프론트 양쪽에서 같은 규칙으로 구현한다.
  - `SELF_RESOLUTION`: DRAFT 18, 20, 22 활성 / DRAFT 19, 21 비활성
  - `COMMITTEE_REQUEST`: DRAFT 18만 활성 / DRAFT 19, 20, 21, 22 비활성
  - `CLOSURE_*`: DRAFT 19, 21, 22 활성 / DRAFT 18, 20 비활성
  - 프론트는 비활성 Draft의 사안내용 영역에 `비활성 상태임`을 빨간 글자로 표시한다.
  - 비활성 Draft에 API 요청이 들어오면 백엔드는 `422 DRAFT_DISABLED_BY_FLOW`를 반환한다.

- 문구 생성 규칙을 prompt/mock template으로 고정한다.
  - DRAFT 18 + `SELF_RESOLUTION`:
    - `양측 간 사과`, `신체적/정신적 피해 경미`, `지속적이거나 반복적으로 보기 어려운 점`, `보복행위가 없었던 점`을 포함한다.
    - `학교폭력 예방 및 대책에 관한 법률 상 학교장 자체해결 요건에 해당하는 것으로 판단됨` 문구를 포함한다.
  - DRAFT 18 + `COMMITTEE_REQUEST`:
    - 사안조사 보고서를 참고해 치료 진단서, 재산상 피해, 지속성, 보복행위, 피해관련 학생의 심의위원회 요청 의사 중 1개 이상을 근거로 서술한다.
  - DRAFT 19 + `CLOSURE_*`:
    - 선택한 사유를 명시하고, `학교폭력 예방 및 대책에 관한 법률 상 학교장 종결 처리에 해당하는 것으로 판단됨` 취지로 서술한다.
  - DRAFT 20:
    - `SELF_RESOLUTION`일 때만 활성화하며, 사안조사 보고서와 DRAFT 18 내용을 보호자 대상의 완곡한 문체로 정리한다.
  - DRAFT 21:
    - `CLOSURE_*`일 때만 활성화하며, 사안조사 보고서와 DRAFT 19 내용을 보호자 대상의 완곡한 문체로 정리한다.
  - DRAFT 22:
    - `SELF_RESOLUTION`이면 사안조사 보고서와 DRAFT 18을 바탕으로 행정문체로 서술한다.
    - `CLOSURE_*`이면 사안조사 보고서와 DRAFT 19를 바탕으로 행정문체로 서술한다.
    - `COMMITTEE_REQUEST`에서는 비활성화한다.

- 프론트 연동을 1차 범위에 포함한다.
  - `mockCase.ts`의 정적 DRAFT 문구를 API 응답 기반 상태로 이동할 준비를 한다.
  - DRAFT 18/19 옵션 버튼 클릭 시 `flow_selection`을 저장한다.
  - 선택 흐름에 따라 카드 활성/비활성을 계산한다.
  - 활성 Draft의 생성 버튼 또는 자동 생성 동작은 개별 API를 호출한다.
  - 비활성 카드에는 API 호출 없이 `비활성 상태임`을 빨간 글자로 표시한다.

### Draft별 사안 source 및 완성본 서술 방식

아래 표는 9번 플랜의 핵심 운용 기준이다. `MockGenerator`, 이후 Gemini/OpenAI provider, prompt template, 테스트 케이스는 모두 이 표를 기준으로 작성한다. 6번 표와 이 표가 충돌하면 문서를 수정해 반드시 일치시켜야 한다.

| Draft | 활성 흐름 | 사안 source | 생성 필드 | 완성본 서술 방식 |
|---|---|---|---|---|
| DRAFT 18 / `<서식18>` | `SELF_RESOLUTION` | `<서식12>` 사안조사 보고서 | 전담기구 보고서의 `자체해결 또는 심의위원회 요청` | 개조식에 가까운 행정기관 문체로 작성한다. `양측 간 사과`, `신체적/정신적 피해 경미`, `지속적이거나 반복적으로 보기 어려운 점`, `보복행위가 없었던 점`을 빠뜨리지 않는다. 결론 문장은 `학교폭력 예방 및 대책에 관한 법률 상 학교장 자체해결 요건에 해당하는 것으로 판단됨` 취지로 닫는다. |
| DRAFT 18 / `<서식18>` | `COMMITTEE_REQUEST` | `<서식12>` 사안조사 보고서 | 전담기구 보고서의 `자체해결 또는 심의위원회 요청` | 심의위원회 요청 사유를 행정문체로 정리한다. 치료 진단서, 재산상 피해, 지속성, 보복행위, 피해관련 학생의 심의위원회 요청 의사 중 확인된 요소를 1개 이상 근거로 삼는다. 자체해결 요건 문구를 사용하지 않는다. |
| DRAFT 19 / `<서식19>` | `CLOSURE_FALSE_REPORT`, `CLOSURE_SUSPECTED_CASE`, `CLOSURE_ADULT_OR_UNIDENTIFIABLE` | `<서식12>` 사안조사 보고서 | 전담기구 보고서(종결)의 `종결 시(오인신고 등)` | 선택된 종결 사유를 문장 안에 명시한다. 오인신고, 의심사안, 관련자 성인 등 특정 불가 중 선택된 사유와 조사 내용을 연결하고, 결론은 `학교폭력 예방 및 대책에 관한 법률 상 학교장 종결 처리에 해당하는 것으로 판단됨` 취지로 정리한다. |
| DRAFT 20 / `<서식20>` | `SELF_RESOLUTION` | `<서식12>` 사안조사 보고서 + DRAFT 18 생성문 | 자체해결 동의서의 `보호자 전달 통지서 내용` | 보호자에게 전달되는 문서이므로 DRAFT 18의 판단 근거를 그대로 복사하지 않는다. 학생 간 관계 회복, 피해 정도, 지속성, 보복행위 부재를 더 완곡하고 중립적인 표현으로 풀어 쓴다. 상대방 보호자가 읽어도 단정적 비난으로 보이지 않도록 표현한다. |
| DRAFT 21 / `<서식21>` | `CLOSURE_FALSE_REPORT`, `CLOSURE_SUSPECTED_CASE`, `CLOSURE_ADULT_OR_UNIDENTIFIABLE` | `<서식12>` 사안조사 보고서 + DRAFT 19 생성문 | 종결처리 동의서의 `보호자 전달 통지서 내용` | 보호자에게 전달되는 문서이므로 DRAFT 19의 종결 판단 근거를 완곡하게 재서술한다. 선택된 종결 사유는 반영하되, 학생 또는 보호자를 비난하거나 법적 책임을 단정하는 표현은 피한다. |
| DRAFT 22 / `<서식22>` | `SELF_RESOLUTION` | `<서식12>` 사안조사 보고서 + DRAFT 18 생성문 | 학교장 자체해결 결과 보고서의 `사안조사 내용` | 최종 결과 보고서에 붙여넣을 수 있는 행정문체로 쓴다. DRAFT 18의 자체해결 판단을 바탕으로 사실관계, 판단 근거, 자체해결 흐름을 400자 이내로 종합한다. |
| DRAFT 22 / `<서식22>` | `CLOSURE_FALSE_REPORT`, `CLOSURE_SUSPECTED_CASE`, `CLOSURE_ADULT_OR_UNIDENTIFIABLE` | `<서식12>` 사안조사 보고서 + DRAFT 19 생성문 | 학교장 종결 결과 보고서의 `사안조사 내용` | 최종 종결 결과 보고서에 붙여넣을 수 있는 행정문체로 쓴다. 선택된 종결 사유와 조사 내용을 연결하고, DRAFT 19의 종결 판단을 바탕으로 400자 이내로 종합한다. |

비활성 관계는 문구 생성 파이프라인의 일부로 취급한다. `SELF_RESOLUTION`에서는 DRAFT 19/21을 생성하지 않고, `COMMITTEE_REQUEST`에서는 DRAFT 19/20/21/22를 생성하지 않으며, `CLOSURE_*`에서는 DRAFT 18/20을 생성하지 않는다. 이 규칙은 프론트 표시, 백엔드 검증, 테스트가 모두 동일하게 따라야 한다.

후속 AI provider를 붙일 때도 결과물은 위 표의 `완성본 서술 방식`을 만족해야 한다. 즉, provider가 Gemini든 OpenAI든 출력은 `copy_block.text` 하나로 끝나는 것이 아니라, source 흐름, 글자 수, 문체, 필수 문구, 비활성 정책을 함께 만족해야 한다.

### Public Interfaces

Request:

```json
{
  "document_type": "FORM_18_COMMITTEE_REVIEW_RESULT",
  "flow_selection": "SELF_RESOLUTION",
  "source_text": "서식12 사안조사 보고서 원문",
  "source_blocks": {
    "form_18_text": "선택적으로 전달되는 Draft18 생성문",
    "form_19_text": "선택적으로 전달되는 Draft19 생성문"
  },
  "output_mode": "COPY_BLOCKS"
}
```

Success response:

```json
{
  "status": "success",
  "data": {
    "case_id": "case_001",
    "document_type": "FORM_18_COMMITTEE_REVIEW_RESULT",
    "flow_selection": "SELF_RESOLUTION",
    "copy_block": {
      "label": "DRAFT 18 사안내용",
      "source_form": "FORM_12_INVESTIGATION_REPORT",
      "target_form": "FORM_18_COMMITTEE_REVIEW_RESULT",
      "target_field": "자체해결 또는 심의위원회 요청",
      "text": "생성 문구",
      "char_limit": 500,
      "style_profile": "BULLET_ADMIN",
      "review_required": true
    }
  },
  "meta": {
    "request_id": "uuid"
  }
}
```

Disabled response:

```json
{
  "status": "error",
  "error": {
    "code": "DRAFT_DISABLED_BY_FLOW",
    "message": "선택된 사안처리 흐름에서는 해당 Draft를 생성할 수 없습니다."
  },
  "meta": {
    "request_id": "uuid"
  }
}
```

### Test Plan

백엔드 테스트:

- `SELF_RESOLUTION`에서 DRAFT 18 생성문에 4개 자체해결 요소와 필수 법률 문구가 포함되는지 확인한다.
- `SELF_RESOLUTION`에서 DRAFT 19/21 생성 요청은 `DRAFT_DISABLED_BY_FLOW`가 되는지 확인한다.
- `COMMITTEE_REQUEST`에서 DRAFT 18은 생성되고 DRAFT 19/20/21/22는 비활성 에러가 되는지 확인한다.
- `CLOSURE_FALSE_REPORT`, `CLOSURE_SUSPECTED_CASE`, `CLOSURE_ADULT_OR_UNIDENTIFIABLE` 각각에서 DRAFT 19 문구가 선택 사유를 포함하는지 확인한다.
- `CLOSURE_*`에서 DRAFT 18/20 요청은 비활성 에러가 되는지 확인한다.
- DRAFT 20/21은 400자 제한, DRAFT 18/19는 500자 제한 메타를 반환하는지 확인한다.
- `source_text`가 비어 있으면 `FORM_SOURCE_REQUIRED`를 반환하는지 확인한다.

프론트 테스트:

- DRAFT 18 `학교장 자체해결` 선택 시 DRAFT 19/21이 빨간 `비활성 상태임`으로 표시되는지 확인한다.
- DRAFT 18 `학폭대책심의위 요청` 선택 시 DRAFT 19/20/21/22가 비활성 표시되는지 확인한다.
- DRAFT 19 옵션 선택 시 DRAFT 18/20이 비활성 표시되고 DRAFT 21/22가 활성 상태인지 확인한다.
- 활성 Draft만 API 호출이 발생하는지 확인한다.
- `npm run build`를 통과시킨다.

### Assumptions

- 1차 백엔드는 실제 AI API를 호출하지 않고 `MockGenerator`로 문구를 생성한다.
- 실제 DB 저장은 2차로 미루고, 1차는 API 계약, 생성 흐름, 프론트 연동 검증을 우선한다.
- 개별 Draft 반환 방식을 따른다. 따라서 전체 보드 상태 계산은 프론트 reducer/helper가 담당하고, 백엔드는 잘못된 Draft 생성 요청을 방어한다.
- 모든 AI 생성 문구는 최종 판단이 아니라 담당 교사가 검토할 초안이며, `review_required=true`를 유지한다.
