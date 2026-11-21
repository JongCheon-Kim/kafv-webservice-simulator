# KAFV 실전형 웹서비스 가상체험 마법사 — 연동 화면 실험

> **현재 저장소 상태: 날씨 API 연결·화면 캡처용 TEST v0.1**  
> 최종 「KAFV 실전형 웹서비스 가상체험 마법사」가 아닙니다. GitHub·공공데이터포털·Cloudflare의 실제 설정·배포 화면을 확보하기 위한 임시 실험 환경입니다.

## 실험 목적

GitHub Pages에 웹앱 화면을 공개하고, Cloudflare Worker를 통해 공공데이터포털에 등록된 기상청 API를 호출하는 절차를 확인합니다. 업로드, Commit, Pages 설정, Actions 배포 상태, API 신청, Worker 배포와 응답 확인 화면을 교육용 참고자료로 확보합니다.

## 파일 구성

| 파일 | 역할 |
|---|---|
| `index.html` | GitHub Pages에서 실행하는 날씨 API 연결 시험 웹앱 |
| `cloudflare-worker.js` | Cloudflare Workers 편집기에 붙여넣는 API 중계 코드 |
| `README.md` | 저장소 첫 화면에 표시되는 프로젝트 소개 |
| `README_화면캡처_실험순서.md` | 화면 캡처를 위한 상세 실습 안내 |

## 진행 순서

1. **GitHub:** `index.html` 업로드 → Commit → `Settings → Pages`에서 `main / (root)` 설정 → Actions 배포 확인
2. **공공데이터포털:** [기상청 단기예보 조회서비스](https://www.data.go.kr/data/15084084/openapi.do) 검색 및 활용신청 → 인증키 확인
3. **Cloudflare:** Worker 생성 → `cloudflare-worker.js` 코드 붙여넣기 → 배포 → Secret `KMA_SERVICE_KEY` 설정
4. **웹앱:** Worker URL을 입력하고 상태 확인 → 실제 API 조회 → 정상·오류 응답과 응답 시간 확인

**예상 GitHub Pages 주소:** https://jongcheon-kim.github.io/kafv-webservice-simulator/

## 중요 안내

- **인증키·비밀번호·토큰은 GitHub에 게시하지 않습니다.** 공공데이터 API 키는 Cloudflare Worker의 Secret `KMA_SERVICE_KEY`에만 설정합니다.
- 화면의 **예시 데이터는 실제 관측 데이터가 아닙니다.** 실제 조회 성공 여부는 API 응답으로 구분합니다.
- `cloudflare-worker.js`를 GitHub에 올리는 것만으로 Worker가 배포되지는 않습니다. Cloudflare에서 별도로 코드를 등록하고 배포해야 합니다.
- 외부 API 호출에는 인증·사용량·통신 오류가 발생할 수 있으며, 이번 버전은 기능 시연용입니다.
- 기존 **KAFV 인터랙티브 통합교재 v2.1.1 MASTER** 및 수산 워크스테이션은 변경하지 않습니다.

자세한 단계별 캡처 순서는 `README_화면캡처_실험순서.md`를 참고하십시오.
