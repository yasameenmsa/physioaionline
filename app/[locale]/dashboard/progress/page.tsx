'use client';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Flame, Brain, Target } from 'lucide-react';

const ChartSection = lazy(() => import('./ChartSection'));

interface CategoryStat {
  categoryId: string;
  categoryName: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface ProgressData {
  totalAnswered: number;
  correctAnswers: number;
  accuracy: number;
  categoryStats: CategoryStat[];
  currentStreak: number;
  longestStreak: number;
  studyDays: string[];
  lastPracticeDate: string | null;
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/progress')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setData(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="h-80 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">No progress data yet</h2>
        <p className="text-muted-foreground mt-2">
          Start practicing to see your stats here
        </p>
      </div>
    );
  }

  const wrongAnswers = data.totalAnswered - data.correctAnswers;

  const chartData = data.categoryStats.map((stat) => ({
    name: stat.categoryName.length > 15 ? stat.categoryName.slice(0, 15) + '...' : stat.categoryName,
    Correct: stat.correct,
    Incorrect: stat.total - stat.correct,
    accuracy: stat.accuracy,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Your Progress</h2>
        <p className="text-sm text-muted-foreground">
          Track your exam preparation journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.totalAnswered}</p>
              <p className="text-xs text-muted-foreground">Questions Answered</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.accuracy}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <Flame className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.longestStreak}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.totalAnswered > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Breakdown</CardTitle>
              <CardDescription>
                Correct vs incorrect by topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <Suspense fallback={<div className="h-80 bg-muted rounded animate-pulse" />}>
                  <ChartSection chartData={chartData} />
                </Suspense>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No category data yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accuracy by Category</CardTitle>
              <CardDescription>
                Performance percentage per topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.categoryStats.length > 0 ? (
                <div className="space-y-4">
                  {data.categoryStats.map((stat) => (
                    <div key={stat.categoryId}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{stat.categoryName}</span>
                        <span className="text-muted-foreground">
                          {stat.correct}/{stat.total} ({stat.accuracy}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            stat.accuracy >= 80
                              ? 'bg-green-500'
                              : stat.accuracy >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${stat.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No category data yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {data.studyDays && data.studyDays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Practice Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {data.studyDays
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                .slice(0, 30)
                .map((day, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center text-xs"
                    title={new Date(day).toLocaleDateString()}
                  >
                    {new Date(day).getDate()}
                  </div>
                ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Showing up to 30 most recent practice days
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
