import { CompletedStyleProfile, DecorStyle, QuizOption } from '../types';

export function calculateStyleProfile(
  meta: { id: string; userId: string },
  answers: (QuizOption | null)[]
): CompletedStyleProfile {
  const scores = Object.values(DecorStyle).reduce(
    (acc, style) => ({ ...acc, [style]: 0 }),
    {} as Record<DecorStyle, number>
  );
  answers.forEach((answer) => {
    if (!answer) return;
    Object.entries(answer.weights).forEach(([style, value]) => {
      scores[style as DecorStyle] += value ?? 0;
    });
  });
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [DecorStyle, number][];
  const max = Math.max(1, sorted[0][1]);
  const normalized = Object.fromEntries(
    Object.entries(scores).map(([style, score]) => [style, Math.round((score / max) * 100)])
  ) as Record<DecorStyle, number>;
  return {
    id: meta.id,
    userId: meta.userId,
    scores: normalized,
    primaryStyle: sorted[0][0],
    secondaryStyle: sorted[1][0],
    testedAt: new Date().toISOString(),
    completed: true,
    answers
  };
}
