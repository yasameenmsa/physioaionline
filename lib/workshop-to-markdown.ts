import type { WorkshopBlock } from './workshop-blocks';

function blockToMarkdown(block: WorkshopBlock, depth = 0): string {
  const indent = '  '.repeat(depth);

  switch (block.type) {
    case 'heading': {
      const level = block.attrs?.level || 2;
      const prefix = '#'.repeat(level);
      return `${prefix} ${block.content}\n`;
    }

    case 'paragraph':
      return `${block.content}\n`;

    case 'image': {
      const alt = block.attrs?.alt || '';
      const src = block.attrs?.src || '';
      const caption = block.attrs?.caption;
      let md = `![${alt}](${src})`;
      if (caption) md += `\n*${caption}*`;
      return md + '\n';
    }

    case 'youtube': {
      const match = block.content?.match(/(?:v=|youtu\.be\/|embed\/)([^&?]+)/);
      const videoId = match?.[1];
      return videoId ? `[![YouTube](https://img.youtube.com/vi/${videoId}/0.jpg)](https://www.youtube.com/watch?v=${videoId})\n` : '';
    }

    case 'quote': {
      return block.content.split('\n').map(line => `> ${line}`).join('\n') + '\n';
    }

    case 'code': {
      const lang = block.attrs?.language || '';
      return `\`\`\`${lang}\n${block.content}\n\`\`\`\n`;
    }

    case 'list': {
      const items = block.content.split('\n').filter(Boolean);
      const ordered = block.attrs?.listType === 'ordered';
      return items.map((item, i) =>
        `${indent}${ordered ? `${i + 1}. ` : '- '}${item}`
      ).join('\n') + '\n';
    }

    case 'divider':
      return `---\n`;

    case 'callout':
      return block.content.split('\n').map(line => `> 💡 ${line}`).join('\n') + '\n';

    case 'toggle': {
      const items = block.attrs?.items || [];
      return items.map((item: any) => {
        let md = `<details>\n<summary>${item.title || 'Untitled'}</summary>\n\n`;
        if (item.blocks?.length > 0) {
          md += item.blocks.map((b: WorkshopBlock) => blockToMarkdown(b)).join('\n');
        } else if (item.content) {
          md += `${item.content}\n`;
        }
        md += `\n</details>\n`;
        return md;
      }).join('\n');
    }

    case 'columns': {
      const cols: WorkshopBlock[][] = block.attrs?.columns || [];
      return cols.map((col) =>
        col.map((b) => blockToMarkdown(b)).join('\n')
      ).join('\n\n');
    }

    case 'table': {
      const rows: string[][] = block.attrs?.rows || [];
      if (rows.length === 0) return '';
      let md = '| ' + rows[0].join(' | ') + ' |\n';
      md += '| ' + rows[0].map(() => '---').join(' | ') + ' |\n';
      for (let i = 1; i < rows.length; i++) {
        md += '| ' + rows[i].join(' | ') + ' |\n';
      }
      return md + '\n';
    }

    case 'file': {
      const name = block.attrs?.fileName || 'file';
      const src = block.attrs?.src || '';
      return `[📎 ${name}](${src})\n`;
    }

    case 'quiz': {
      const options = block.attrs?.options || [];
      const question = block.attrs?.question || block.content;
      let md = `**${question}**\n\n`;
      options.forEach((opt: string, i: number) => {
        const marker = block.attrs?.correctAnswer === i ? '✅' : '○';
        md += `${marker} ${opt}\n`;
      });
      return md + '\n';
    }

    default:
      return `${block.content}\n`;
  }
}

export function workshopToMarkdown(workshop: any): string {
  let md = `# ${workshop.title}\n\n`;

  if (workshop.description) {
    md += `${workshop.description}\n\n`;
  }

  const meta: string[] = [];
  if (workshop.language) meta.push(`Language: ${workshop.language === 'ar' ? 'العربية' : 'English'}`);
  if (workshop.level) meta.push(`Level: ${workshop.level}`);
  if (workshop.category) meta.push(`Category: ${workshop.category}`);
  if (meta.length > 0) md += `> ${meta.join(' | ')}\n\n`;

  if (workshop.whatYouLearn?.length > 0) {
    md += `## What You'll Learn\n\n`;
    workshop.whatYouLearn.forEach((item: string) => {
      md += `- ${item}\n`;
    });
    md += '\n';
  }

  if (workshop.requirements?.length > 0) {
    md += `## Requirements\n\n`;
    workshop.requirements.forEach((item: string) => {
      md += `- ${item}\n`;
    });
    md += '\n';
  }

  md += `---\n\n`;

  for (const section of workshop.sections || []) {
    md += `## ${section.title || 'Untitled Section'}\n\n`;

    for (const lesson of section.lessons || []) {
      md += `### ${lesson.title || 'Untitled Lesson'}\n\n`;

      if (lesson.blocks?.length > 0) {
        for (const block of lesson.blocks) {
          md += blockToMarkdown(block);
        }
      }

      md += '\n';

      if (lesson.children?.length > 0) {
        for (const child of lesson.children) {
          md += `#### ${child.title || 'Untitled'}\n\n`;
          if (child.blocks?.length > 0) {
            for (const block of child.blocks) {
              md += blockToMarkdown(block);
            }
          }
          md += '\n';
        }
      }
    }
  }

  return md;
}

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
