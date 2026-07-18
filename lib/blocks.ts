export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'youtube'
  | 'quote'
  | 'code'
  | 'list'
  | 'divider'
  | 'columns'
  | 'callout'
  | 'toggle'
  | 'table'
  | 'file'
  | 'quiz';

export interface BlockAttrs {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  align?: 'left' | 'center' | 'right';
  style?: 'normal' | 'muted' | 'highlight' | 'info' | 'warning' | 'success';
  language?: string;
  listType?: 'ordered' | 'unordered';
  caption?: string;
  url?: string;
  alt?: string;
  dir?: 'ltr' | 'rtl';
  link?: string;
  src?: string;
  fileName?: string;
  fileSize?: string;
  fit?: string;
  posX?: number;
  posY?: number;
  explanation?: string;
  columns?: Block[];
  widths?: number[];
  items?: Block[];
  rows?: { cells: string[] }[];
  options?: string[];
  correctAnswer?: number;
  question?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  attrs?: BlockAttrs;
  children?: Block[];
}

export const blockLabels: Record<BlockType, string> = {
  heading: 'Heading',
  paragraph: 'Paragraph',
  image: 'Image',
  youtube: 'YouTube Video',
  quote: 'Quote',
  code: 'Code',
  list: 'List',
  divider: 'Divider',
  columns: 'Columns',
  callout: 'Callout',
  toggle: 'Toggle',
  table: 'Table',
  file: 'File',
  quiz: 'Quiz',
};

export const blockIcons: Record<BlockType, string> = {
  heading: 'H',
  paragraph: 'P',
  image: '🖼',
  youtube: '▶',
  quote: '"',
  code: '</>',
  list: '≡',
  divider: '—',
  columns: '⫼',
  callout: '💬',
  toggle: '▶',
  table: '▦',
  file: '📎',
  quiz: '❓',
};

export function createBlock(type: BlockType, content = '', attrs?: BlockAttrs): Block {
  const block: Block = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    content,
    attrs,
  };

  if (type === 'columns') {
    block.attrs = { widths: [50, 50], ...attrs };
    block.children = [
      { id: `column-${Date.now()}-0`, type: 'paragraph', content: '', children: [createBlock('paragraph')] },
      { id: `column-${Date.now()}-1`, type: 'paragraph', content: '', children: [createBlock('paragraph')] },
    ];
  } else if (type === 'toggle') {
    block.children = [createBlock('paragraph')];
  } else if (type === 'callout') {
    block.attrs = { style: 'info', ...attrs };
  } else if (type === 'table') {
    block.attrs = { rows: [{ cells: ['', ''] }, { cells: ['', ''] }], ...attrs };
  } else if (type === 'quiz') {
    block.attrs = { options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'], correctAnswer: 0, ...attrs };
  }

  return block;
}

export function workshopBlockToBlock(wb: any): Block {
  const block: Block = {
    id: wb.id || `${wb.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: wb.type as BlockType,
    content: wb.content || '',
    attrs: wb.attrs ? { ...wb.attrs } : undefined,
  };

  if (wb.attrs?.columns && Array.isArray(wb.attrs.columns)) {
    block.attrs = {
      ...block.attrs,
      columns: wb.attrs.columns.map((col: any[]) =>
        Array.isArray(col) ? col.map(workshopBlockToBlock) : []
      ),
    };
  }

  if (wb.attrs?.rows && Array.isArray(wb.attrs.rows)) {
    if (Array.isArray(wb.attrs.rows[0])) {
      block.attrs = {
        ...block.attrs,
        rows: wb.attrs.rows.map((row: string[]) => ({ cells: row })),
      };
    }
  }

  if (wb.children && Array.isArray(wb.children)) {
    block.children = wb.children.map(workshopBlockToBlock);
  }

  return block;
}

export function blocksFromMarkdown(md: string): Block[] {
  const { markdownToBlocks } = require('./markdown-to-blocks') as typeof import('./markdown-to-blocks');
  return markdownToBlocks(md).map(workshopBlockToBlock);
}

export function blocksFromHtml(html: string): Block[] {
  const { htmlToBlocks } = require('./html-to-blocks') as typeof import('./html-to-blocks');
  return htmlToBlocks(html).map(workshopBlockToBlock);
}

export function generateBodyFromBlocks(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'heading':
          return `${'#'.repeat(b.attrs?.level || 2)} ${b.content}`;
        case 'paragraph':
          return b.content;
        case 'quote':
          return `> ${b.content}`;
        case 'code':
          return '```' + (b.attrs?.language || '') + '\n' + b.content + '\n```';
        case 'list':
          return b.content
            .split('\n')
            .filter(Boolean)
            .map((line) => (b.attrs?.listType === 'ordered' ? `1. ${line}` : `- ${line}`))
            .join('\n');
        case 'divider':
          return '---';
        case 'callout':
          return `> 💬 **${b.content}**`;
        case 'toggle':
          return `<details>\n<summary>${b.content}</summary>\n\n${b.children ? generateBodyFromBlocks(b.children) : ''}\n</details>`;
        case 'columns':
          return b.children ? b.children.map((c) => c.content).join(' | ') : '';
        case 'table': {
          const rows = b.attrs?.rows || [];
          if (rows.length === 0) return '';
          const header = `| ${rows[0].cells.join(' | ')} |`;
          const divider = `| ${rows[0].cells.map(() => '---').join(' | ')} |`;
          const body = rows.slice(1).map((r) => `| ${r.cells.join(' | ')} |`).join('\n');
          return `${header}\n${divider}\n${body}`;
        }
        case 'file':
          return `[${b.attrs?.fileName || 'File'}](${b.content})`;
        case 'quiz':
          return `**Quiz:** ${b.content}\n${b.attrs?.options?.map((o, i) => `${i + 1}. ${o}`).join('\n') || ''}`;
        default:
          return b.content;
      }
    })
    .join('\n\n');
}
