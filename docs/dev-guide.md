# 개발 가이드 — 주요 함정 및 해결책

## 탭 스크롤 위치 고정

### 문제 요약
탭 메뉴(`.tabs`)가 sticky 상태일 때 클릭해도 상단에 고정되지 않는 현상.

### 원인 1: `getBoundingClientRect()`는 sticky 요소에 사용 불가
```js
// ❌ 잘못된 방법 — sticky 상태에서 .top이 항상 64를 반환
const top = tabsEl.getBoundingClientRect().top + window.scrollY - 64;
// sticky이면: 64 + scrollY - 64 = scrollY → 스크롤 안 됨
```

```js
// ✅ 올바른 방법 — sticky 영향 없는 .mhero 기준으로 계산
const mhero = document.querySelector('.mhero');
this.tabsScrollTop = mhero.offsetTop + mhero.offsetHeight - 64;
```

### 원인 2: 스크롤은 반드시 콘텐츠 로드 **후**에 실행
```js
// ❌ 잘못된 순서 — loadTabContent가 DOM을 변경하면 브라우저 scroll anchoring이
//    스크롤 위치를 다시 조정해버림. 첫 클릭(캐시 없음)에서만 실패하는 이유.
window.scrollTo({ top: this.tabsScrollTop });
await this.loadTabContent(tab);

// ✅ 올바른 순서
await this.loadTabContent(tab);
window.scrollTo({ top: this.tabsScrollTop });
```

### 원인 3: `window.scrollTo(0, 0)`은 탭 페이지에서 쓰지 말 것
- 절대 최상단(0)으로 가면 `.mhero` 히어로 섹션이 탭 위에 다시 나타남
- 대신 `this.tabsScrollTop`(페이지 진입 시 계산 후 저장한 값)을 사용

### 현재 구현 요약
```js
// navigate() — 탭 페이지 진입 시 한 번만 계산하여 저장
const mhero = document.querySelector('.mhero');
this.tabsScrollTop = mhero ? mhero.offsetTop + mhero.offsetHeight - 64 : 0;
window.scrollTo({ top: this.tabsScrollTop });

// switchTab() — 콘텐츠 로드 후 저장된 값으로 스크롤
await this.loadTabContent(tab);
window.scrollTo({ top: this.tabsScrollTop || 0 });
```

---

## 커스텀 마크다운 블록 (renderer.js)

### 중첩 블록 미지원
`:::` 블록 안에 `:::` 블록을 넣으면 파싱이 깨짐.
2열 레이아웃 등 복잡한 구조는 마크다운 파일에 HTML 직접 작성.

### `:::steps` TDZ 버그 (수정 완료)
```js
// ❌ items가 선언되기 전에 콜백 내부에서 items.length 참조 → ReferenceError
const items = body.trim().split(...).map((item) => {
  return `... ${items.length} ...`; // TDZ!
});

// ✅ idx 파라미터 사용
const numbered = body.trim().split(...).map((item, idx) => {
  return `<div class="sn">${idx + 1}</div>`;
});
```

---

## 로컬 서버 필수
마크다운 파일을 `fetch()`로 로드하므로 `file://` 프로토콜에서는 CORS 오류 발생.
반드시 HTTP 서버로 실행:
```bash
./serve.sh          # 기본 8080 포트
./serve.sh 8081     # 포트 지정
```

---

## 파일 구조
```
index.html
js/
  config.js     — 사이트 구조 (페이지·탭 정의)
  renderer.js   — 마크다운 → HTML 변환 (커스텀 블록 포함)
  app.js        — 라우팅·렌더링·이벤트
css/
  style.css
content/
  mstr/         — MSTR 탭별 마크다운 파일 (0-overview.md ~ 7-risk.md)
```

새 탭/페이지 추가 시 `config.js`만 수정하면 됨. 콘텐츠는 해당 `.md` 파일 편집.
