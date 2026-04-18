/**
 * app.js — 라우팅, 페이지 렌더링, 이벤트 처리
 */
const App = {
  currentPage: null,
  currentTab:  null,
  cache: {},           // fetch 결과 캐시

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
        <a id="nav-${p.id}" href="#"
           onclick="App.navigate('${p.id}');return false">
          ${p.navLabel}
        </a>
      </li>`).join('');

    document.getElementById('nav-root').innerHTML = `
      <div class="logo" onclick="App.navigate('home')">${SITE.title}</div>
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

  // ── 탭 페이지(tabbed) 렌더링 ───────────────────────────────
  buildTabbedPage(page) {
    const { hero, tabs } = page;
    const statsHtml = hero.stats.map(s => `
      <div class="stat">
        <div class="v" style="font-size:${s.value.length > 4 ? '1.1rem' : '1.6rem'}">${s.value}</div>
        <div class="l">${s.label}</div>
      </div>`).join('');

    const tabBtns = tabs.map((t, i) =>
      `<button class="tab${i === 0 ? ' on' : ''}"
               onclick="App.switchTab('${page.id}','${t.id}',this)">${t.label}</button>`
    ).join('');

    const tabContents = tabs.map((t, i) =>
      `<div id="tc-${t.id}" class="tc${i === 0 ? ' on' : ''}">
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

  // ── 탭 전환 ────────────────────────────────────────────────
  async switchTab(pageId, tabId, btn) {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
    document.querySelectorAll('.tc').forEach(t => t.classList.remove('on'));
    btn.classList.add('on');
    const el = document.getElementById(`tc-${tabId}`);
    el.classList.add('on');

    const page = SITE.pages.find(p => p.id === pageId);
    const tab = page.tabs.find(t => t.id === tabId);
    await this.loadTabContent(tab);

    window.scrollTo({ top: this.tabsScrollTop || 0 });
  },

  // ── 페이지 이동 ────────────────────────────────────────────
  async navigate(pageId) {
    const page = SITE.pages.find(p => p.id === pageId);
    if (!page) return;

    this.currentPage = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // nav 활성화
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('on'));
    const navLink = document.getElementById(`nav-${pageId}`);
    if (navLink) navLink.classList.add('on');

    const main = document.getElementById('main-root');
    main.innerHTML = '<div style="padding:4rem;text-align:center;color:var(--muted)">로딩 중...</div>';

    let html = '';
    if (page.type === 'home') {
      html = this.buildHomePage(page);
    } else if (page.type === 'simple') {
      html = await this.buildSimplePage(page);
    } else if (page.type === 'tabbed') {
      html = this.buildTabbedPage(page);
    }

    main.innerHTML = html;

    // tabbed 페이지: 첫 번째 탭 자동 로드 후 탭 바 위치로 스크롤
    if (page.type === 'tabbed') {
      await this.loadTabContent(page.tabs[0]);
      const mhero = document.querySelector('.mhero');
      this.tabsScrollTop = mhero ? mhero.offsetTop + mhero.offsetHeight - 64 : 0;
      window.scrollTo({ top: this.tabsScrollTop });
    }

    // simple 페이지 mermaid 렌더
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
    this.initMermaid();
    this.renderNav();
    this.initScrollTop();
    await this.navigate('home');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
