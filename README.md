# FindMe

학교 분실물을 사진, 검색어, 필터로 빠르게 찾는 정적 웹앱 MVP입니다.

## 포함된 기능

- 최근 등록 분실물 카드형 목록
- 키워드 검색
- 종류, 색상, 발견 장소, 상태 필터
- 사진 업로드 기반 미리보기
- 제목/사진 기반 자동 태그 추천
- 사용자가 직접 누르는 `수령 완료`
- 관리자용 복구/삭제/오래된 항목 확인
- 브라우저 `localStorage` 저장

## 실행 방법

`index.html`을 브라우저에서 바로 열면 됩니다.

간단한 로컬 서버로 보고 싶다면:

```bash
python3 -m http.server 4173
```

그 뒤 `http://localhost:4173`로 접속하면 됩니다.

## Vercel 배포

이 프로젝트는 정적 프론트엔드라서 Vercel에 바로 배포할 수 있습니다.

1. Git 저장소를 Vercel에 import 합니다.
2. Framework Preset은 `Other`로 둡니다.
3. Build Command는 비워둡니다.
4. Output Directory도 비워둡니다.
5. Deploy 하면 루트의 `index.html`이 그대로 배포됩니다.

`vercel.json`에는 깔끔한 URL과 기본 정적 배포 설정만 넣어두었습니다.

## 현재 제외한 것

- 로그인
- 리로스쿨 연동
- 실제 서버/DB
- 실제 AI 모델 추론

현재 자동 분류는 MVP용으로 제목 키워드와 이미지 대표 색상 추정 방식으로 구현했습니다.
