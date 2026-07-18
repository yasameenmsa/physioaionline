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

function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4] && match[5]) {
      parts.push(
        <a key={key++} href={match[5]} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
          {match[4]}
        </a>
      );
    } else if (match[6]) {
      parts.push(<code key={key++} className="px-1 py-0.5 rounded bg-muted text-sm font-mono">{match[6]}</code>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
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
  const dir = block.attrs?.dir || 'ltr';
  switch (block.type) {
    case 'heading': {
      const level = block.attrs?.level || 2;
      const Tag = `h${level}` as React.ElementType;
      const sizes: Record<number, string> = {
        1: 'text-3xl font-bold mt-8 mb-4',
        2: 'text-2xl font-bold mt-6 mb-3',
        3: 'text-xl font-semibold mt-5 mb-2',
        4: 'text-lg font-semibold mt-4 mb-2',
        5: 'text-base font-semibold mt-3 mb-1',
        6: 'text-sm font-semibold mt-2 mb-1',
      };
      const align = block.attrs?.align === 'center' ? 'text-center' : block.attrs?.align === 'right' ? 'text-right' : '';
      return (
        <Tag className={cn(sizes[level] || 'text-sm font-semibold mt-2 mb-1', align)} dir={dir}>
          {block.attrs?.link ? (
            <a href={block.attrs.link} className="hover:underline">{block.content}</a>
          ) : block.content}
        </Tag>
      );
    }
    case 'paragraph': {
      const align = block.attrs?.align === 'center' ? 'text-center' : block.attrs?.align === 'right' ? 'text-right' : '';
      return (
        <p className={`mb-4 leading-relaxed ${align} ${styleClasses(block.attrs)}`} dir={dir}>
          {block.attrs?.link ? (
            <a href={block.attrs.link} className="text-primary underline hover:no-underline">
              {block.content ? renderInlineMarkdown(block.content) : ''}
            </a>
          ) : block.content ? (
            renderInlineMarkdown(block.content)
          ) : ''}
        </p>
      );
    }
    case 'image': {
      const fitClass = block.attrs?.fit === 'contain' ? 'object-contain' : block.attrs?.fit === 'fill' ? 'object-fill' : block.attrs?.fit === 'none' ? 'object-none' : 'object-cover';
      return (
        <figure className="my-6 space-y-2">
          <div className="rounded-lg overflow-hidden">
            <SafeImage src={block.content} alt={block.attrs?.alt || 'Article image'} className={`rounded-lg w-full max-w-full ${fitClass}`} />
          </div>
          {block.attrs?.caption && <figcaption className="text-center text-sm text-muted-foreground">{block.attrs.caption}</figcaption>}
        </figure>
      );
    }
    case 'youtube':
      return (
        <div className="my-6 space-y-1">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <iframe src={getYoutubeEmbedUrl(block.content)} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          </div>
          {block.attrs?.caption && <p className="text-center text-sm text-muted-foreground">{block.attrs.caption}</p>}
        </div>
      );
    case 'quote': {
      const align = block.attrs?.align === 'center' ? 'text-center' : block.attrs?.align === 'right' ? 'text-right' : '';
      return (
        <blockquote className={`my-6 pl-6 border-l-4 border-primary/40 italic text-muted-foreground ${align}`} dir={dir}>
          <p>{block.content}</p>
        </blockquote>
      );
    }
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
        <ListTag className={`my-4 space-y-1 ${block.attrs?.listType === 'ordered' ? 'list-decimal' : 'list-disc'} pl-6`} dir={dir}>
          {items.map((item, i) => <li key={i}>{renderInlineMarkdown(item)}</li>)}
        </ListTag>
      );
    }
    case 'divider':
      return <hr className="my-8" />;
    case 'callout': {
      const calloutStyles: Record<string, string> = {
        info: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
        warning: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
        success: 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300',
        highlight: 'border-primary bg-primary/5',
        muted: 'border-muted-foreground/30 bg-muted/30 text-muted-foreground',
        normal: 'border-border bg-background',
      };
      const styleClass = calloutStyles[block.attrs?.style || 'info'] || calloutStyles.info;
      return (
        <div className={`my-4 rounded-lg border-l-4 px-4 py-3 ${styleClass}`} dir={dir}>
          <p className="font-medium">{renderInlineMarkdown(block.content)}</p>
          {block.attrs?.link && (
            <a href={block.attrs.link} className="text-sm underline mt-1 inline-block opacity-80 hover:opacity-100">Learn more →</a>
          )}
        </div>
      );
    }
    case 'toggle':
      return (
        <details className="my-4 rounded-lg border" dir={dir}>
          <summary className="cursor-pointer px-4 py-3 font-medium hover:bg-muted/50 transition-colors">
            {block.content || 'Toggle section'}
          </summary>
          <div className="px-4 pb-3">
            {block.children && block.children.length > 0 ? (
              block.children.map((child) => (
                <div key={child.id}>{renderBlock(child)}</div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No content yet</p>
            )}
          </div>
        </details>
      );
    case 'columns': {
      const widths = block.attrs?.widths || [50, 50];
      const cols = block.children || [];
      return (
        <div className="my-6 grid gap-4" style={{ gridTemplateColumns: widths.map((w) => `${w}%`).join(' ') }} dir={dir}>
          {cols.map((col, i) => (
            <div key={col.id} className="space-y-2">
              {col.children && col.children.length > 0 ? (
                col.children.map((child) => (
                  <div key={child.id}>{renderBlock(child)}</div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Empty column</p>
              )}
            </div>
          ))}
        </div>
      );
    }
    case 'table': {
      const rows = block.attrs?.rows || [];
      if (rows.length === 0) return <p className="text-muted-foreground text-sm my-4">Empty table</p>;
      return (
        <div className="my-6 overflow-x-auto" dir={dir}>
          <table className="w-full border-collapse border rounded-lg">
            <thead>
              <tr>
                {rows[0].cells.map((cell, i) => (
                  <th key={i} className="border bg-muted px-3 py-2 text-left font-medium text-sm">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri}>
                  {row.cells.map((cell, ci) => (
                    <td key={ci} className="border px-3 py-2 text-sm">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'file':
      return (
        <div className="my-4 flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
          <span className="text-2xl">📎</span>
          <div className="flex-1 min-w-0">
            <a href={block.content} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline truncate block">
              {block.attrs?.fileName || 'Download file'}
            </a>
            {block.attrs?.fileSize && <p className="text-xs text-muted-foreground">{block.attrs.fileSize}</p>}
          </div>
        </div>
      );
    case 'quiz':
      return (
        <div className="my-6 rounded-lg border p-4 space-y-3">
          <p className="font-medium">{block.content || 'Quiz question'}</p>
          <div className="space-y-2">
            {block.attrs?.options?.map((option, i) => (
              <label key={i} className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                block.attrs?.correctAnswer === i ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : 'hover:bg-muted/50'
              }`}>
                <input type="radio" name={`quiz-${block.id}`} className="accent-primary" disabled />
                <span className="text-sm">{option}</span>
                {block.attrs?.correctAnswer === i && <span className="ml-auto text-xs text-green-600 font-medium">Correct</span>}
              </label>
            ))}
          </div>
          {block.attrs?.explanation && (
            <p className="text-sm text-muted-foreground italic border-t pt-2">{block.attrs.explanation}</p>
          )}
        </div>
      );
    default:
      return null;
  }
}

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function ArticleBlocks({ blocks }: { blocks: Block[] }) {
  return <>{blocks.map((block) => <div key={block.id}>{renderBlock(block)}</div>)}</>;
}
