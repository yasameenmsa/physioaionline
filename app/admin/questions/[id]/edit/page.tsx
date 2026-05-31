import { connectDB } from '@/lib/db';
import Question from '@/models/Question';
import Category from '@/models/Category';
import { QuestionForm } from '@/components/admin/QuestionForm';
import { notFound } from 'next/navigation';

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();

  const [question, categories] = await Promise.all([
    Question.findById(id).lean(),
    Category.find({ active: true }).sort({ name: 1 }).select('_id name').lean(),
  ]);

  if (!question) {
    notFound();
  }

  const initialData = {
    questionText: question.questionText,
    category: question.category.toString(),
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    difficulty: question.difficulty || 'medium',
    source: question.source,
    active: question.active,
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Edit Question</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Update question details
      </p>
      <QuestionForm
        categories={JSON.parse(JSON.stringify(categories))}
        initialData={initialData}
        isEditing
        questionId={id}
      />
    </div>
  );
}
