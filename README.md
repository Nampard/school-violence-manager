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

## 프론트 검증

```bash
cd frontend
npm run build
```
