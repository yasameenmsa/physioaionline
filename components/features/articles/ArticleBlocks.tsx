import type { Block, BlockAttrs } from '@/lib/blocks';
import { SafeImage } from '@/components/ui/SafeImage';

function getYoutubeEmbedUrl(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

function styleClasses(attrs?: BlockAttrs): string {
  const classes: string[] = [];
  if (attrs?.align === 'center') classes.push('text-center');
  if (attrs?.align === 'right') classes.push('text-right');
  if (attrs?.style === 'muted') classes.push('text-muted-foreground italic');
  if (attrs?.style === 'highlight') classes.push('bg-primary/5 rounded-lg px-4 py-3');
  if (attrs?.style === 'info') classes.push('bg-blue-50 dark:bg-blue-950/30 rounded-lg px-4 py-3 text-blue-700 dark:text-blue-300');
  if (attrs?.style === 'warning') classes.push('bg-amber-50 dark:bg-amber-950/30 rounded-lg px-4 py-3 text-amber-700 dark:text-amber-300');
  return classes.join(' ');
}

function renderBlock(block: Block) {
  switch (block.type) {
    case 'heading': {
      const level = block.attrs?.level || 2;
      const Tag = `h${level}` as React.ElementType;
      const sizes: Record<number, string> = { 1: 'text-3xl font-bold mt-8 mb-4', 2: 'text-2xl font-bold mt-6 mb-3', 3: 'text-xl font-semibold mt-5 mb-2' };
      return <Tag className={sizes[level] || 'text-lg font-semibold mt-4 mb-2'}>{block.content}</Tag>;
    }
    case 'paragraph':
      return <p className={`mb-4 leading-relaxed ${styleClasses(block.attrs)}`}>{block.content}</p>;
    case 'image':
      return (
        <figure className="my-6 space-y-2">
          <SafeImage src={block.content} alt={block.attrs?.alt || 'Article image'} className="rounded-lg w-full max-w-full object-cover" />
          {block.attrs?.caption && <figcaption className="text-center text-sm text-muted-foreground">{block.attrs.caption}</figcaption>}
        </figure>
      );
    case 'youtube':
      return (
        <div className="my-6 aspect-video rounded-lg overflow-hidden bg-muted">
          <iframe src={getYoutubeEmbedUrl(block.content)} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      );
    case 'quote':
      return (
        <blockquote className="my-6 pl-6 border-l-4 border-primary/40 italic text-muted-foreground">
          <p>{block.content}</p>
        </blockquote>
      );
    case 'code':
      return (
        <pre className="my-6 rounded-lg bg-muted p-4 overflow-x-auto text-sm font-mono leading-relaxed">
          <code>{block.content}</code>
        </pre>
      );
    case 'list': {
      const items = block.content.split('\n').filter(Boolean);
      const ListTag = block.attrs?.listType === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag className={`my-4 space-y-1 ${block.attrs?.listType === 'ordered' ? 'list-decimal' : 'list-disc'} pl-6`}>
          {items.map((item, i) => <li key={i}>{item}</li>)}
        </ListTag>
      );
    }
    case 'divider':
      return <hr className="my-8" />;
    default:
      return null;
  }
}

export function ArticleBlocks({ blocks }: { blocks: Block[] }) {
  return <>{blocks.map((block) => <div key={block.id}>{renderBlock(block)}</div>)}</>;
}
