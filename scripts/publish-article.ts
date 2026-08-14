import { connectDB, disconnectDB } from '../lib/db';
import Article from '../models/Article';
import Category from '../models/Category';
import User from '../models/User';
import { writeFile, mkdir, copyFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const IMG_SRC = '/home/yasmeen/.config/opencode/media/AgACAgIAAxkBAAIE72p9_ii6fdeEyBOu-WsNClPV4B1fAAKYHGsbU_DxS0FOn6rKlLoWAQADAgADdwADPQQ.jpg';

const TITLE = 'الذكاء الاصطناعي: من ELIZA إلى الثورات الثماني.. وكيف غيّر حياتي';

async function main() {
  await connectDB();

  const author = await User.findOne({ email: 'yasmeenawawdehm@gmail.com' }).lean();
  if (!author) throw new Error('author not found');

  let category = await Category.findOne({ slug: 'artificial-intelligence' }).lean();
  if (!category) {
    category = await Category.create({
      name: 'الذكاء الاصطناعي',
      slug: 'artificial-intelligence',
      description: 'مقالات عن الذكاء الاصطناعي وتأثيره على العلاج الطبيعي',
      active: true,
    });
    category = (category as any).toObject?.() ?? category;
  }
  const catId = (category as any)._id.toString();

  const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'storage'));
  await mkdir(uploadDir, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`;
  await copyFile(IMG_SRC, path.join(uploadDir, filename));
  const imageUrl = `/api/files/${filename}`;

  const body = await import('node:fs/promises').then(fs => fs.readFile('/tmp/opencode/yasmin-article-full.txt', 'utf-8'));

  const slugBase = 'revolutions-of-ai';
  let slug = slugBase;
  const existing = await Article.findOne({ slug });
  if (existing) slug = `${slugBase}-${Date.now()}`;

  const article = await Article.create({
    title: TITLE,
    slug,
    body,
    excerpt: 'رحلة الذكاء الاصطناعي منذ ELIZA وحتى الثورات التقنية الكبرى، وكيف خدمتني كمعالجة طبيعية في حياتي اليومية.',
    category: catId,
    author: (author as any)._id.toString(),
    status: 'published',
    publishedAt: new Date(),
    imageUrl,
    tags: ['ذكاء اصطناعي', 'علاج طبيعي', 'أدوات', 'ثورات تقنية'],
    version: 1,
  });

  console.log('PUBLISHED');
  console.log('ID:', (article as any)._id.toString());
  console.log('SLUG:', slug);
  console.log('URL: /articles/' + slug);
  console.log('IMAGE:', imageUrl);
  await disconnectDB();
}

main().catch((e) => { console.error(e); process.exit(1); });
