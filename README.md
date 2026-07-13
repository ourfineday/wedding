# 모바일 청첩장 (GitHub Pages)

빌드 도구 없는 순수 정적 사이트로 만든 모바일 청첩장입니다.
공지용/초대용 두 버전, D-Day, 오시는 길(3사 길찾기), 카카오톡 공유를 지원합니다.

## 📁 구조

```
index.html          섹션 뼈대 + 링크 미리보기(OG) 메타
styles/base.css     레이아웃 · 반응형
styles/themes.css   4가지 테마 색/폰트
scripts/config.js   ★ 내용 전부 (이름·날짜·장소·사진·인사말·카카오키)
scripts/main.js     렌더링 · D-Day · 버전분기 · 테마 · 지도 · 공유
images/             사진 (main.jpg, sub.jpg)
tests/              node --test 유닛/렌더 테스트
```

## ✏️ 내용 수정 — 거의 전부 `scripts/config.js` 한 곳

| 항목 | 필드 |
|---|---|
| 신랑/신부 이름 | `groom.name`, `bride.name` |
| 예식 일시 | `wedding.datetime` (예: `"2026-10-17T13:00:00"`, 오프셋 없이 한국시간) |
| 예식장 이름/주소 | `wedding.venue`, `wedding.address` |
| 예식장 좌표 | `wedding.lat`, `wedding.lng` |
| 인사말 | `greeting` (`\n`으로 줄바꿈) |
| 사진 경로 | `photos.main`, `photos.sub` |
| 카카오 JS 키 | `kakaoJsKey` (선택) |
| 테마 | `theme` = `minimal`\|`classic`\|`natural`\|`reference` |
| 테마 미리보기 바 | `previewMode` = `true`면 상단 4개 비교 바 표시 |

## 📷 사진 넣기

`images/` 폴더에 `main.jpg`, `sub.jpg`를 넣으면 됩니다 (`config.photos` 경로와 일치).
- 권장 비율 **4:5**(세로). 파일이 없으면 자동으로 회색 플레이스홀더가 표시됩니다.
- 다른 파일명을 쓰려면 `config.photos`의 경로를 바꾸세요.

## 📍 예식장 위치

`config.wedding.lat`/`lng`를 실제 좌표로 바꾸세요. (지도에서 해당 위치 우클릭 → 좌표 확인)
- **카카오맵 · 네이버지도** 버튼: PC·모바일 모두 열립니다.
- **티맵** 버튼: 티맵은 웹 주소가 없어 **휴대폰의 티맵 앱에서만** 열립니다. PC에선 안내 문구만 표시됩니다.

## 🔗 두 가지 링크 (핵심)

- **공지용**(장소·오시는 길 숨김): `https://<아이디>.github.io/`
- **초대용**(장소·오시는 길 포함): `https://<아이디>.github.io/?to=invite`

→ 초대하는 분께는 `?to=invite` 링크를, 그 외에는 기본 링크를 공유하세요.
카카오톡 공유·링크 복사 버튼은 **지금 보고 있는 버전의 주소**를 그대로 공유합니다.

## 🖥 로컬 미리보기

```
python -m http.server 8000
# 브라우저에서 http://127.0.0.1:8000/  (초대용: ?to=invite)
```

## 🚀 GitHub Pages 배포

1. GitHub에서 **공개(public) 저장소** 생성. (주소를 `<아이디>.github.io`로 하려면 저장소 이름을 정확히 `<아이디>.github.io`로)
2. 이 폴더 전체를 push.
3. 저장소 **Settings ▸ Pages ▸ Source: “Deploy from a branch” ▸ Branch: `main` / `(root)` ▸ Save**.
4. 1~2분 뒤 배포 주소에서 확인. (저장소명이 `<아이디>.github.io`가 아니면 주소는 `https://<아이디>.github.io/<저장소명>/`)

## 💬 카카오톡 카드형 공유 + 움직이는 지도 (선택)

키가 없어도 **링크 복사/기기 공유 + 지도 이미지·버튼**으로 완전히 동작합니다.
아래는 "예쁜 카드 공유 + 움직이는 지도"를 켜는 방법입니다.

1. <https://developers.kakao.com> 로그인 → **내 애플리케이션 ▸ 애플리케이션 추가**.
2. **앱 설정 ▸ 플랫폼 ▸ Web ▸ 사이트 도메인**에 배포 주소 등록 (예: `https://<아이디>.github.io`).
3. **앱 키 ▸ JavaScript 키** 복사 → `scripts/config.js`의 `kakaoJsKey`에 붙여넣기.
4. (지도) **앱 설정 ▸ 카카오맵** 활성화 → 오시는 길이 움직이는 카카오 지도로 바뀝니다.

## 🖼 링크 미리보기(OG) 커스터마이즈 (선택)

카카오톡에 링크만 붙였을 때 뜨는 미리보기(썸네일+제목)는 `index.html` 상단의
`<meta property="og:...">`로 조절합니다.
- 이름을 넣고 싶으면 `og:title`을 수정 (예: `김민준 · 이서연 결혼합니다`).
- `og:image`는 배포 후 **절대 주소**를 권장 (예: `https://<아이디>.github.io/images/main.jpg`).

## ✅ 테스트

```
node --test tests/
```
순수 로직(날짜/D-Day/버전분기/길찾기/테마) + 렌더 결과를 검증합니다.
