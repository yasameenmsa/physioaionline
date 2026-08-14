import { connectDB, disconnectDB } from '../lib/db';
import Category from '../models/Category';
import User from '../models/User';

async function main() {
  await connectDB();
  const cats = await Category.find().lean();
  console.log('CATEGORIES:');
  for (const c of cats as any[]) {
    console.log(JSON.stringify({ id: c._id.toString(), name: c.name, slug: c.slug }));
  }
  const users = await User.find({ role: 'admin' }).select('name email').lean();
  console.log('ADMINS:');
  for (const u of users as any[]) {
    console.log(JSON.stringify({ id: u._id.toString(), name: u.name, email: u.email }));
  }
  await disconnectDB();
}

main().catch((e) => { console.error(e); process.exit(1); });
