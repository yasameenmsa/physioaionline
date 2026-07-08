export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'youtube'
  | 'quote'
  | 'code'
  | 'list'
  | 'divider';

export interface BlockAttrs {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  align?: 'left' | 'center' | 'right';
  style?: 'normal' | 'muted' | 'highlight' | 'info' | 'warning';
  language?: string;
  listType?: 'ordered' | 'unordered';
  caption?: string;
  url?: string;
  alt?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  attrs?: BlockAttrs;
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
};

export function createBlock(type: BlockType, content = '', attrs?: BlockAttrs): Block {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    content,
    attrs,
  };
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
            .map((line) => (b.attrs?.listType === 'ordered' ? `1. ${line}` : `- ${line}`))
            .join('\n');
        case 'divider':
          return '---';
        default:
          return b.content;
      }
    })
    .join('\n\n');
}
