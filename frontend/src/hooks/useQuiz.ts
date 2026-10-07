import { computed, ref } from 'vue';
import { mockQuiz } from '../api/mockQuiz';
import { useProfileStore } from '../stores/profileStore';
import { QuizOption } from '../types';

export function useQuiz() {
  const profileStore = useProfileStore();
  const total = mockQuiz.length;
  const currentIndex = ref(0);
  const answers = ref<QuizOption[]>([]);
  const currentQuestion = computed(() => mockQuiz[currentIndex.value]);
  const answeredCount = computed(() => answers.value.filter(Boolean).length);
  const isComplete = computed(() => answeredCount.value === total);
  const progress = computed(() => Math.round((answeredCount.value / total) * 100));
  /** 允许翻回的最远题号：已答过的题 + 当前停下的那一题 */
  const furthestIndex = computed(() => Math.min(answeredCount.value, total - 1));

  /** 重新打开时恢复上次进度：回到停下的那一题，已选选项原样带回 */
  async function restore() {
    await profileStore.loadProfile();
    const draft = profileStore.draft;
    if (!draft) return;
    answers.value = [...draft.answers];
    currentIndex.value = Math.min(draft.currentIndex, total - 1);
  }

  async function persist() {
    await profileStore.saveDraft({ answers: [...answers.value], currentIndex: currentIndex.value });
  }

  /** 作答只写当前题并落盘，不动后面已选好的答案 */
  async function answer(option: QuizOption) {
    answers.value[currentIndex.value] = option;
    if (currentIndex.value < total - 1) currentIndex.value += 1;
    await persist();
  }

  /** 翻回已答过的某一题修改答案 */
  async function goTo(index: number) {
    if (index < 0 || index > furthestIndex.value || index === currentIndex.value) return;
    currentIndex.value = index;
    await persist();
  }

  /** 清空本次作答重新开始；测试进行中时复用同一条记录，不新起 */
  async function restart() {
    answers.value = [];
    currentIndex.value = 0;
    if (profileStore.draft) await persist();
  }

  /** 三题都答完才结算风格结果 */
  async function finish() {
    return profileStore.completeDraft();
  }

  return {
    questions: mockQuiz,
    currentQuestion,
    currentIndex,
    answers,
    progress,
    isComplete,
    furthestIndex,
    restore,
    answer,
    goTo,
    restart,
    finish
  };
}
