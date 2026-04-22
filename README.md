# 학교폭력 사안조사 내용 재가공 프로그램

> 프로젝트 버전: 0.1.0

특성화고 학교폭력 담당 교사의 사안 접수, 조사 기록, 서식별 행정 문구 생성을 돕는 업무 도구입니다. 이 프로그램은 로컬 환경에서 실행되며 별도 중앙 저장소에 데이터를 누적 저장하지 않는 방식을 기본으로 합니다. 다만 Gemini API를 사용하는 경우 입력한 내용이 Google API로 전송될 수 있으므로, 실제 학생 이름, 보호자 연락처, 주민등록번호, 주소 등 직접 식별 가능한 정보는 비식별화한 뒤 입력하는 것을 권장합니다.

AI가 생성한 문구는 행정 문서 작성을 돕기 위한 초안입니다. 법률 자문이나 최종 판단이 아니며, 최신 법령, 교육청 지침, 학교 내부 절차에 따라 담당 교사가 반드시 검토한 뒤 사용해야 합니다.

현재 MVP는 HWP 파일을 직접 자동 작성하기보다, 학교 공문/서식 프로그램에 바로 붙여넣을 수 있는 복사 가능한 문구 블록 생성을 우선합니다.

## 교사용 빠른 시작

### 1. 선행 프로그램 설치

먼저 아래 프로그램이 필요합니다.

| 구분 | 필요한 프로그램 | 용도 |
| --- | --- | --- |
| 공통 | Git | GitHub에서 프로젝트 받기 |
| 공통 | Python | 백엔드 실행 |
| 공통 | Node.js LTS | 프론트엔드 실행 |
| 선택 | VS Code | 파일 수정과 터미널 실행 |

설치 위치:

- Git: [https://git-scm.com/downloads](https://git-scm.com/downloads)
- Python: [https://www.python.org/downloads](https://www.python.org/downloads)
- Node.js LTS: [https://nodejs.org](https://nodejs.org)
- VS Code: [https://code.visualstudio.com](https://code.visualstudio.com)

설치가 끝나면 터미널에서 아래 명령으로 확인합니다.

Windows PowerShell:

```powershell
git --version
py --version
node --version
npm --version
```

macOS 터미널:

```bash
git --version
python3 --version
node --version
npm --version
```

`google-genai`는 따로 설치하지 않아도 됩니다. 아래 백엔드 설치 명령인 `pip install -r requirements.txt`를 실행하면 자동으로 같이 설치됩니다.

### 2. 프로젝트 받기

원하는 폴더에서 아래 명령을 실행합니다.

```bash
git clone https://github.com/Nampard/school-violence-manager.git
cd school-violence-manager
```

이미 프로젝트 폴더를 받은 경우에는 `cd school-violence-manager`만 실행하시면 됩니다.

### 3. Gemini API 키 발급

1. [Google AI Studio API Keys](https://ai.google.dev/gemini-api/docs/api-key) 페이지에 접속합니다.
2. Google 계정으로 로그인합니다.
3. `Create API key` 또는 `API 키 만들기`를 눌러 키를 발급합니다.
4. 발급된 키를 복사합니다.

API 키는 비밀번호처럼 다뤄야 합니다. 카카오톡, 메신저, 공개 GitHub 저장소, 화면 캡처에 노출하지 않습니다.

`backend/.env`에 Gemini API 키가 있으면 백엔드는 Gemini를 사용하고, 키가 없으면 `MockGenerator`를 사용합니다.

### 4. API 키 적용

참고할 예시 파일은 아래 파일입니다.

```text
backend/.env.example
```

이 파일은 GitHub에 올라가도 되는 예시 파일이며, 프론트엔드와 백엔드는 이 파일을 직접 읽지 않습니다.

실제로 사용할 파일은 아래 이름이어야 합니다.

```text
backend/.env
```

처음 설정할 때는 `backend/.env.example` 파일을 참고해서 `backend/.env` 파일을 만듭니다. 그다음 아래처럼 실제 Gemini API 키를 넣습니다.

```env
GEMINI_API_KEY=여기에_발급받은_API키를_붙여넣기
AI_PROVIDER=auto
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FALLBACK_MODEL=gemini-flash-lite-latest
```

예시 파일을 그대로 활용하려면 `backend/.env.example` 파일 이름을 `backend/.env`로 바꾸고, `replace_with_your_gemini_api_key` 부분을 실제 API 키로 바꾸시면 됩니다.

주의할 점:

- 프론트엔드 파일은 수정하지 않습니다.
- 브라우저 화면에 API 키를 입력하지 않습니다.
- `backend/.env.example`은 예시 파일이라 GitHub에 올라가도 됩니다.
- `backend/.env`는 GitHub에 올리지 않습니다.
- 키를 바꾼 뒤에는 백엔드 서버를 다시 실행합니다.
- 백엔드가 Gemini를 쓰면 화면 오른쪽 위 제어판에 `Gemini 사용 중`으로 표시됩니다.
- `GEMINI_MODEL`이 일시적으로 바쁘면 `GEMINI_FALLBACK_MODEL`로 한 번 더 시도합니다.

### 5. 프로그램 실행

터미널을 2개 엽니다.

첫 번째 터미널에서는 백엔드를 실행합니다. Windows는 PowerShell 기준입니다.

Windows PowerShell:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

macOS 터미널:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

두 번째 터미널에서는 프론트엔드를 실행합니다. Windows와 macOS 모두 같습니다.

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:5173/
```

정상 연결되면 오른쪽 위 제어판에서 현재 생성 엔진을 확인할 수 있습니다.

- `Gemini 사용 중`: `backend/.env`의 API 키를 읽은 상태
- `Mock 사용 중`: API 키 없이 연습용 생성기로 실행 중인 상태

### 입문자용 용어

처음 보면 낯선 말들만 먼저 보일 수 있어서, 실행할 때 자주 나오는 것만 아주 짧게 정리해둡니다.

- `.venv`: 이 프로젝트만 쓰는 파이썬 작업 공간입니다.
- `backend/.env`: 비밀 설정을 적어두는 파일입니다. Gemini API 키를 넣는 곳입니다.
- `8000`: 백엔드가 듣는 번호입니다.
- `5173`: 프론트 화면이 열리는 번호입니다. Vite가 보통 이렇게 시작합니다.
- `터미널`: 명령어를 치는 검은 창입니다.
- `브라우저`: 화면을 여는 곳입니다. Safari, Chrome 같은 프로그램입니다.
- `MockGenerator`: API 키가 없을 때 쓰는 연습용 문구 생성기입니다.

한 줄로 보면 이렇게 생각하시면 됩니다.

```text
터미널에서 백엔드(8000)와 프론트(5173)를 따로 켜고, 브라우저는 5173을 엽니다.
```

## 현재 책임 구조

- Codex: 플랜, 계약, 백엔드, 프론트엔드 구현 및 검증
- 외부 모델 산출물: 참고 시안으로만 사용
- 담당 교사: AI 초안 최종 검토
- 관련자료: 충청북도교육청 2026. 학교폭력 사안처리 세부설명 A to Z

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
  - 현재 생성 엔진 `MockGenerator` 또는 `Gemini API` 표시
  - 서식별 자동 문체, 전술/후술 출력 구조, 교사 검토 필요 정책 표시
  - 생성 엄격도와 글자 수 제한 표시 방식을 로컬 설정으로 저장
  - `엄격`/`보통` 선택을 DRAFT 18~22 생성 요청에 반영
  - API 키는 프론트에 저장하지 않음

### 백엔드

- FastAPI 기반 API 서버
- `backend/.env`에 `GEMINI_API_KEY`가 있으면 Gemini API로 문구 생성
- API 키가 없으면 `MockGenerator`로 문구 생성
- `GeminiCaseIntakeGenerator` 또는 `MockCaseIntakeGenerator`: `<서식10>` 사안접수 초안 생성
- `GeminiGenerator` 또는 `MockGenerator`: DRAFT 18/19/20/21/22 문구 생성
- DRAFT 선택 흐름:
  - `SELF_RESOLUTION`: DRAFT 18, 20, 22 활성
  - `COMMITTEE_REQUEST`: DRAFT 18만 활성
  - `CLOSURE_*`: DRAFT 19, 21, 22 활성
- 비활성 Draft는 프론트에서 `비활성 상태임`으로 표시하고, 백엔드 요청 시 `DRAFT_DISABLED_BY_FLOW`를 반환

## AI API 연결 원칙

Gemini/OpenAI 같은 실제 AI provider는 프론트에서 직접 호출하지 않습니다.

권장 구조:

```text
프론트엔드 -> FastAPI 백엔드 -> AI Provider
```

API 키는 프론트 입력창이나 `localStorage`에 저장하지 않고, 백엔드 `.env` 환경변수로 관리합니다. 프론트의 생성 환경 제어판은 API 키 입력창이 아니라 현재 생성 엔진, 문체 기본값, 연결 상태, 로컬 생성 옵션을 확인하는 용도로 사용합니다.

## 프론트 실행

```bash
cd frontend
npm run dev -- --host 127.0.0.1
```

브라우저에서는 Vite dev server 주소로 엽니다.

```text
http://127.0.0.1:5173/
```

프론트에서 문구 생성 API를 호출하려면 백엔드를 함께 실행합니다. Vite 개발 서버는 `/api` 요청을 `127.0.0.1:8000`으로 프록시합니다.

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

현재는 `docs/CONTRACT.md`, `docs/FRONTEND_GUIDE.md`, `docs/BACKEND_PLAN.md`, `agent.md`를 핵심 문서로 유지합니다.

문서 역할:

- `docs/CONTRACT.md`: 제품, API, 도메인, 보안 상위 계약
- `docs/FRONTEND_GUIDE.md`: 화면 구조, 디자인, 프론트 상태, UX 동작
- `docs/BACKEND_PLAN.md`: FastAPI 백엔드와 문구 생성 파이프라인
- `agent.md`: 작업 방식과 사용자 확인 원칙
