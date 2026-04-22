# 프론트엔드 구현 가이드

> 작성일: 2026-04-16  
> 프로젝트 버전: 0.1.0  
> 문서 상태: v0.1.0-frontend-guide  
> 대상: React/Vite 프론트 구현, 디자인 유지, 백엔드 API 연동  
> 상위 계약: `docs/CONTRACT.md`  
> 생성 파이프라인 기준: `docs/BACKEND_PLAN.md`  
> 작업 원칙: `agent.md`

---

## 0. 문서 목적

이 문서는 `docs/CONTRACT.md`에 있던 프론트엔드 책임, 디자인 계약, 화면 구현 플랜을 분리한 프론트 전용 기준서다.

`docs/CONTRACT.md`는 제품/API/도메인 상위 계약을 담당하고, 이 문서는 화면 구조, 컴포넌트 책임, 디자인 규칙, 프론트 상태 흐름, 백엔드 API 호출 방식을 담당한다.

충돌이 생길 때 우선순위는 아래와 같다.

1. `agent.md`: 작업 방식과 사용자 확인 원칙
2. `docs/CONTRACT.md`: 제품, API, 도메인, 보안 상위 계약
3. `docs/BACKEND_PLAN.md`: 문구 생성 파이프라인과 Draft별 활성/비활성 정책
4. `docs/FRONTEND_GUIDE.md`: 프론트 화면, 컴포넌트, 디자인, UX 구현 기준
5. `stitch(new)` 자료: 디자인 참고 원본

서로 충돌하는 부분은 임의로 덮어쓰지 않고 사용자에게 확인한 뒤 정리한다.

---

## 1. 프론트 책임

Frontend Codex의 책임은 아래와 같다.

- `stitch(new)/10/code.html`과 `stitch(new)/ai/code.html`을 React 컴포넌트 구조로 해체해 구현한다.
- `stitch(new)/equilibrium_admin/DESIGN.md`의 `The Stoic Archivist` 방향성을 반영한다.
- `stitch(new)/10/screen.png`와 `stitch(new)/ai/screen.png`의 화면 골격, 밀도, 비율을 우선한다.
- Tailwind CSS와 Material Symbols를 사용한다.
- API 경로, 응답 envelope, enum, 권한 정책을 임의로 바꾸지 않는다.
- 백엔드가 없을 때도 mock shape는 실제 계약과 동일하게 유지한다.
- 외부 모델이 만든 프론트 코드는 그대로 적용하지 않고 빌드, 접근성, 계약 준수 여부를 검증한 뒤 반영한다.

---

## 2. 현재 프론트 구현 상태

현재 프론트는 React + Vite 기반의 단일 화면 앱이다. 아직 React Router 기반 다중 라우트는 붙이지 않고, `activeView` 상태로 `Case Intake`와 `Document Management`를 전환한다.

현재 주요 화면:

| View | 역할 | 주요 파일 |
|---|---|---|
| `Case Intake` | `<서식10>` 사안접수 초안 생성 | `frontend/src/pages/CaseIntake.tsx` |
| `Document Management` | `<서식12>` 원천 입력 기반 DRAFT 18~22 생성 | `frontend/src/pages/DocumentManagement.tsx` |
| `Help` | 마우스 위치 기준 도움말 팝오버 | `frontend/src/components/stitch/HelpPopover.tsx` |
| `Generation Control Panel` | 생성 환경 확인과 로컬 옵션 설정 | `frontend/src/components/stitch/GenerationControlPanel.tsx` |
| `Profile Dialog` | 소속학교/교사 이름 저장 | `frontend/src/components/stitch/ProfileDialog.tsx` |

현재 앱 상태의 중심은 `frontend/src/App.tsx`다.

- `activeView`: 현재 화면
- `helpAnchor`: 도움말 팝오버 위치
- `profile`: 소속학교/교사 이름
- `profileDialogOpen`: 프로필 설정 창 표시 여부
- `generationSettings`: 생성 엔진, 문체, 엄격도, 글자 수 제한 방식
- `generationPanelOpen`: 생성 환경 제어판 표시 여부

---

## 3. 디자인 기준

프론트는 아래 디자인 자료를 반드시 참조한다.

| 자료 | 용도 |
|---|---|
| `stitch(new)/equilibrium_admin/DESIGN.md` | Stoic Archivist 시각 방향성, 색상, 타이포그래피, 여백, 표면 계층, 버튼 규칙 |
| `stitch(new)/10/code.html`, `stitch(new)/ai/code.html` | Tailwind/Material Symbols 기반 화면 골격 |
| `stitch(new)/10/screen.png`, `stitch(new)/ai/screen.png` | 최종 화면 밀도, 비율, 작업공간 배치 참고 |

### 3.1 Creative North Star

디자인 방향은 `The Stoic Archivist`로 고정한다.

학교폭력 업무 화면은 자극적이거나 복잡한 대시보드보다, 정돈된 행정 dossier와 문서 작업실의 느낌이 우선이다. 사용자가 높은 긴장도의 문서를 다루므로 화면은 차분하고 권위 있게 보여야 하며, 긴 텍스트를 읽고 복사하기 쉬워야 한다.

### 3.2 색상과 표면 계층

화면 구획은 선보다 표면 색상과 여백으로 나눈다.

| 계층 | 색상 기준 | 용도 |
|---|---|---|
| Base Layer | `#f8f9ff` | 앱 전체 배경 |
| Content Area | `#eff4ff` | 사이드바, 입력 배경, 낮은 작업 영역 |
| Active Document/Card | `#ffffff` | 주요 문서 카드, 복사 블록 |
| Elevated Interaction | `#dce9ff` | hover, active, 보조 상호작용 |
| Primary Indigo | `#2d409f` | 주요 버튼, 활성 메뉴, 핵심 강조 |
| Soft Sage | Sage 계열 | 준비됨, 검토 필요, 차분한 상태 표시 |

전체 화면이 파란색 계열 하나로만 보이지 않게 Slate 텍스트, Sage 상태색, 흰 문서 표면을 균형 있게 사용한다.

### 3.3 타이포그래피

- 큰 제목, 본문, 진술, 폼, 메타데이터는 Pretendard 중심으로 사용한다.
- Inter는 보조 메타 텍스트에서만 사용한다.
- 한국어 본문은 line-height `1.6` 이상을 우선한다.
- 본 프로젝트의 전역 규칙상 `letter-spacing`은 `0`을 유지한다.
- `stitch(new)/equilibrium_admin/DESIGN.md`에는 한국어 본문 `letter-spacing: -0.02em` 권장이 있으나, 현재 구현과 프로젝트 프론트 규칙은 `0`을 우선한다.

### 3.4 컴포넌트 시각 규칙

- 버튼 반경은 8px 이하로 유지한다.
- 카드 반경도 8px 이하를 기본으로 한다.
- 과한 그림자와 1px 구분선으로 섹션을 쪼개지 않는다.
- 카드 안에 카드를 중첩하지 않는다.
- 입력 영역은 부드러운 채움 배경을 사용하고, 과한 테두리를 피한다.
- Copy Block 카드는 흰 표면, 짧은 라벨, 본문, 출처/대상 필드/글자 수 메타데이터, 복사 버튼을 포함한다.
- AI 생성 초안 영역은 담당 교사 검토가 필요하다는 점이 상태 표시로 드러나야 한다.

---

## 4. 화면 구조

### 4.1 전체 Shell

`StitchShell`이 화면 전체 구조를 담당한다.

- 좌측 고정 사이드바: `StitchSidebar`
- 상단 작업바: `StitchTopbar`
- 본문 작업 영역: `main.stitch-shell-main`

데스크톱에서는 좌측 사이드바가 보이고, 모바일에서는 사이드바 대신 상단 모바일 탭을 사용한다.

### 4.2 좌측 사이드바

현재 사이드바 항목:

| 항목 | 역할 |
|---|---|
| `Case Intake` | `<서식10>` 사안접수 초안 생성 화면 |
| `Document Management` | `<서식12>` 기반 후속 Draft 생성 화면 |
| `Help` | 마우스 위치 기준 도움말 팝오버 표시 |

좌측 하단 프로필 카드에는 아래 값을 표시한다.

- 소속학교
- 교사 이름

기존 `Administrator`, `Archivist ID`는 제거했다.

### 4.3 상단바

상단바 구성:

- 제목: `ARCHIVE-01: 학교폭력 사안처리 생성기`
- `Date`: 한국 기준 현재 날짜
- `Time`: 한국 기준 현재 시각, 초 단위 실시간 갱신
- `Help` 아이콘: 모바일 접근용
- `settings` 아이콘: 생성 환경 제어판
- `person` 아이콘: 사용자 프로필 설정

벨 알림 아이콘은 현재 저장/알림 기능이 없으므로 제거했다.

### 4.4 도움말

`Help`를 누르면 오른쪽 아래 고정 도움말이 아니라, 마우스 커서 위치를 기준으로 페이드 인 팝오버가 열린다.

도움말 내용은 아래 원칙을 안내한다.

- `<서식12>` 사안조사 보고서를 기준으로 선택한 처리 흐름에 맞는 Draft만 생성된다.
- 비활성 Draft는 현재 흐름에서 사용하지 않는 서식이며, 생성 요청도 보내지 않는다.
- 초안 고정은 현재 문구를 잠그고, 고정 해제는 다시 수정 가능한 상태로 돌린다.

### 4.5 생성 환경 제어판

오른쪽 위 `settings` 아이콘은 생성 환경 제어판이다.

현재 1차 구현의 역할:

- 현재 생성 엔진이 `MockGenerator`임을 표시한다.
- 실제 Gemini API 키는 프론트에 저장하지 않는다는 안내를 보여준다.
- 문체 기본값은 `서식별 자동 문체`로 표시한다.
- 출력 구조는 `전술: 사안 요약 / 후술: Draft별 판단`으로 표시한다.
- 모든 초안은 교사 검토 필요 상태로 취급한다.
- 생성 엄격도와 글자 수 제한 방식은 브라우저 `localStorage`에 저장한다.
- 생성 엄격도는 DRAFT 18~22 생성 요청의 `generation_options.strictness`로 백엔드에 전달된다.
- `엄격`은 필수 판단 근거 중심의 짧고 단정한 문구를 생성한다.
- `보통`은 같은 기준을 유지하되 사안 요약과 판단 근거를 조금 더 자연스럽게 풀어 생성한다.

API 키 입력 기능은 프론트에 두지 않는다. 실제 Gemini/OpenAI 연동은 FastAPI 백엔드 `.env` 환경변수로 처리한다.

### 4.6 사용자 프로필

오른쪽 위 `person` 아이콘을 누르면 사용자 정보 설정 창이 열린다.

입력값:

- 소속학교
- 교사 이름

저장된 값은 좌측 하단 프로필 카드에 표시한다. 현재는 표시용 정보이므로 브라우저 `localStorage`에 저장한다.

---

## 5. Case Intake 화면

`Case Intake`는 `<서식10>` 사안접수 보고 초안 생성을 담당한다.

사용 흐름:

1. 사용자가 사실 확인내용을 두서없이 입력한다.
2. `초안 생성`을 누른다.
3. 프론트가 `POST /api/v1/cases/{case_id}/intake/generate`를 호출한다.
4. 백엔드의 `MockCaseIntakeGenerator`가 행정문체 초안을 반환한다.
5. 프론트는 문서 미리보기 패널에 `발생 경위`만 결과로 표시한다.

서술 원칙:

- 입력자의 표현을 그대로 단정하지 않는다.
- 접수 단계 초안이므로 학교폭력 여부나 책임을 최종 판단하지 않는다.
- 발생 일시, 장소, 관련 학생, 주요 행위를 존대어 없이 행정문체로 정리한다.
- `1. 사안 개요`, `3. 조치 사항`은 표시하지 않고, 복사 대상도 `발생 경위` 단일 블록으로 유지한다.
- 표시 글자 수는 실제 복사되는 `발생 경위` 블록 기준으로 계산하며 기본 제한은 1,000자다.

---

## 6. Document Management 화면

`Document Management`는 `<서식12>` 사안조사 보고서를 원천 입력으로 삼아 DRAFT 18~22 문구를 생성한다.

### 6.1 기본 구조

좌측:

- `<서식12>` 사안조사 보고서 원천 입력
- 조사관 입력 또는 사용자가 붙여넣은 조사 보고서 원문
- 저장/동기화 상태 표시

우측:

- DRAFT 18: 전담기구 보고서(자체해결 or 심의요청)
- DRAFT 19: 전담기구 보고서(종결)
- DRAFT 20: 자체해결 동의서(사안조사 내용)
- DRAFT 21: 종결처리 동의서(사안조사 내용)
- DRAFT 22: 학교장 자체해결(종결) 결과 보고서

### 6.2 Draft 흐름 선택

프론트는 DRAFT 18/19의 옵션 선택에 따라 `flow_selection`을 정한다.

| 선택 | FlowSelection | 의미 |
|---|---|---|
| DRAFT 18 `학교장 자체해결` | `SELF_RESOLUTION` | 자체해결 흐름 |
| DRAFT 18 `학폭대책심의위 요청` | `COMMITTEE_REQUEST` | 심의위원회 요청 흐름 |
| DRAFT 19 `오인신고` | `CLOSURE_FALSE_REPORT` | 종결 처리 흐름 |
| DRAFT 19 `의심사안` | `CLOSURE_SUSPECTED_CASE` | 종결 처리 흐름 |
| DRAFT 19 `관련자 성인 등 특정 불가` | `CLOSURE_ADULT_OR_UNIDENTIFIABLE` | 종결 처리 흐름 |

### 6.3 활성/비활성 정책

프론트와 백엔드는 같은 활성 정책을 사용한다.

| FlowSelection | 활성 Draft | 비활성 Draft |
|---|---|---|
| `SELF_RESOLUTION` | DRAFT 18, 20, 22 | DRAFT 19, 21 |
| `COMMITTEE_REQUEST` | DRAFT 18 | DRAFT 19, 20, 21, 22 |
| `CLOSURE_FALSE_REPORT` | DRAFT 19, 21, 22 | DRAFT 18, 20 |
| `CLOSURE_SUSPECTED_CASE` | DRAFT 19, 21, 22 | DRAFT 18, 20 |
| `CLOSURE_ADULT_OR_UNIDENTIFIABLE` | DRAFT 19, 21, 22 | DRAFT 18, 20 |

비활성 Draft에는 API 호출을 보내지 않고, 사안내용 영역에 `비활성 상태임`을 빨간 글자로 표시한다.

잘못된 생성 요청이 백엔드에 들어가면 `422 DRAFT_DISABLED_BY_FLOW`가 반환된다.

### 6.4 Draft별 생성 문체

Draft 18~22는 모두 아래 구조를 따른다.

```text
전술: <서식12> 사안조사 보고서 핵심 사실관계 요약
후술: 선택된 Draft 흐름에 따른 판단, 사안조사 내용 정리, 결과 보고 문구
```

| Draft | 활성 흐름 | 사안 source | 생성 필드 | 서술 방식 |
|---|---|---|---|---|
| DRAFT 18 / `<서식18>` | `SELF_RESOLUTION` | `<서식12>` | 자체해결 또는 심의위원회 요청 | 사안 요약 후, 양측 간 사과, 신체적/정신적 피해 경미, 지속적/반복적 사안으로 보기 어려운 점, 보복행위가 없었던 점을 포함하고 `학교폭력 예방 및 대책에 관한 법률 제13조의2 제1항`에 따른 학교장 자체해결 요건 해당 취지로 마무리 |
| DRAFT 18 / `<서식18>` | `COMMITTEE_REQUEST` | `<서식12>` | 자체해결 또는 심의위원회 요청 | 사안 요약 후, 치료 진단서, 재산상 피해, 지속성, 보복행위, 피해관련 학생의 심의위원회 요청 의사 중 확인된 요소를 근거로 심의 요청 필요성을 서술 |
| DRAFT 19 / `<서식19>` | `CLOSURE_*` | `<서식12>` | 종결 시(오인신고 등) | 사안 요약 후, 선택된 종결 사유와 `학교폭력이 아닌 사안 등 종결처리` 해당 취지로 정리. 제13조/제13조의2/제14조 계열은 표시하지 않고, 오인신고/의심사안은 제2조 제1항, 관련자 성인 등 특정 불가는 제2조 제3항만 표시 |
| DRAFT 20 / `<서식20>` | `SELF_RESOLUTION` | `<서식12>` + DRAFT 18 | 보호자 전달 통지서 내용 | 사안 요약 후, DRAFT 18의 제13조의2 제1항 자체해결 판단 근거를 조금 더 완곡한 행정문체로 재서술. 학부모에게 제안하거나 동의를 요청하지 않고 사안조사 내용만 정리하며, 존대어와 요청형 문장은 사용하지 않음 |
| DRAFT 21 / `<서식21>` | `CLOSURE_*` | `<서식12>` + DRAFT 19 | 보호자 전달 통지서 내용 | 사안 요약 후, DRAFT 19의 종결 판단 근거와 허용 법령 근거를 조금 더 완곡한 행정문체로 재서술. `학교폭력이 아닌 사안 등 종결처리` 흐름을 유지하고 제13조/제13조의2/제14조 계열, 학부모 제안, 동의 요청, 존대어, 요청형 문장은 사용하지 않음 |
| DRAFT 22 / `<서식22>` | `SELF_RESOLUTION` | `<서식12>` + DRAFT 18 | 자체해결 또는 종결 결과 보고서 | 사안 요약 후, 제13조의2 제1항에 따른 자체해결 판단과 결과 보고 흐름을 행정문체로 종합 |
| DRAFT 22 / `<서식22>` | `CLOSURE_*` | `<서식12>` + DRAFT 19 | 자체해결 또는 종결 결과 보고서 | 사안 요약 후, `학교폭력이 아닌 사안 등 종결처리` 결과 보고 흐름과 허용 법령 근거를 행정문체로 종합. 제13조/제13조의2/제14조 계열은 표시하지 않음 |

---

## 7. API 연동 원칙

프론트는 실제 AI API를 직접 호출하지 않는다.

```text
프론트엔드 -> FastAPI 백엔드 -> AI Provider
```

현재 Vite 개발 서버는 `/api` 요청을 `127.0.0.1:8000`으로 프록시한다.

주요 API:

| API | 역할 |
|---|---|
| `POST /api/v1/cases/{case_id}/intake/generate` | `<서식10>` 사안접수 초안 생성 |
| `POST /api/v1/cases/{case_id}/documents/generate` | DRAFT 18~22 개별 문구 생성 |

현재 구현은 개별 Draft 생성 요청을 보내고, 응답의 단일 `copy_block`을 해당 카드에 반영한다.

프론트는 아래 규칙을 지킨다.

- 활성 Draft만 API 호출한다.
- 비활성 Draft는 API 호출하지 않는다.
- `source_text`가 비어 있으면 생성 요청 전에 사용자에게 안내한다.
- 백엔드에서 `FORM_SOURCE_REQUIRED`, `DRAFT_DISABLED_BY_FLOW`가 오면 사용자에게 이해 가능한 한국어 메시지로 표시한다.
- API 키는 프론트 입력창, localStorage, 정적 번들에 저장하지 않는다.

---

## 8. 상태와 로컬 저장

현재 프론트의 로컬 저장 항목은 표시와 UX 설정 용도에 한정한다.

| Storage key | 저장 내용 | 민감도 | 비고 |
|---|---|---|---|
| `school-violence-manager.teacher-profile` | 소속학교, 교사 이름 | 낮음~중간 | 표시용 정보 |
| `school-violence-manager.generation-settings` | 생성 엄격도, 글자 수 제한 방식 | 낮음 | 로컬 UX 설정 |

저장하지 않는 것:

- AI API 키
- 학생 이름, 보호자 연락처, 진술 원문
- 증거 파일
- 실제 학교폭력 사건 전체 기록

민감 정보 저장은 백엔드 DB와 권한/감사 로그가 준비된 뒤 별도 계약으로 다룬다.

---

## 9. 초안 고정과 리셋

`Document Management`의 상단 버튼은 아래 의미를 갖는다.

| 버튼 | 역할 |
|---|---|
| `초안 고정` | 현재 활성 Draft 생성 결과를 제출 전 상태로 잠근다 |
| `초안 고정됨` | 이미 고정된 상태 표시 |
| `초안 다시 생성` | 현재 source와 flow 기준으로 활성 Draft를 다시 생성한다 |
| `고정 해제(리셋)` | 고정된 초안을 다시 수정 가능한 상태로 돌린다 |

고정 상태에서는 source 입력과 flow 옵션 변경을 막는다.

현재 고정은 서버 제출이 아니라 프론트 상태 잠금이다. 실제 저장/제출/승인 기능은 백엔드 저장 모델이 확정된 뒤 연결한다.

---

## 10. 미래 라우트 계획

현재 구현은 단일 화면 앱이지만, 장기적으로는 아래 라우트로 확장할 수 있다.

| 라우트 | 화면 | 디자인 참조 |
|---|---|---|
| `/dashboard` | 사안 관리 대시보드 | 추후 별도 Stitch 시안 확정 |
| `/cases/new` | 사안 접수 및 서식10 초안 작성 | `stitch(new)/10/screen.png` |
| `/cases/:caseId` | 사안 상세 워크스페이스 | `stitch(new)/ai/screen.png`의 dossier/workspace 구조 |
| `/cases/:caseId/investigations` | 조사 기록 관리 | `stitch(new)/ai/screen.png`의 좌측 source/우측 draft 구조 확장 |
| `/cases/:caseId/documents` | 서식12 기반 후속 드래프트 생성 | `stitch(new)/ai/screen.png` |
| `/templates` | 서식 및 템플릿 라이브러리 | 추후 별도 Stitch 시안 확정 |

라우터 도입 전까지는 현재 `activeView` 구조를 유지한다.

---

## 11. 검증 기준

프론트 변경 후 기본 검증:

```bash
cd frontend
npm run build
```

추가 확인:

- `git diff --check`
- `Case Intake`에서 초안 생성 후 미리보기 갱신 여부
- `Document Management`에서 DRAFT 18/19 옵션별 활성/비활성 표시
- 비활성 Draft가 API 호출을 보내지 않는지 확인
- `초안 고정`, `고정 해제(리셋)` 상태 변화
- `Help` 팝오버 위치와 페이드 인 동작
- 생성 환경 제어판 열기/닫기와 로컬 설정 저장
- 사용자 프로필 저장 후 좌측 하단 카드 반영
- 모바일에서 상단 탭과 Help 접근 가능 여부

---

## 12. 확정 대기 항목

아래 항목은 구현이 커지기 전에 사용자와 다시 확인해야 한다.

| 항목 | 현재 기본값 | 확인 필요 |
|---|---|---|
| 라우팅 | `activeView` 기반 단일 화면 | React Router 도입 시점 |
| 실제 AI provider | `MockGenerator` | Gemini 우선인지, OpenAI도 병행할지 |
| API 생성 방식 | 개별 Draft 동기 생성 | job/polling 구조로 갈지 |
| 저장 기능 | 프론트 상태와 localStorage 일부 | 백엔드 DB 저장 시점 |
| 승인/제출 | 프론트 잠금 상태 | 실제 서버 제출/승인 모델 |
| 문서 export | MVP 제외 | HWPX/DOCX/PDF 중 우선 형식 |
