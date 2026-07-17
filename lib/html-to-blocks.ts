import { WorkshopBlock, WorkshopBlockType } from './workshop-blocks';

function uid(type: string): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeBlock(type: WorkshopBlockType, content: string, attrs?: any): WorkshopBlock {
  return { id: uid(type), type, content, ...(attrs && { attrs }) };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, '')).trim();
}

function extractAttr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`));
  return match?.[1];
}

function extractContent(html: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : '';
}

function parsePromptBlocks(html: string): WorkshopBlock[] {
  const blocks: WorkshopBlock[] = [];

  // Split into individual top-level tags
  // Match opening tags that are at the start of a line (or after whitespace)
  const tagRegex = /<(heading|text|divider|callout|quote|list|toggle|table|quiz|image|youtube|file|code|columns|column)[^>]*>[\s\S]*?<\/\1>|<(divider|image|youtube|file)\s*\/?>/gi;

  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = (match[1] || match[2]).toLowerCase();

    switch (tagName) {
      case 'heading': {
        const level = parseInt(extractAttr(fullTag, 'level') || '2') as any;
        const align = extractAttr(fullTag, 'align') as any;
        const dir = extractAttr(fullTag, 'dir') as any;
        const content = stripTags(extractContent(html, 'heading'));
        blocks.push(makeBlock('heading', content, { level, align, dir }));
        break;
      }

      case 'text': {
        const align = extractAttr(fullTag, 'align') as any;
        const dir = extractAttr(fullTag, 'dir') as any;
        const link = extractAttr(fullTag, 'link');
        const content = stripTags(extractContent(html, 'text'));
        if (!content) break;
        const attrs: any = {};
        if (align) attrs.align = align;
        if (dir) attrs.dir = dir;
        if (link) attrs.link = link;
        blocks.push(makeBlock('paragraph', content, attrs));
        break;
      }

      case 'divider':
        blocks.push(makeBlock('divider', ''));
        break;

      case 'callout': {
        const align = extractAttr(fullTag, 'align') as any;
        const dir = extractAttr(fullTag, 'dir') as any;
        const content = stripTags(extractContent(html, 'callout'));
        blocks.push(makeBlock('callout', content, { align, dir }));
        break;
      }

      case 'quote': {
        const align = extractAttr(fullTag, 'align') as any;
        const dir = extractAttr(fullTag, 'dir') as any;
        const content = stripTags(extractContent(html, 'quote'));
        blocks.push(makeBlock('quote', content, { align, dir }));
        break;
      }

      case 'list': {
        const listType = extractAttr(fullTag, 'type') === 'ordered' ? 'ordered' : 'unordered';
        const align = extractAttr(fullTag, 'align') as any;
        const dir = extractAttr(fullTag, 'dir') as any;
        const inner = extractContent(html, 'list');
        const items = inner.split('\n')
          .map(l => l.trim().replace(/^[-•]\s+/, ''))
          .filter(Boolean);
        blocks.push(makeBlock('list', items.join('\n'), { listType, align, dir }));
        break;
      }

      case 'toggle': {
        const title = extractAttr(fullTag, 'title') || 'Untitled';
        const inner = extractContent(html, 'toggle');
        const innerBlocks = parsePromptBlocks(inner);
        if (innerBlocks.length === 0 && inner) {
          innerBlocks.push(makeBlock('paragraph', stripTags(inner)));
        }
        blocks.push(makeBlock('toggle', '', {
          items: [{ id: `item-${Date.now()}`, title, blocks: innerBlocks }],
        }));
        break;
      }

      case 'table': {
        const rows: string[][] = [];
        const rowRegex = /<row[^>]*>([\s\S]*?)<\/row>/gi;
        let rowMatch;
        while ((rowMatch = rowRegex.exec(fullTag)) !== null) {
          const cells: string[] = [];
          const cellRegex = /<cell[^>]*>([\s\S]*?)<\/cell>/gi;
          let cellMatch;
          while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
            cells.push(stripTags(cellMatch[1]));
          }
          if (cells.length > 0) rows.push(cells);
        }
        if (rows.length > 0) blocks.push(makeBlock('table', '', { rows }));
        break;
      }

      case 'quiz': {
        const question = extractAttr(fullTag, 'question') || '';
        const correctStr = extractAttr(fullTag, 'correct');
        const correctAnswer = correctStr !== undefined ? parseInt(correctStr) : undefined;
        const options: string[] = [];
        const optRegex = /<option[^>]*>([\s\S]*?)<\/option>/gi;
        let optMatch;
        while ((optMatch = optRegex.exec(fullTag)) !== null) {
          options.push(stripTags(optMatch[1]));
        }
        blocks.push(makeBlock('quiz', question, { question, options, correctAnswer }));
        break;
      }

      case 'image': {
        blocks.push(makeBlock('image', '', {
          src: extractAttr(fullTag, 'src') || '',
          alt: extractAttr(fullTag, 'alt') || '',
          caption: extractAttr(fullTag, 'caption'),
          fit: extractAttr(fullTag, 'fit'),
        }));
        break;
      }

      case 'youtube': {
        const url = extractAttr(fullTag, 'url') || '';
        blocks.push(makeBlock('youtube', url));
        break;
      }

      case 'file': {
        blocks.push(makeBlock('file', '', {
          fileName: extractAttr(fullTag, 'name') || 'file',
          src: extractAttr(fullTag, 'url') || '',
        }));
        break;
      }

      case 'code': {
        const language = extractAttr(fullTag, 'language') || '';
        const content = extractContent(html, 'code');
        blocks.push(makeBlock('code', decodeHtmlEntities(content.trim()), { language }));
        break;
      }

      case 'columns': {
        const colRegex = /<column[^>]*>([\s\S]*?)<\/column>/gi;
        const columns: WorkshopBlock[][] = [];
        const widths: number[] = [];
        let colMatch;
        while ((colMatch = colRegex.exec(fullTag)) !== null) {
          const colInner = colMatch[1];
          const width = parseInt(extractAttr(colMatch[0], 'width') || '6');
          const colBlocks = parsePromptBlocks(colInner);
          columns.push(colBlocks);
          widths.push(width);
        }
        if (columns.length > 0) {
          blocks.push(makeBlock('columns', '', { columns, widths }));
        }
        break;
      }
    }
  }

  return blocks;
}

// === Standard HTML parser (for real HTML from web pages) ===

function extractDirAndAlign(el: Element): { dir?: string; align?: string } {
  const dir = el.getAttribute('dir') || undefined;
  const align = el.getAttribute('align')
    || (el as HTMLElement).style?.textAlign
    || undefined;
  return { dir, align };
}

function parseHtmlBlock(el: Element): WorkshopBlock | null {
  const tag = el.tagName.toLowerCase();

  if (/^h[1-6]$/.test(tag)) {
    const level = parseInt(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6;
    const { dir, align } = extractDirAndAlign(el);
    return makeBlock('heading', (el.textContent || '').trim(), { level, dir, align });
  }

  if (tag === 'p') {
    const text = (el.textContent || '').trim();
    if (!text) return null;
    const { dir, align } = extractDirAndAlign(el);
    const a = el.querySelector('a');
    if (a) return makeBlock('paragraph', (a.textContent || '').trim(), { link: a.getAttribute('href') || '', dir, align });
    return makeBlock('paragraph', text, { dir, align });
  }

  if (tag === 'blockquote') {
    const { dir, align } = extractDirAndAlign(el);
    return makeBlock('quote', ((el.querySelector('p') || el).textContent || '').trim(), { dir, align });
  }

  if (tag === 'ul' || tag === 'ol') {
    const items: string[] = [];
    el.querySelectorAll(':scope > li').forEach(li => items.push((li.textContent || '').trim()));
    const { dir, align } = extractDirAndAlign(el);
    return makeBlock('list', items.join('\n'), { listType: tag === 'ol' ? 'ordered' : 'unordered', dir, align });
  }

  if (tag === 'pre') {
    const code = el.querySelector('code');
    return makeBlock('code', (code?.textContent || el.textContent || '').trim(), { language: code?.className?.replace('language-', '') || '' });
  }

  if (tag === 'img') {
    return makeBlock('image', '', { src: el.getAttribute('src') || '', alt: el.getAttribute('alt') || '' });
  }

  if (tag === 'hr') return makeBlock('divider', '');

  if (tag === 'table') {
    const rows: string[][] = [];
    el.querySelectorAll('tr').forEach(tr => {
      const cells: string[] = [];
      tr.querySelectorAll('td, th').forEach(cell => cells.push((cell.textContent || '').trim()));
      if (cells.length > 0) rows.push(cells);
    });
    if (rows.length > 0) return makeBlock('table', '', { rows });
  }

  if (tag === 'details' || tag === 'aside') {
    const { dir, align } = extractDirAndAlign(el);
    const innerText = (el.textContent || '').trim();
    if (innerText) return makeBlock('paragraph', innerText, { dir, align });
  }

  const text = (el.textContent || '').trim();
  if (text) {
    const { dir, align } = extractDirAndAlign(el);
    return makeBlock('paragraph', text, { dir, align });
  }
  return null;
}

function parseStandardHtml(html: string): WorkshopBlock[] {
  const blocks: WorkshopBlock[] = [];
  const container = document.createElement('div');
  container.innerHTML = html;

  function walk(parent: Element) {
    Array.from(parent.children).forEach(el => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'div' || tag === 'section' || tag === 'article') {
        walk(el);
        return;
      }
      const block = parseHtmlBlock(el);
      if (block) blocks.push(block);
    });
  }

  walk(container);
  return blocks;
}

// === Main export ===

export function htmlToBlocks(html: string): WorkshopBlock[] {
  // Detect if it's prompt format or standard HTML
  const isPrompt = /<(heading|text|callout|toggle|quiz|list)[\s>]/i.test(html);

  if (isPrompt) {
    return parsePromptBlocks(html);
  }
  return parseStandardHtml(html);
}
