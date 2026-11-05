# 밸류컴퍼스 홈페이지 (vlcom.co.kr)

Framer로 만든 사이트를 의존성 없는 정적 HTML/CSS/JS로 옮긴 버전입니다. GitHub Pages가 `docs/` 폴더를 그대로 서비스합니다.

## 구조

| 경로 | 내용 |
|---|---|
| `src/pages/*.html` | 페이지 본문 (맨 위 주석에 경로·제목·설명) |
| `src/partials/*.html` | 공통 조각: `layout`, `header`, `footer`, `form` |
| `static/` | 그대로 복사되는 파일: CSS, JS, 이미지, 영상, 폰트, 파비콘 |
| `docs/` | 빌드 결과물 (**직접 수정하지 말 것**, 빌드하면 덮어씀) |
| `apps-script/Code.gs` | 문의 폼 수신용 Google Apps Script |
| `tools/` | 빌드·로컬 서버·에셋 스크립트 |

## 수정하고 배포하기

```bash
npm install          # 처음 한 번 (sharp: 이미지 처리용)
npm run build        # src + static -> docs
node tools/serve.mjs # http://localhost:4890 에서 확인
```

`docs/`까지 커밋해서 `main`에 push하면 1~2분 뒤 반영됩니다.

## 문의 폼 (현재: Web3Forms → vlcom260713@gmail.com)

문의 폼은 [Web3Forms](https://web3forms.com) 무료 플랜(월 250건)으로 메일 발송합니다. 키는 `static/assets/js/site.js`의 `WEB3FORMS_KEY` (공개 값이라 코드에 둬도 됨), 받는 주소는 Web3Forms 대시보드에서 바꿉니다.
- 요청은 반드시 `URLSearchParams`(urlencoded)로 보낼 것: JSON은 CORS 사전 요청이 거부되고, multipart는 한글 항목 이름이 깨집니다.
- 서버에서 직접 호출(curl 등)은 막혀 있고(403), 헤드리스 브라우저 기본 UA도 차단될 수 있습니다. 시험은 일반 브라우저로.

## (보류) 문의 폼 Google 스프레드시트 연결

vlcom260713@gmail.com 구글 계정은 생년월일을 성인으로 고쳤지만 아직 Family Link 보호자(마강희) 관리 상태라 Apps Script가 막혀 있습니다. 보호자가 관리를 해제하면 아래 절차로 시트 저장을 붙입니다. 시트는 이미 만들어 둠: https://docs.google.com/spreadsheets/d/1ZT-nAeEhb_ZeofaFEyXSIi6VSpP4ZIXfd6ttdU60er4/edit

`site.js`는 `SHEET_ENDPOINT`가 비어 있으면 Web3Forms만 쓰고, 채워지면 시트로 먼저 보내고 실패할 때만 Web3Forms로 보냅니다.

1. Google 계정으로 새 스프레드시트를 만든다 (이름 예: `밸류컴퍼스 홈페이지 문의`).
2. 메뉴 **확장 프로그램 → Apps Script** → `Code.gs` 내용을 `apps-script/Code.gs`로 바꿔 붙여넣고 저장.
3. 함수 선택에서 `setup` 실행 → 권한 승인 (스프레드시트·메일 발송 권한).
4. **배포 → 새 배포 → 유형: 웹 앱** / 실행 사용자: **나** / 액세스 권한: **모든 사용자** → 배포.
5. 나온 웹 앱 URL(`https://script.google.com/macros/s/…/exec`)을 `static/assets/js/site.js`의 `SHEET_ENDPOINT`에 넣고 빌드·배포.

접수되면 시트 `문의` 탭에 한 줄씩 쌓이고 `main@vlcom.co.kr`로 알림 메일이 갑니다 (메일에서 바로 회신하면 문의자에게 갑니다).
Apps Script를 고친 뒤에는 **배포 관리 → 수정 → 버전: 새 버전**으로 다시 배포해야 반영됩니다 (URL은 그대로).

## 도메인 (vlcom.co.kr)

DNS는 메일플러그에서 관리합니다. **기존 MX·TXT(SPF) 레코드는 그대로 두고** 아래만 추가합니다.

| 호스트 | 유형 | 값 |
|---|---|---|
| `@` | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |
| `www` | CNAME | `<GitHub 계정>.github.io.` |

GitHub 저장소 **Settings → Pages**: Source `Deploy from a branch`, Branch `main` / `/docs`, Custom domain `vlcom.co.kr`, DNS 확인 후 **Enforce HTTPS** 체크.

## 작업 인계 메모 (2026-11-05 기준)

### push 방법
저장소 소유 계정은 `vlcom260713-droid`이고, 원격 URL에 사용자명이 들어 있어 Windows 자격 증명 관리자에 저장된 vlcom 로그인이 쓰입니다.
이 PC는 gh CLI가 다른 계정(wisa-creative)으로 로그인돼 있어 그냥 `git push`하면 403이 납니다. 아래처럼 그 한 번만 helper를 비우고 push합니다 (git 설정은 건드리지 않음).

```bash
git -c "credential.https://github.com.helper=" -c "credential.https://github.com.helper=manager" push
```

### 최근 반영한 것
- 고객 카피 수정안 v2(11/04 문서) 전체: 메인 Why Valuecompass 섹션, 컨설팅 페이지 서비스 라벨·문구·절차·CTA, Voices 삭제, 회사소개 Core Competence·대표 이력·Our Value, 함께한 경험 대표 사례 2건
- 회사소개서 11월 v1.2 기준: 노샛별 대표컨설턴트 프로필, 대표 자격 세부(괄호), 문의 페이지 이메일 main@로 통일
- 네이버·구글 소유확인 메타태그 (`src/partials/layout.html`)
- 컨설팅 경영전략 2번째 카드 사진 `strategy-2.jpg`는 Freepik 무료 스톡

### 남은 일
- 네이버 서치어드바이저·구글 서치 콘솔: 소유 확인 버튼, `sitemap.xml` 제출 (사용자 계정에서 직접)
- 상담시간 불일치: 문의 페이지 10:00, 푸터·구조화데이터 09:00 → 고객 확인 필요
- 개인정보처리방침 책임자 이메일은 아직 ceo@ (법적 문서라 고객 확인 후 변경)
- 약관·개인정보처리방침은 초안 → 고객 검토 필요
- 구글 시트 연결 (위 보류 항목)
