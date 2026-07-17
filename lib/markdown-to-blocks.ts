import { WorkshopBlock, WorkshopBlockType } from './workshop-blocks';

function uid(type: string): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeBlock(type: WorkshopBlockType, content: string, attrs?: any): WorkshopBlock {
  return { id: uid(type), type, content, ...(attrs && { attrs }) };
}

/**
 * Parse markdown text into an array of WorkshopBlocks.
 *
 * Handles:
 *  - Headings (# ... ######)
 *  - Unordered lists (- or * or +)
 *  - Ordered lists (1. 2. etc)
 *  - Code blocks (``` ... ```)
 *  - Blockquotes (> ...)
 *  - Thematic breaks (---, ***, ___)
 *  - Images (![alt](url))
 *  - Links ([text](url)) → paragraph with link attr
 *  - Everything else → paragraph
 */
export function markdownToBlocks(md: string): WorkshopBlock[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks: WorkshopBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line → skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Code block (``` ... ```)
    const codeMatch = line.match(/^```(\w*)/);
    if (codeMatch) {
      const lang = codeMatch[1] || 'plain';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push(makeBlock('code', codeLines.join('\n'), { language: lang }));
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      blocks.push(makeBlock('heading', headingMatch[2].trim(), { level }));
      i++;
      continue;
    }

    // Thematic break
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      blocks.push(makeBlock('divider', ''));
      i++;
      continue;
    }

    // Blockquote (collect consecutive > lines)
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(makeBlock('quote', quoteLines.join('\n')));
      continue;
    }

    // Unordered list (- or * or +)
    if (/^[\-\*\+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[\-\*\+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[\-\*\+]\s+/, ''));
        i++;
      }
      blocks.push(makeBlock('list', items.join('\n'), { listType: 'unordered' }));
      continue;
    }

    // Ordered list (1. 2. etc)
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push(makeBlock('list', items.join('\n'), { listType: 'ordered' }));
      continue;
    }

    // Image (![alt](url))
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      blocks.push(makeBlock('image', '', { alt: imgMatch[1], src: imgMatch[2] }));
      i++;
      continue;
    }

    // Link on its own line ([text](url)) → paragraph with link
    const linkMatch = line.match(/^\[([^\]]+)\]\(([^)]+)\)\s*$/);
    if (linkMatch) {
      blocks.push(makeBlock('paragraph', linkMatch[1], { link: linkMatch[2] }));
      i++;
      continue;
    }

    // Everything else → paragraph (collect consecutive non-special lines)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (l.trim() === '') break;
      if (/^#{1,6}\s+/.test(l)) break;
      if (/^[\-\*\+]\s+/.test(l)) break;
      if (/^\d+\.\s+/.test(l)) break;
      if (/^```/.test(l.trim())) break;
      if (l.startsWith('>')) break;
      if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(l.trim())) break;
      if (/^!\[([^\]]*)\]\(([^)]+)\)/.test(l)) break;
      paraLines.push(l);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(makeBlock('paragraph', paraLines.join('\n')));
    }
  }

  return blocks;
}
