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

## 문의 폼 연결 (Google 스프레드시트 + 메일 알림)

1. Google 계정으로 새 스프레드시트를 만든다 (이름 예: `밸류컴퍼스 홈페이지 문의`).
2. 메뉴 **확장 프로그램 → Apps Script** → `Code.gs` 내용을 `apps-script/Code.gs`로 바꿔 붙여넣고 저장.
3. 함수 선택에서 `setup` 실행 → 권한 승인 (스프레드시트·메일 발송 권한).
4. **배포 → 새 배포 → 유형: 웹 앱** / 실행 사용자: **나** / 액세스 권한: **모든 사용자** → 배포.
5. 나온 웹 앱 URL(`https://script.google.com/macros/s/…/exec`)을 `static/assets/js/site.js`의 `FORM_ENDPOINT`에 넣고 빌드·배포.

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
