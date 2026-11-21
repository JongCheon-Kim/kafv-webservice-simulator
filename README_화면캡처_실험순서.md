# KAFV 날씨 API 연동 실험 v0.1 TEST — 화면 캡처용

목적: **실제 GitHub 업로드 → GitHub Pages → 공공데이터포털 API 신청 → Cloudflare Worker 작성/배포 → 날씨 조회 성공/실패** 과정을 경험하고 화면을 캡처하는 최소 구성입니다. `KAFV 실전형 웹서비스 가상체험 마법사`와는 **별도 실험물**이며, 이미 완성된 `KAFV 통합교재 v2.1.1`에는 아무 변경도 하지 않습니다.

## 1. GitHub: 웹앱 업로드·화면 캡처

기존에 만든 `kafv-webservice-simulator` 저장소 최상위(root)에 **`index.html` 하나만** 업로드하면 됩니다. GitHub의 `Add file → Upload files → Commit changes` 과정을 캡처하십시오. 이후 `Settings → Pages → Deploy from a branch → main / (root) → Save`, `Actions`의 배포 상태, 실제 웹주소를 확인합니다.

Pages 예상주소: `https://jongcheon-kim.github.io/kafv-webservice-simulator/`

※ Worker 코드는 웹사이트 공개용 파일이 아닙니다. GitHub 화면 캡처 목적이라면 `index.html`만 올리는 것이 간단합니다.

## 2. 공공데이터포털: API 신청·화면 캡처

공식 서비스: https://www.data.go.kr/data/15084084/openapi.do

정식 명칭: `기상청_단기예보 조회서비스` — `getUltraSrtNcst`(초단기실황)

회원가입·로그인 → 서비스 검색 → 상세 화면 → 활용신청 → 마이페이지에서 인증키 확인 과정을 기록합니다.

**키는 채팅·화면 캡처·GitHub 소스에 노출하면 안 됩니다.** 별도로 표시되는 `일반 인증키 (Decoding)` 값을 Cloudflare의 Secret에만 저장하십시오. 키 형태·승인 상태는 계정에 따라 다를 수 있습니다.

## 3. Cloudflare Worker: 실제 API 호출 중계

1. Cloudflare 대시보드에서 Workers & Pages → Worker 생성
2. 이름 예: `kafv-weather-test`
3. Worker 코드 편집 화면에 `cloudflare-worker.js` 내용을 붙여넣고 Deploy
4. Worker의 설정 화면에서 **Secret** 변수 추가:
   - 변수명: `KMA_SERVICE_KEY`
   - 값: 공공데이터포털에서 발급한 **Decoding 인증키**
5. Worker 재배포/활성화 후 Worker 주소 확인(예: `https://kafv-weather-test.계정.workers.dev`)
6. Worker 주소 뒤에 `/health`를 붙여 접속하면 `configured: true`가 나와야 함
7. 웹앱 화면의 `Cloudflare Worker 주소` 입력창에 Worker 주소를 넣고 `주소 저장 → Worker 상태 확인 → 실제 API 조회` 실행

**중요:**  `cloudflare-worker.js`에는 API 키가 들어 있지 않습니다. 키는 대시보드 Secret에 저장합니다. 실제 Cloudflare 인증키·API 키·계정 정보는 화면 캡처 시 가리고 공유하십시오.

## 4. 실험 시 확인할 것

- GitHub 파일 업로드 → Commit 후 파일 목록 표시
- Pages의 Actions: Pending/In progress/Success
- Cloudflare Worker: 배포 성공, `/health` 정상 응답
- 공공데이터포털 API: 신청/키 발급/호출 응답
- 웹앱: **실제 API 응답** 상태인지 **예시 화면** 상태인지 구분
- 연결 실패 시 브라우저 오류 문구와 Worker 로그 확인
- PC·모바일에서 버튼과 수치 카드가 잘리는지 확인

## 구성 파일

| 파일 | 어디에 사용 | 용도 |
|---|---|---|
| `index.html` | GitHub Pages | 날씨 조회 테스트 웹앱 |
| `cloudflare-worker.js` | Cloudflare Workers 편집기 | 실제 공공 API 호출·정리·반환 |
| `README_화면캡처_실험순서.md` | 사용자 참고 | 실습·화면 캡처 순서 |

## 주의

- 키가 없거나 API가 승인되지 않았으면 실제 조회는 실패하는 것이 정상이며, 이를 성공으로 꾸며서 표시하지 않습니다.
- `예시 화면`은 가공된 예시값이며 기상청 실황 데이터가 아닙니다.
- Cloudflare Worker는 데모용으로 공개 호출되므로 무료 사용량/쿼터를 확인하십시오. 장기 운영에는 호출 제한·모니터링·보안을 추가해야 합니다.
- 기상청 관측 자료는 실시간 시각과 완전히 같지 않을 수 있습니다. 관측 발표시각을 함께 표시합니다.

공식 참고: https://developers.cloudflare.com/workers/configuration/secrets/
