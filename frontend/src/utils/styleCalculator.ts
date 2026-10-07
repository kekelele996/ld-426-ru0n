import { DecorStyle, QuizOption } from '../types';

export interface StyleResult {
  scores: Record<DecorStyle, number>;
  primaryStyle: DecorStyle;
  secondaryStyle: DecorStyle;
}

/** 仅在全部题目答完后调用：加权求和 → 归一化 → 排序取主/辅风格 */
export function calculateStyleResult(answers: QuizOption[]): StyleResult {
  const scores = Object.values(DecorStyle).reduce((acc, style) => ({ ...acc, [style]: 0 }), {} as Record<DecorStyle, number>);
  answers.forEach((answer) => {
    Object.entries(answer.weights).forEach(([style, value]) => {
      scores[style as DecorStyle] += value ?? 0;
    });
  });
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [DecorStyle, number][];
  const max = Math.max(1, sorted[0][1]);
  const normalized = Object.fromEntries(Object.entries(scores).map(([style, score]) => [style, Math.round((score / max) * 100)])) as Record<DecorStyle, number>;
  return {
    scores: normalized,
    primaryStyle: sorted[0][0],
    secondaryStyle: sorted[1][0]
  };
}
