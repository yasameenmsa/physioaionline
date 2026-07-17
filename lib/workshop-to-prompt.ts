import type { WorkshopBlock } from './workshop-blocks';

function blockToPrompt(block: WorkshopBlock, depth = 0): string {
  const indent = '  '.repeat(depth);

  switch (block.type) {
    case 'heading': {
      const level = block.attrs?.level || 2;
      const align = block.attrs?.align ? ` align="${block.attrs.align}"` : '';
      const dir = block.attrs?.dir ? ` dir="${block.attrs.dir}"` : '';
      return `${indent}<heading level="${level}"${align}${dir}>${block.content}</heading>`;
    }

    case 'paragraph': {
      const align = block.attrs?.align ? ` align="${block.attrs.align}"` : '';
      const dir = block.attrs?.dir ? ` dir="${block.attrs.dir}"` : '';
      const link = block.attrs?.link ? ` link="${block.attrs.link}"` : '';
      return `${indent}<text${align}${dir}${link}>${block.content}</text>`;
    }

    case 'image': {
      const src = block.attrs?.src || '';
      const alt = block.attrs?.alt || '';
      const caption = block.attrs?.caption ? ` caption="${block.attrs.caption}"` : '';
      const fit = block.attrs?.fit ? ` fit="${block.attrs.fit}"` : '';
      const posX = block.attrs?.posX ? ` posX="${block.attrs.posX}"` : '';
      const posY = block.attrs?.posY ? ` posY="${block.attrs.posY}"` : '';
      return `${indent}<image src="${src}" alt="${alt}"${caption}${fit}${posX}${posY} />`;
    }

    case 'youtube': {
      return `${indent}<youtube url="${block.content}" />`;
    }

    case 'quote': {
      const align = block.attrs?.align ? ` align="${block.attrs.align}"` : '';
      const dir = block.attrs?.dir ? ` dir="${block.attrs.dir}"` : '';
      return `${indent}<quote${align}${dir}>\n${indent}  ${block.content}\n${indent}</quote>`;
    }

    case 'code': {
      const lang = block.attrs?.language || '';
      return `${indent}<code language="${lang}">\n${indent}  ${block.content}\n${indent}</code>`;
    }

    case 'list': {
      const listType = block.attrs?.listType || 'unordered';
      const align = block.attrs?.align ? ` align="${block.attrs.align}"` : '';
      const dir = block.attrs?.dir ? ` dir="${block.attrs.dir}"` : '';
      const items = block.content.split('\n').filter(Boolean);
      const itemsStr = items.map(item => `${indent}  - ${item}`).join('\n');
      return `${indent}<list type="${listType}"${align}${dir}>\n${itemsStr}\n${indent}</list>`;
    }

    case 'divider':
      return `${indent}<divider />`;

    case 'callout': {
      const align = block.attrs?.align ? ` align="${block.attrs.align}"` : '';
      const dir = block.attrs?.dir ? ` dir="${block.attrs.dir}"` : '';
      return `${indent}<callout${align}${dir}>\n${indent}  ${block.content}\n${indent}</callout>`;
    }

    case 'toggle': {
      const items = block.attrs?.items || [];
      return items.map((item: any) => {
        let md = `${indent}<toggle title="${item.title || 'Untitled'}">\n`;
        if (item.blocks?.length > 0) {
          md += item.blocks.map((b: WorkshopBlock) => blockToPrompt(b, depth + 2)).join('\n') + '\n';
        } else if (item.content) {
          md += `${indent}  ${item.content}\n`;
        }
        md += `${indent}</toggle>`;
        return md;
      }).join('\n');
    }

    case 'columns': {
      const cols: WorkshopBlock[][] = block.attrs?.columns || [];
      const widths = block.attrs?.widths || [];
      return cols.map((col, ci) => {
        const w = widths[ci] ? ` width="${widths[ci]}"` : '';
        const blocks = col.map((b) => blockToPrompt(b, depth + 2)).join('\n');
        return `${indent}<column${w}>\n${blocks}\n${indent}</column>`;
      }).join('\n');
    }

    case 'table': {
      const rows: string[][] = block.attrs?.rows || [];
      return `${indent}<table>\n${rows.map(row =>
        `${indent}  <row>${row.map(cell => `<cell>${cell}</cell>`).join('')}</row>`
      ).join('\n')}\n${indent}</table>`;
    }

    case 'file': {
      const name = block.attrs?.fileName || 'file';
      const src = block.attrs?.src || '';
      return `${indent}<file name="${name}" url="${src}" />`;
    }

    case 'quiz': {
      const options = block.attrs?.options || [];
      const correct = block.attrs?.correctAnswer;
      const question = block.attrs?.question || block.content;
      return `${indent}<quiz question="${question}" correct="${correct ?? ''}">\n${options.map((opt: string, i: number) =>
        `${indent}  <option>${opt}</option>`
      ).join('\n')}\n${indent}</quiz>`;
    }

    default:
      return `${indent}<text>${block.content}</text>`;
  }
}

export function workshopToPrompt(workshop: any): string {
  let prompt = `# Workshop: ${workshop.title}\n`;
  prompt += `# Language: ${workshop.language === 'ar' ? 'Arabic (RTL)' : 'English (LTR)'}\n`;
  if (workshop.level) prompt += `# Level: ${workshop.level}\n`;
  if (workshop.category) prompt += `# Category: ${workshop.category}\n`;
  prompt += `\nGenerate a workshop page with the following structure:\n\n`;

  prompt += `## Metadata\n`;
  prompt += `- Title: ${workshop.title}\n`;
  if (workshop.description) prompt += `- Description: ${workshop.description}\n`;
  if (workshop.language) prompt += `- Language: ${workshop.language}\n`;
  if (workshop.level) prompt += `- Level: ${workshop.level}\n`;

  if (workshop.whatYouLearn?.length > 0) {
    prompt += `\n## What You'll Learn\n`;
    workshop.whatYouLearn.forEach((item: string) => {
      prompt += `- ${item}\n`;
    });
  }

  if (workshop.requirements?.length > 0) {
    prompt += `\n## Requirements\n`;
    workshop.requirements.forEach((item: string) => {
      prompt += `- ${item}\n`;
    });
  }

  prompt += `\n---\n\n`;
  prompt += `## Content Structure\n\n`;

  for (const section of workshop.sections || []) {
    prompt += `### Section: ${section.title || 'Untitled'}\n\n`;

    for (const lesson of section.lessons || []) {
      prompt += `#### Lesson: ${lesson.title || 'Untitled'}\n\n`;

      if (lesson.blocks?.length > 0) {
        prompt += lesson.blocks.map((b: WorkshopBlock) => blockToPrompt(b)).join('\n\n');
        prompt += '\n\n';
      }

      if (lesson.children?.length > 0) {
        for (const child of lesson.children) {
          prompt += `##### ${child.title || 'Untitled Sub-lesson'}\n\n`;
          if (child.blocks?.length > 0) {
            prompt += child.blocks.map((b: WorkshopBlock) => blockToPrompt(b, 2)).join('\n\n');
            prompt += '\n\n';
          }
        }
      }
    }
  }

  prompt += `\n---\n\n`;
  prompt += `## Block Types Reference\n`;
  prompt += `- <heading level="1-6" align="left|center|right" dir="ltr|rtl">Title</heading>\n`;
  prompt += `- <text align="left|center|right" dir="ltr|rtl" link="url">Content</text>\n`;
  prompt += `- <image src="url" alt="text" caption="text" fit="cover|contain|full" />\n`;
  prompt += `- <youtube url="youtube-url" />\n`;
  prompt += `- <quote align="left|center|right" dir="ltr|rtl">Text</quote>\n`;
  prompt += `- <code language="javascript">code</code>\n`;
  prompt += `- <list type="ordered|unordered" align="left|center|right" dir="ltr|rtl">\\n  - item\\n</list>\n`;
  prompt += `- <divider />\n`;
  prompt += `- <callout align="left|center|right" dir="ltr|rtl">Text</callout>\n`;
  prompt += `- <toggle title="Title">blocks...</toggle>\n`;
  prompt += `- <column width="6">blocks...</column>\n`;
  prompt += `- <table><row><cell>Data</cell></row></table>\n`;
  prompt += `- <file name="name" url="url" />\n`;
  prompt += `- <quiz question="Q?" correct="0"><option>A</option></quiz>\n`;

  return prompt;
}

export function copyPromptToClipboard(content: string): Promise<void> {
  return navigator.clipboard.writeText(content);
}
