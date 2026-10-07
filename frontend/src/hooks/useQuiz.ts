import { computed, ref } from 'vue';
import { mockQuiz } from '../api/mockQuiz';
import { QuizOption, StyleProfile } from '../types';
import { calculateStyleProfile } from '../utils/styleCalculator';

function createAnswers(): (QuizOption | null)[] {
  return mockQuiz.map(() => null);
}

function isAnswered(option: QuizOption | null): option is QuizOption {
  return option !== null;
}

/**
 * 问卷流程：
 * - 每题作答后把草稿交给调用方持久化，重新打开时由 restoreDraft 恢复
 * - 回翻改答只覆盖当前题，后续题的答案原样保留
 * - 三题全部答完后才算风格结果，且沿用草稿记录 id（同一次测试只留一条记录）
 */
export function useQuiz(userId: string) {
  const id = ref<string>(crypto.randomUUID());
  const currentIndex = ref(0);
  const answers = ref<(QuizOption | null)[]>(createAnswers());

  const currentQuestion = computed(() => mockQuiz[currentIndex.value]);
  const answeredCount = computed(() => answers.value.filter(isAnswered).length);
  const isComplete = computed(() => answeredCount.value === mockQuiz.length);
  const progress = computed(() => Math.round((answeredCount.value / mockQuiz.length) * 100));
  const currentAnswer = computed(() => answers.value[currentIndex.value]);
  const canGoPrev = computed(() => currentIndex.value > 0);
  const canGoNext = computed(
    () => currentIndex.value < mockQuiz.length - 1 && isAnswered(answers.value[currentIndex.value])
  );

  /** 恢复上次未完成的测试；没有草稿则原样返回 false */
  function restoreDraft(draft: StyleProfile): boolean {
    if (draft.completed || draft.id === undefined) return false;
    id.value = draft.id;
    const restored = createAnswers();
    (draft.answers ?? []).forEach((option, index) => {
      if (index < restored.length) restored[index] = option ?? null;
    });
    answers.value = restored;
    // 回到上次停下的那一题（第一个还没作答的题）
    const firstUnanswered = restored.findIndex((option) => !isAnswered(option));
    currentIndex.value = firstUnanswered === -1 ? mockQuiz.length - 1 : firstUnanswered;
    return true;
  }

  /** 放弃草稿，另起一次新测试 */
  function reset() {
    id.value = crypto.randomUUID();
    answers.value = createAnswers();
    currentIndex.value = 0;
  }

  /** 当前题选择/修改选项；不改变后续题的答案，答完非末题自动进入下一题 */
  function answer(option: QuizOption) {
    answers.value[currentIndex.value] = option;
    if (currentIndex.value < mockQuiz.length - 1) currentIndex.value += 1;
  }

  function goPrev() {
    if (canGoPrev.value) currentIndex.value -= 1;
  }

  function goNext() {
    if (canGoNext.value) currentIndex.value += 1;
  }

  function goTo(index: number) {
    if (index >= 0 && index < mockQuiz.length) currentIndex.value = index;
  }

  /** 构造待持久化的草稿记录 */
  function draft(): StyleProfile {
    return {
      id: id.value,
      userId,
      testedAt: new Date().toISOString(),
      completed: false,
      answers: [...answers.value]
    };
  }

  function result() {
    return calculateStyleProfile({ id: id.value, userId }, [...answers.value]);
  }

  return {
    questions: mockQuiz,
    currentQuestion,
    currentIndex,
    answers,
    currentAnswer,
    answeredCount,
    isComplete,
    progress,
    canGoPrev,
    canGoNext,
    answer,
    goPrev,
    goNext,
    goTo,
    restoreDraft,
    reset,
    draft,
    result
  };
}
