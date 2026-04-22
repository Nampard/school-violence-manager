# 학교폭력 관리 프로그램

> 프로젝트 버전: 0.1.0

특성화고 학교폭력 담당 교사의 사안 접수, 조사 기록, 서식별 행정 문구 생성을 돕는 업무 도구다.

현재 MVP는 HWP 파일을 직접 자동 작성하기보다, 학교 공문/서식 프로그램에 바로 붙여넣을 수 있는 복사 가능한 문구 블록 생성을 우선한다.

## 교사용 빠른 시작

### 1. Gemini API 키 발급

1. [Google AI Studio API Keys](https://ai.google.dev/gemini-api/docs/api-key) 페이지에 접속한다.
2. Google 계정으로 로그인한다.
3. `Create API key` 또는 `API 키 만들기`를 눌러 키를 발급한다.
4. 발급된 키를 복사한다.

API 키는 비밀번호처럼 다뤄야 한다. 카카오톡, 메신저, 공개 GitHub 저장소, 화면 캡처에 노출하지 않는다.

현재 `0.1.0` 버전은 `MockGenerator`로도 실행할 수 있다. 실제 Gemini 연결 기능이 붙은 버전부터 아래의 `backend/.env` 키 설정을 사용한다.

### 2. API 키 적용

수정할 파일은 백엔드 설정 파일 하나다.

```text
backend/.env
```

`backend/.env` 파일이 없으면 새로 만들고, 아래처럼 입력한다.

```env
GEMINI_API_KEY=여기에_발급받은_API키를_붙여넣기
```

주의할 점:

- 프론트엔드 파일은 수정하지 않는다.
- 브라우저 화면에 API 키를 입력하지 않는다.
- `backend/.env`는 GitHub에 올리지 않는다.
- 키를 바꾼 뒤에는 백엔드 서버를 다시 실행한다.

### 3. 프로그램 실행

터미널을 2개 연다.

첫 번째 터미널에서는 백엔드를 실행한다.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

두 번째 터미널에서는 프론트엔드를 실행한다.

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

브라우저에서 아래 주소를 연다.

```text
http://127.0.0.1:5173/
```

### 입문자용 용어

처음 보면 낯선 말들만 먼저 보일 수 있어서, 실행할 때 자주 나오는 것만 아주 짧게 정리해둔다.

- `.venv`: 이 프로젝트만 쓰는 파이썬 작업 공간이다.
- `backend/.env`: 비밀 설정을 적어두는 파일이다. Gemini API 키를 넣는 곳이다.
- `8000`: 백엔드가 듣는 번호다.
- `5173`: 프론트 화면이 열리는 번호다. Vite가 보통 이렇게 시작한다.
- `터미널`: 명령어를 치는 검은 창이다.
- `브라우저`: 화면을 여는 곳이다. Safari, Chrome 같은 프로그램이다.
- `MockGenerator`: 아직 실제 Gemini 대신 쓰는 연습용 문구 생성기다.

한 줄로 보면 이렇게 생각하면 된다.

```text
터미널에서 백엔드(8000)와 프론트(5173)를 따로 켜고, 브라우저는 5173을 연다.
```

## 현재 책임 구조

- Codex: 플랜, 계약, 백엔드, 프론트엔드 구현 및 검증
- 외부 모델 산출물: 참고 시안으로만 사용
- 담당 교사: AI 초안 최종 검토

## 주요 문서

- `docs/CONTRACT.md`: 제품/API/백엔드/프론트 상위 계약
- `docs/FRONTEND_GUIDE.md`: 프론트 화면 구조, 디자인 기준, 컴포넌트/UX 구현 기준
- `docs/BACKEND_PLAN.md`: FastAPI 백엔드, MockGenerator, Draft 생성 흐름 작업 메모
- `agent.md`: 작업 원칙
- `stitch(new)/equilibrium_admin/DESIGN.md`: 현재 프론트 디자인 기준
- `stitch(new)/10/screen.png`, `stitch(new)/ai/screen.png`: 화면 밀도와 레이아웃 참고 이미지

## 현재 구현 범위

### 프론트엔드

- React + Vite 기반 단일 화면 앱
- 좌측 메뉴:
  - `Case Intake`: `<서식10>` 사안접수 초안 생성
  - `Document Management`: `<서식12>` 원천 입력 기반 DRAFT 18~22 생성
  - `Help`: 마우스 위치 기준 도움말 팝오버
- 상단바:
  - 제목 `ARCHIVE-01: 학교폭력 사안처리 생성기`
  - 한국 기준 현재 날짜와 초 단위 실시간 시각
  - 생성 환경 제어판
  - 사용자 프로필 설정
- 사용자 프로필:
  - 오른쪽 위 사람 아이콘에서 소속학교와 교사 이름 저장
  - 왼쪽 아래 프로필 카드에 저장값 표시
  - 브라우저 `localStorage`에 표시용 정보 저장
- 생성 환경 제어판:
  - 현재 생성 엔진 `MockGenerator` 표시
  - 서식별 자동 문체, 전술/후술 출력 구조, 교사 검토 필요 정책 표시
  - 생성 엄격도와 글자 수 제한 표시 방식을 로컬 설정으로 저장
  - `엄격`/`보통` 선택을 DRAFT 18~22 생성 요청에 반영
  - API 키는 프론트에 저장하지 않음

### 백엔드

- FastAPI 기반 API 서버
- 현재 문구 생성은 실제 AI API가 아니라 mock provider로 운용
- `MockCaseIntakeGenerator`: `<서식10>` 사안접수 초안 생성
- `MockGenerator`: DRAFT 18/19/20/21/22 문구 생성
- DRAFT 선택 흐름:
  - `SELF_RESOLUTION`: DRAFT 18, 20, 22 활성
  - `COMMITTEE_REQUEST`: DRAFT 18만 활성
  - `CLOSURE_*`: DRAFT 19, 21, 22 활성
- 비활성 Draft는 프론트에서 `비활성 상태임`으로 표시하고, 백엔드 요청 시 `DRAFT_DISABLED_BY_FLOW`를 반환

## AI API 연결 원칙

Gemini/OpenAI 같은 실제 AI provider는 프론트에서 직접 호출하지 않는다.

권장 구조:

```text
프론트엔드 -> FastAPI 백엔드 -> AI Provider
```

API 키는 프론트 입력창이나 `localStorage`에 저장하지 않고, 백엔드 `.env` 환경변수로 관리한다. 프론트의 생성 환경 제어판은 API 키 입력창이 아니라 현재 생성 엔진, 문체 기본값, 연결 상태, 로컬 생성 옵션을 확인하는 용도로 사용한다.

## 프론트 실행

```bash
cd frontend
npm run dev -- --host 127.0.0.1
```

브라우저에서는 Vite dev server 주소로 연다.

```text
http://127.0.0.1:5173/
```

프론트에서 문구 생성 API를 호출하려면 백엔드를 함께 실행한다. Vite 개발 서버는 `/api` 요청을 `127.0.0.1:8000`으로 프록시한다.

현재 프론트가 호출하는 주요 백엔드 API:

- `POST /api/v1/cases/{case_id}/intake/generate`: `<서식10>` 사안접수 초안 생성
- `POST /api/v1/cases/{case_id}/documents/generate`: DRAFT 18/19/20/21/22 문구 생성

## 백엔드 실행

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

상태 확인:

```text
http://127.0.0.1:8000/health
```

## 프론트 검증

```bash
cd frontend
npm run build
```

## 백엔드 검증

```bash
python3 -m unittest discover backend/tests
python3 -m compileall backend
```

## 문서 정리 메모

현재는 `docs/CONTRACT.md`, `docs/FRONTEND_GUIDE.md`, `docs/BACKEND_PLAN.md`, `agent.md`를 핵심 문서로 유지한다.

문서 역할:

- `docs/CONTRACT.md`: 제품, API, 도메인, 보안 상위 계약
- `docs/FRONTEND_GUIDE.md`: 화면 구조, 디자인, 프론트 상태, UX 동작
- `docs/BACKEND_PLAN.md`: FastAPI 백엔드와 문구 생성 파이프라인
- `agent.md`: 작업 방식과 사용자 확인 원칙
