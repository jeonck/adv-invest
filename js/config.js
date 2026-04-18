/**
 * config.js — 사이트 구조 정의
 * 네비게이션, 페이지, 탭, 히어로 데이터를 관리합니다.
 * 메뉴 추가/수정은 SITE.pages 배열을 편집하세요.
 */
const SITE = {
  title: '📈 최고의 투자',

  pages: [
    {
      id: 'home',
      navLabel: '홈',
      type: 'home',                    // 전용 홈 레이아웃
      hero: {
        title: '최고의 투자를 위한\n핵심 인사이트',
        subtitle: '복잡한 투자 원리를 초보자도 알기 쉽게. 검증된 전략으로 자산을 불려나가세요.',
        buttons: [
          { label: '🟠 MSTR 전략 알아보기', page: 'mstr', style: 'primary' },
          { label: '📊 일등주식투자법',       page: 'method', style: 'secondary' }
        ]
      },
      cards: [
        {
          icon: '🟠', title: 'MSTR (마이크로스트래티지)', page: 'mstr',
          desc: '비트코인을 레버리지로 극대화하는 마이클 세일러의 혁신 전략. STRC 발행부터 플라이휠 효과까지 쉽게 이해하세요.',
          badges: [{ label: '비트코인', style: 'gold' }, { label: '레버리지', style: 'blue' }, { label: 'STRC', style: 'gold' }]
        },
        {
          icon: '📊', title: '일등주식투자법', page: 'method',
          desc: '시장을 이기는 검증된 가치 투자 방법론. 일등 기업을 선별하고 장기 보유하는 핵심 전략을 소개합니다.',
          badges: [{ label: '가치투자', style: 'green' }, { label: '장기투자', style: 'blue' }, { label: '분산투자', style: 'green' }]
        },
        {
          icon: '🌐', title: '거시경제 분석',
          desc: '금리·환율·인플레이션이 시장에 미치는 영향을 이해하고 경제 사이클에 맞는 전략을 수립하세요.',
          badges: [{ label: '거시경제', style: 'blue' }, { label: '금리', style: 'gold' }, { label: '환율', style: 'green' }]
        }
      ],
      featureStats: [
        { value: '📖', label: '쉬운 설명' },
        { value: '📊', label: '시각적 다이어그램' },
        { value: '🎯', label: '핵심 전략' },
        { value: '🔄', label: '최신 업데이트' }
      ]
    },

    {
      id: 'mstr',
      navLabel: 'MSTR',
      type: 'tabbed',
      hero: {
        icon: '🟠',
        title: 'MSTR',
        subtitle: '마이크로스트래티지(MicroStrategy) — 비트코인 레버리지 투자 전략',
        stats: [
          { value: '🟠 BTC',  label: '비트코인 최대 보유 상장사' },
          { value: '3~4x',    label: 'BTC 대비 주가 증폭 배율' },
          { value: '11.5%',   label: 'STRC 배당 수익률' },
          { value: '2.5년',   label: '배당금 선적립 기간' },
          { value: '74.3%',   label: 'BTC Yield (2024년)' }
        ]
      },
      tabs: [
        { id: 't0', label: '📌 개요',        content: 'content/mstr/0-overview.md' },
        { id: 't1', label: '💰 STRC 원리',   content: 'content/mstr/1-strc.md' },
        { id: 't2', label: '📈 레버리지 효과', content: 'content/mstr/2-leverage.md' },
        { id: 't3', label: '🏦 금리인하 효과', content: 'content/mstr/3-interest-rate.md' },
        { id: 't4', label: '🔄 플라이휠',     content: 'content/mstr/4-flywheel.md' },
        { id: 't5', label: '⭐ 프리미엄',     content: 'content/mstr/5-premium.md' },
        { id: 't6', label: '🔢 희석 vs 성장', content: 'content/mstr/6-dilution.md' },
        { id: 't7', label: '⚠️ 리스크',      content: 'content/mstr/7-risk.md' }
      ]
    },

    {
      id: 'method',
      navLabel: '일등주식투자법',
      type: 'tabbed',
      hero: {
        icon: '📊',
        title: '일등주식투자법',
        subtitle: '조던(김장섭)의 규칙 기반 투자 전략',
        stats: [
          { value: '-3%',  label: '나스닥 공황 신호' },
          { value: '10%',  label: '2등주 추격 범위' },
          { value: '30일', label: '매수 대기 기간' },
          { value: '1위',  label: '세계 시총 기준' }
        ]
      },
      tabs: [
        { id: 't0', label: '📌 개요',        content: 'content/method/0-overview.md' },
        { id: 't1', label: '🏆 일등주 원칙',   content: 'content/method/1-stock.md' },
        { id: 't2', label: '📉 -3% 법칙',    content: 'content/method/2-rule.md' },
        { id: 't3', label: '⚖️ 말뚝 박기',    content: 'content/method/3-rebalancing.md' },
        { id: 't4', label: '🔄 분할 대응',    content: 'content/method/4-updated.md' }
      ]
    }
  ]
};
