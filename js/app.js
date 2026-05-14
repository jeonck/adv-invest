/**
 * app.js — 해시 기반 라우팅, 페이지 렌더링, 이벤트 처리
 *
 * URL 구조:
 *   #home          → 홈 페이지
 *   #mstr          → MSTR 페이지 (첫 번째 탭)
 *   #mstr/t2       → MSTR 페이지, t2 탭
 *   #method/t3     → 일등주식투자법 페이지, t3 탭
 */
const App = {
  currentPage: null,
  currentTab:  null,
  tabsScrollTop: 0,
  cache: {},

  // ── Mermaid 초기화 ──────────────────────────────────────────
  initMermaid() {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor:         '#f7931a',
        primaryTextColor:     '#e2e8f0',
        primaryBorderColor:   '#f7931a',
        lineColor:            '#94a3b8',
        secondaryColor:       '#1a2035',
        tertiaryColor:        '#141824',
        background:           '#141824',
        mainBkg:              '#1a2035',
        nodeBorder:           '#2d3748',
        clusterBkg:           '#1a2035',
        titleColor:           '#e2e8f0',
        edgeLabelBackground:  '#141824',
        pie1: '#f7931a', pie2: '#3b82f6', pie3: '#10b981', pie4: '#fbbf24',
        pieLegendTextColor:   '#e2e8f0',
        pieStrokeColor:       '#141824',
      },
      flowchart: { curve: 'basis', htmlLabels: true }
    });
  },

  // ── 네비게이션 바 렌더링 ────────────────────────────────────
  renderNav() {
    const links = SITE.pages.map(p => `
      <li>
        <a id="nav-${p.id}" href="#${p.id}">${p.navLabel}</a>
      </li>`).join('');

    document.getElementById('nav-root').innerHTML = `
      <a class="logo" href="#home">${SITE.title}</a>
      <ul class="nav-links">${links}</ul>`;
  },

  // ── 마크다운 파일 로드 (캐시 포함) ─────────────────────────
  async fetchMd(url) {
    if (this.cache[url]) return this.cache[url];
    const res = await fetch(url);
    if (!res.ok) throw new Error(`파일 로드 실패: ${url}`);
    const text = await res.text();
    this.cache[url] = text;
    return text;
  },

  // ── 해시 파싱 → { pageId, tabId } ──────────────────────────
  parseHash() {
    const raw = window.location.hash.replace('#', '') || 'home';
    const [pageId, tabId] = raw.split('/');
    return { pageId: pageId || 'home', tabId: tabId || null };
  },

  // ── 프로그래매틱 이동 (해시 업데이트 → hashchange 발생) ────
  navigate(pageId, tabId) {
    window.location.hash = tabId ? `${pageId}/${tabId}` : pageId;
  },

  // ── 홈 페이지 HTML 생성 ─────────────────────────────────────
  buildHomePage(page) {
    const { hero, cards, featureStats } = page;

    const buttons = hero.buttons.map(b =>
      `<button class="btn btn-${b.style}" onclick="App.navigate('${b.page}')">${b.label}</button>`
    ).join('');

    const cardHtml = cards.map(c => {
      const badges = (c.badges || []).map(b =>
        `<span class="badge b${b.style[0]}">${b.label}</span>`).join('');
      const onclick = c.page ? `onclick="App.navigate('${c.page}')" style="cursor:pointer"` : '';
      return `
        <div class="card" ${onclick}>
          <div class="ico">${c.icon}</div>
          <h3>${c.title}</h3>
          <p>${c.desc}</p>
          <div style="margin-top:.8rem">${badges}</div>
        </div>`;
    }).join('');

    const statsHtml = featureStats.map(s => `
      <div class="stat">
        <div class="v" style="font-size:1.4rem">${s.value}</div>
        <div class="l">${s.label}</div>
      </div>`).join('');

    return `
      <div class="hero">
        <h1>${hero.title.replace('\n', '<br>')}</h1>
        <p>${hero.subtitle}</p>
        <div class="btns">${buttons}</div>
      </div>

      <div class="sec wrap">
        <div class="sec-t">투자 전략 가이드</div>
        <div class="sec-sub">지금 바로 시작할 수 있는 검증된 투자 원리</div>
        <div class="grid">${cardHtml}</div>
      </div>

      <div style="background:var(--card);padding:3rem 2rem;border-top:1px solid var(--border)">
        <div class="wrap">
          <div class="sec-t">왜 최고의 투자인가?</div>
          <div class="sec-sub">복잡한 금융 원리를 초등학생도 알 수 있도록</div>
          <div class="stats">${statsHtml}</div>
        </div>
      </div>`;
  },

  // ── 단순 페이지(simple) 렌더링 ─────────────────────────────
  async buildSimplePage(page) {
    const color = page.hero?.color || 'green';
    const heroHtml = `
      <div class="simple-hero color-${color}">
        <h1>${page.hero.title}</h1>
        <p class="mut">${page.hero.subtitle}</p>
      </div>`;

    let bodyHtml = '<div class="wrap sec"><p class="mut">내용 로딩 중...</p></div>';
    if (page.content) {
      const md = await this.fetchMd(page.content);
      bodyHtml = `<div class="wrap sec md-body">${Renderer.render(md)}</div>`;
    }
    return heroHtml + bodyHtml;
  },

  // ── 탭 페이지(tabbed) HTML 생성 ────────────────────────────
  buildTabbedPage(page, activeTabId) {
    const { hero, tabs } = page;
    const firstTabId = activeTabId || tabs[0].id;

    const statsHtml = hero.stats.map(s => `
      <div class="stat">
        <div class="v" style="font-size:${s.value.length > 4 ? '1.1rem' : '1.6rem'}">${s.value}</div>
        <div class="l">${s.label}</div>
      </div>`).join('');

    const tabBtns = tabs.map(t =>
      `<button class="tab${t.id === firstTabId ? ' on' : ''}"
               data-tab="${t.id}"
               onclick="App.navigate('${page.id}','${t.id}')">${t.label}</button>`
    ).join('');

    const tabContents = tabs.map(t =>
      `<div id="tc-${t.id}" class="tc${t.id === firstTabId ? ' on' : ''}">
         <p class="mut" style="padding:2rem">로딩 중...</p>
       </div>`
    ).join('');

    return `
      <div class="mhero">
        <div class="wrap">
          <div style="display:flex;align-items:center;gap:1rem;margin-bottom:.8rem">
            <span style="font-size:2.8rem">${hero.icon}</span>
            <div>
              <h1 class="mhero-title">${hero.title}</h1>
              <p class="mut">${hero.subtitle}</p>
            </div>
          </div>
          <div class="stats">${statsHtml}</div>
        </div>
      </div>
      <div class="tabs">${tabBtns}</div>
      <div id="tab-body-${page.id}">${tabContents}</div>`;
  },

  // ── 탭 콘텐츠 지연 로드 ────────────────────────────────────
  async loadTabContent(tab) {
    const el = document.getElementById(`tc-${tab.id}`);
    if (!el || el.dataset.loaded) return;
    try {
      const md = await this.fetchMd(tab.content);
      el.innerHTML = `<div class="md-body">${Renderer.render(md)}</div>`;
      el.dataset.loaded = '1';
      setTimeout(() => mermaid.run({ nodes: el.querySelectorAll('.mermaid') }), 80);
    } catch (e) {
      el.innerHTML = `<div class="md-body"><div class="wbox">⚠️ 콘텐츠 로드 실패: ${tab.content}<br><small>${e.message}</small></div></div>`;
    }
  },

  // ── 탭 활성화 (버튼 + 콘텐츠 패널) ────────────────────────
  async activateTab(page, tabId) {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
    document.querySelectorAll('.tc').forEach(t => t.classList.remove('on'));

    const btn = document.querySelector(`.tab[data-tab="${tabId}"]`);
    if (btn) btn.classList.add('on');

    const el = document.getElementById(`tc-${tabId}`);
    if (el) {
      el.classList.add('on');
      const tab = page.tabs.find(t => t.id === tabId);
      if (tab) await this.loadTabContent(tab);
    }
  },

  // ── 핵심 렌더 함수 (hashchange → 호출) ─────────────────────
  async render(pageId, tabId) {
    const page = SITE.pages.find(p => p.id === pageId);
    if (!page) {
      window.location.hash = 'home';
      return;
    }

    const pageChanged = this.currentPage !== pageId;
    this.currentPage = pageId;

    // nav 활성화
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('on'));
    const navLink = document.getElementById(`nav-${pageId}`);
    if (navLink) navLink.classList.add('on');

    const main = document.getElementById('main-root');

    if (pageChanged) {
      window.scrollTo({ top: 0 });
      main.innerHTML = '<div style="padding:4rem;text-align:center;color:var(--muted)">로딩 중...</div>';

      let html = '';
      if (page.type === 'home') {
        html = this.buildHomePage(page);
      } else if (page.type === 'simple') {
        html = await this.buildSimplePage(page);
      } else if (page.type === 'tabbed') {
        html = this.buildTabbedPage(page, tabId);
      }
      main.innerHTML = html;
    }

    if (page.type === 'tabbed') {
      const targetTabId = tabId || page.tabs[0].id;
      await this.activateTab(page, targetTabId);
      this.currentTab = targetTabId;

      if (pageChanged) {
        const mhero = document.querySelector('.mhero');
        this.tabsScrollTop = mhero ? mhero.offsetTop + mhero.offsetHeight - 64 : 0;
      }
      window.scrollTo({ top: this.tabsScrollTop });
    }

    if (page.type === 'simple') {
      setTimeout(() => mermaid.run({ nodes: main.querySelectorAll('.mermaid') }), 80);
    }
  },

  // ── 스크롤 탑 버튼 ─────────────────────────────────────────
  initScrollTop() {
    const btn = document.getElementById('scroll-top');
    window.addEventListener('scroll', () => {
      btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });
    btn.style.display = 'none';
  },

  // ── 앱 시작 ────────────────────────────────────────────────
  async init() {
    if (window.location.protocol === 'file:') {
      document.body.innerHTML = `
        <div style="max-width:560px;margin:6rem auto;padding:2rem;background:#1a2035;border:1px solid #f7931a;border-radius:12px;font-family:sans-serif;color:#e2e8f0">
          <div style="font-size:2rem;margin-bottom:1rem">⚠️</div>
          <h2 style="color:#f7931a;margin:0 0 1rem">HTTP 서버가 필요합니다</h2>
          <p style="color:#94a3b8">이 앱은 <code style="background:#0d1117;padding:2px 6px;border-radius:4px">file://</code> 프로토콜로는 동작하지 않습니다.<br>마크다운 파일을 불러오려면 HTTP 서버를 통해 접근해야 합니다.</p>
          <p style="margin-top:1.2rem;font-weight:bold">터미널에서 아래 명령을 실행하세요:</p>
          <pre style="background:#0d1117;padding:1rem;border-radius:8px;color:#10b981;font-size:1rem">npm start</pre>
          <p>그런 다음 브라우저에서 아래 주소를 여세요:</p>
          <a href="http://localhost:8080" style="color:#f7931a;font-size:1.1rem;font-weight:bold">http://localhost:8080</a>
        </div>`;
      return;
    }

    this.initMermaid();
    this.renderNav();
    this.initScrollTop();

    window.addEventListener('hashchange', async () => {
      const { pageId, tabId } = this.parseHash();
      await this.render(pageId, tabId);
    });

    // 현재 해시에서 초기 페이지 결정 (북마크/직접 URL 지원)
    const { pageId, tabId } = this.parseHash();
    await this.render(pageId, tabId);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
