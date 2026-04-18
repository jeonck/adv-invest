/**
 * renderer.js — 커스텀 마크다운 렌더러
 *
 * 마크다운 파일에서 사용할 수 있는 커스텀 블록 문법:
 *
 *   ::: analogy 🧒 제목
 *   내용
 *   :::
 *
 *   ::: key        (초록 강조 박스)
 *   ::: info       (파란 정보 박스)
 *   ::: warning    (빨간 경고 박스)
 *   ::: formula 제목  (공식 박스)
 *
 *   ::: steps
 *   1. **제목** — 설명
 *   :::
 *
 *   ::: flywheel
 *   - 항목 {gold}
 *   - 일반 항목
 *   :::
 *
 *   ```mermaid
 *   flowchart ...
 *   ```
 */
const Renderer = {
  // 커스텀 블록 타입 → CSS 클래스 매핑
  BLOCK_CLASSES: {
    analogy: 'abox',
    key:     'kbox',
    info:    'ibox',
    warning: 'wbox',
  },

  /**
   * ::: type [title] … ::: 블록을 HTML로 변환
   * 중첩 블록은 지원하지 않으므로 two-col 등은 파일 내 HTML 직접 사용
   */
  parseCustomBlocks(md) {
    // formula 박스
    md = md.replace(
      /:::[ \t]*formula(?:[ \t]+(.+))?\n([\s\S]*?):::/gm,
      (_, title, body) => {
        const titleHtml = title ? `<div class="f-label">${title.trim()}</div>` : '';
        const lines = body.trim().split('\n').map(l => l.trim()).filter(Boolean);
        const inner = lines.map((l, i) =>
          i === 0
            ? `<div class="f-main">${l}</div>`
            : `<div class="f-sub">${l}</div>`
        ).join('');
        return `\n<div class="fbox">${titleHtml}${inner}</div>\n`;
      }
    );

    // steps 박스 — "1. **제목** — 설명" 패턴
    md = md.replace(
      /:::[ \t]*steps\n([\s\S]*?):::/gm,
      (_, body) => {
        const numbered = body.trim().split(/\n(?=\d+\.)/).map((item, idx) => {
          const lines = item.trim().split('\n');
          const header = lines[0].replace(/^\d+\.\s*/, '');
          const titleMatch = header.match(/^\*\*(.+?)\*\*(.*)$/);
          const title = titleMatch ? titleMatch[1] : header;
          const desc = [
            titleMatch ? titleMatch[2].replace(/^[ —-]+/, '').trim() : '',
            ...lines.slice(1).map(l => l.trim())
          ].filter(Boolean).join(' ');
          return `<div class="step">
  <div class="sn">${idx + 1}</div>
  <div class="sc"><h4>${title}</h4>${desc ? `<p>${desc}</p>` : ''}</div>
</div>`;
        });
        return `\n<div class="steps">${numbered.join('')}</div>\n`;
      }
    );

    // flywheel 박스
    md = md.replace(
      /:::[ \t]*flywheel\n([\s\S]*?):::/gm,
      (_, body) => {
        const items = body.trim().split('\n')
          .filter(l => l.trim().startsWith('-'))
          .map(l => {
            const text = l.replace(/^-\s*/, '').trim();
            const isGold = text.endsWith('{gold}');
            const label = text.replace(/\{gold\}$/, '').trim();
            return `<div class="fwi${isGold ? ' go' : ''}">${label}</div><div class="fwa">↓</div>`;
          });
        // 마지막 ↓ 제거
        const html = items.join('').replace(/<div class="fwa">↓<\/div>$/, '');
        return `\n<div class="fw">${html}</div>\n`;
      }
    );

    // 일반 박스 (analogy / key / info / warning)
    md = md.replace(
      /:::[ \t]*(\w+)(?:[ \t]+(.+))?\n([\s\S]*?):::/gm,
      (_, type, title, body) => {
        const cls = this.BLOCK_CLASSES[type] || type;
        const titleHtml = (type === 'analogy' && title)
          ? `<div class="lbl">${title.trim()}</div>` : '';
        const inner = marked.parse(body.trim());
        return `\n<div class="${cls}">${titleHtml}${inner}</div>\n`;
      }
    );

    return md;
  },

  /**
   * ```mermaid 블록을 <div class="mermaid"> 로 변환
   * marked.js 가 코드블록으로 처리하기 전에 선행 변환
   */
  parseMermaid(md) {
    return md.replace(
      /```mermaid\n([\s\S]*?)```/gm,
      (_, code) =>
        `\n<div class="dbox"><div class="mermaid">${code.trim()}</div></div>\n`
    );
  },

  /**
   * 마크다운 → HTML 변환 (커스텀 블록 포함)
   */
  render(md) {
    let processed = this.parseCustomBlocks(md);
    processed = this.parseMermaid(processed);
    return marked.parse(processed);
  }
};
