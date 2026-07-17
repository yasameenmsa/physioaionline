'use client';

import { cn } from '@/lib/utils';
import { TextFormatToolbar } from './TextFormatToolbar';
import { Plus, Trash2 } from 'lucide-react';

interface BlockComponentProps {
  block: { id: string; type: string; content: string; attrs?: any };
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: string, attrs?: any) => void;
  onDelete: () => void;
  onAddAfter: (type: string) => void;
}

export function TableBlock({ block, isSelected, onSelect, onUpdate }: BlockComponentProps) {
  const rows = block.attrs?.rows || [
    ['Header 1', 'Header 2', 'Header 3'],
    ['Cell 1', 'Cell 2', 'Cell 3'],
    ['Cell 4', 'Cell 5', 'Cell 6'],
  ];

  function updateCell(ri: number, ci: number, value: string) {
    const newRows = rows.map((r: string[]) => [...r]);
    newRows[ri][ci] = value;
    onUpdate(block.content, { ...block.attrs, rows: newRows });
  }

  function addRow() {
    const cols = rows[0]?.length || 3;
    const newRow = Array(cols).fill('');
    onUpdate(block.content, { ...block.attrs, rows: [...rows, newRow] });
  }

  function addColumn() {
    const newRows = rows.map((r: string[]) => [...r, '']);
    onUpdate(block.content, { ...block.attrs, rows: newRows });
  }

  function removeRow(ri: number) {
    if (rows.length <= 1) return;
    const newRows = rows.filter((_: string[], i: number) => i !== ri);
    onUpdate(block.content, { ...block.attrs, rows: newRows });
  }

  function removeColumn(ci: number) {
    if (rows[0]?.length <= 1) return;
    const newRows = rows.map((r: string[]) => r.filter((_: string, i: number) => i !== ci));
    onUpdate(block.content, { ...block.attrs, rows: newRows });
  }

  return (
    <div className={cn('p-2 rounded', isSelected && 'bg-muted/30')} onClick={onSelect}>
      {isSelected && (
        <div className="flex items-center gap-1 mb-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); addRow(); }}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/80"
          >
            <Plus className="h-3 w-3" /> Row
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); addColumn(); }}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/80"
          >
            <Plus className="h-3 w-3" /> Col
          </button>
          <TextFormatToolbar
            align={block.attrs?.align}
            dir={block.attrs?.dir}
            onUpdate={(attrs) => onUpdate(block.content, { ...block.attrs, ...attrs })}
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table
          className="w-full text-sm border-collapse"
          dir={block.attrs?.dir || 'ltr'}
          style={{ textAlign: block.attrs?.align || 'left' }}
        >
          <tbody>
            {rows.map((row: string[], ri: number) => (
              <tr key={ri}>
                {row.map((cell: string, ci: number) => (
                  <td
                    key={ci}
                    className={cn(
                      'border px-2 py-1 relative group/cell',
                      ri === 0 && 'font-medium bg-muted/50'
                    )}
                  >
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      dir={block.attrs?.dir || 'ltr'}
                      className="w-full bg-transparent border-0 outline-none text-sm p-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (rows.length > 1) removeRow(ri);
                          else removeColumn(ci);
                        }}
                        className="absolute -top-1 -right-1 p-0.5 rounded bg-destructive text-destructive-foreground opacity-0 group-hover/cell:opacity-100 transition-opacity"
                        title={rows.length > 1 ? 'Remove row' : 'Remove column'}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
