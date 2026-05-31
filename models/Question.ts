import mongoose, { Schema, model } from 'mongoose';
import { IQuestion, QuestionModel } from '../types/models';

const questionSchema = new Schema<IQuestion>(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v && v.length === 4;
        },
        message: 'Question must have exactly 4 options',
      },
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
    source: {
      type: String,
      required: true,
    },
    sourceQuestionId: {
      type: Number,
    },
    imageUrl: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

questionSchema.index({ category: 1, active: 1 });
questionSchema.index({ active: 1 });
questionSchema.index({ difficulty: 1 });

questionSchema.pre('find', function () {
  this.where({ active: true });
});

const Question =
  (mongoose.models.Question as QuestionModel) ||
  model<IQuestion, QuestionModel>('Question', questionSchema);

export default Question;
