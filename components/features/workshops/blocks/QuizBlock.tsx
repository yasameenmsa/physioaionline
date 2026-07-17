'use client';

import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockComponentProps {
  block: { id: string; type: string; content: string; attrs?: any };
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: string, attrs?: any) => void;
  onDelete: () => void;
  onAddAfter: (type: string) => void;
}

export function QuizBlock({ block, isSelected, onSelect, onUpdate }: BlockComponentProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const question = block.attrs?.question || block.content || '';
  const options = block.attrs?.options || ['Option A', 'Option B', 'Option C', 'Option D'];
  const correctAnswer = block.attrs?.correctAnswer;
  const explanation = block.attrs?.explanation || '';

  return (
    <div className={cn('p-2 rounded', isSelected && 'bg-muted/30')} onClick={onSelect}>
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-2">
          <span className="text-lg">❓</span>
          <input
            type="text"
            value={question}
            onChange={(e) => onUpdate(e.target.value, { ...block.attrs, question: e.target.value })}
            placeholder="Quiz question..."
            className="flex-1 bg-transparent border-0 outline-none text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="space-y-2 pl-7">
          {options.map((opt: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAnswer(i);
                  onUpdate(block.content, { ...block.attrs, correctAnswer: i });
                }}
              >
                {selectedAnswer === i ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[i] = e.target.value;
                  onUpdate(block.content, { ...block.attrs, options: newOptions });
                }}
                className="flex-1 bg-transparent border-0 outline-none text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </div>
        <div className="pl-7">
          <input
            type="text"
            value={explanation}
            onChange={(e) => onUpdate(block.content, { ...block.attrs, explanation: e.target.value })}
            placeholder="Explanation (shown after answering)..."
            className="w-full bg-muted/50 border-0 outline-none text-xs text-muted-foreground rounded px-2 py-1.5"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <p className="text-xs text-muted-foreground pl-7">
          Click the circle next to the correct answer
        </p>
      </div>
    </div>
  );
}
