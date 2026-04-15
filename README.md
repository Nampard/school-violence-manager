# 학교폭력 관리 프로그램

특성화고 학교폭력 담당 교사의 사안 접수, 조사 기록, 서식별 행정 문구 생성을 돕는 업무 도구다.

## 현재 책임 구조

- Codex: 플랜, 계약, 백엔드, 프론트엔드 구현 및 검증
- 외부 모델 산출물: 참고 시안으로만 사용
- 담당 교사: AI 초안 최종 검토

## 주요 문서

- `docs/CONTRACT.md`: 제품/API/백엔드/프론트 상위 계약
- `docs/FRONTEND_CONTRACT.md`: 프론트 구현 기준
- `docs/design/DESIGN.md`: 디자인 방향
- `docs/design/design prompt.html`: 디자인 참고 HTML
- `agent.md`: 작업 원칙
- `reference/`: 제공 PDF/HWPX 원본 자료

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
