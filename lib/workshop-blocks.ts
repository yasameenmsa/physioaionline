export type WorkshopBlockType =
  | 'paragraph'
  | 'heading'
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

export interface ToggleItem {
  id: string;
  title: string;
  blocks: WorkshopBlock[];
}

export interface WorkshopBlockAttrs {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  align?: 'left' | 'center' | 'right';
  dir?: 'ltr' | 'rtl';
  link?: string;
  style?: 'normal' | 'muted' | 'highlight' | 'info' | 'warning';
  language?: string;
  listType?: 'ordered' | 'unordered';
  caption?: string;
  src?: string;
  alt?: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
  fit?: 'cover' | 'contain' | 'full';
  posX?: number;
  posY?: number;
  explanation?: string;
  columns?: WorkshopBlock[][];
  widths?: number[];
  items?: ToggleItem[];
  options?: string[];
  correctAnswer?: number;
  question?: string;
  rows?: string[][];
}

export interface WorkshopBlock {
  id: string;
  type: WorkshopBlockType;
  content: string;
  attrs?: WorkshopBlockAttrs;
  children?: WorkshopBlock[];
}

export const workshopBlockLabels: Record<WorkshopBlockType, string> = {
  paragraph: 'Text',
  heading: 'Heading',
  image: 'Image',
  youtube: 'YouTube',
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

export const workshopBlockIcons: Record<WorkshopBlockType, string> = {
  paragraph: 'T',
  heading: 'H',
  image: '🖼',
  youtube: '▶',
  quote: '"',
  code: '</>',
  list: '≡',
  divider: '—',
  columns: '⫿',
  callout: '💡',
  toggle: '▸',
  table: '⊞',
  file: '📎',
  quiz: '❓',
};

export const workshopBlockCategories = {
  basic: ['paragraph', 'heading', 'divider'] as WorkshopBlockType[],
  media: ['image', 'youtube', 'file'] as WorkshopBlockType[],
  advanced: ['quote', 'code', 'list', 'columns', 'callout', 'toggle', 'table', 'quiz'] as WorkshopBlockType[],
};

export function createWorkshopBlock(
  type: WorkshopBlockType,
  content = '',
  attrs?: WorkshopBlockAttrs,
  language?: 'ar' | 'en'
): WorkshopBlock {
  const isRtl = language === 'ar';

  const defaults: WorkshopBlockAttrs | undefined =
    type === 'columns'
      ? { columns: [[], []], widths: [6, 6] }
      : type === 'toggle'
        ? { items: [{ id: `item-${Date.now()}`, title: '', blocks: [] }] }
        : type === 'table'
          ? { rows: [['', ''], ['', '']] }
          : { dir: isRtl ? 'rtl' : 'ltr', align: isRtl ? 'right' : 'left' };

  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    content,
    attrs: { ...defaults, ...attrs },
  };
}

export function getEmptyBlock(): WorkshopBlock {
  return createWorkshopBlock('paragraph', '');
}

export function isTextBlock(type: WorkshopBlockType): boolean {
  return ['paragraph', 'heading', 'quote', 'callout', 'list'].includes(type);
}
