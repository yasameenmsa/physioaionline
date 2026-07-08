import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import { QuestionForm } from '@/components/admin/QuestionForm';

export default async function NewQuestionPage() {
  await connectDB();
  const categories = await Category.find({ active: true })
    .sort({ name: 1 })
    .select('_id name')
    .lean();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Add Question</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Create a new exam question
      </p>
      <QuestionForm categories={JSON.parse(JSON.stringify(categories))} />
    </div>
  );
}
