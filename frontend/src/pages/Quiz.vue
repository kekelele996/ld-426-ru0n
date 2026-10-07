<template>
  <section class="space-y-8">
    <div class="max-w-4xl">
      <p class="text-sm font-semibold uppercase tracking-[0.25em] text-clay">Style quiz</p>
      <h1 class="page-title mt-3">把偏好变成可执行的装修方向</h1>
    </div>

    <template v-if="!showResult">
      <div v-if="resumed" class="flex flex-wrap items-center gap-x-3 gap-y-1 border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-ink/80">
        <span>已为你恢复上次未完成的测试，从第 {{ quiz.currentIndex.value + 1 }} 题继续。</span>
        <span class="font-semibold text-clay">还差 {{ remaining }} 题答完。</span>
      </div>

      <ProgressBar :value="quiz.progress.value" />

      <div class="flex items-center justify-between">
        <p class="text-sm text-ink/60">
          第 {{ quiz.currentIndex.value + 1 }} / {{ quiz.questions.length }} 题
          <span class="ml-2">已答 {{ quiz.answeredCount.value }} 题</span>
        </p>
        <div class="flex gap-2">
          <button
            v-for="(question, index) in quiz.questions"
            :key="question.id"
            type="button"
            class="h-8 w-8 rounded-full text-xs font-semibold transition"
            :class="index === quiz.currentIndex.value
              ? 'bg-ink text-paper'
              : quiz.answers.value[index]
                ? 'bg-clay/70 text-paper'
                : 'bg-ink/10 text-ink/60 hover:bg-clay/30'"
            :title="`第 ${index + 1} 题`"
            @click="quiz.goTo(index)"
          >
            {{ index + 1 }}
          </button>
        </div>
      </div>

      <QuizCard
        :question="quiz.currentQuestion.value"
        :selected-text="quiz.currentAnswer.value?.text ?? null"
        @answer="handleAnswer"
      />

      <div class="flex items-center justify-between">
        <button
          type="button"
          class="border border-ink/20 px-5 py-3 text-sm text-ink disabled:opacity-40"
          :disabled="!quiz.canGoPrev.value"
          @click="quiz.goPrev()"
        >
          上一题
        </button>
        <button
          v-if="quiz.isComplete.value"
          type="button"
          class="bg-clay px-5 py-3 font-semibold text-paper"
          @click="finish"
        >
          查看风格结果
        </button>
        <button
          v-else
          type="button"
          class="border border-ink/20 px-5 py-3 text-sm text-ink disabled:opacity-40"
          :disabled="!quiz.canGoNext.value"
          @click="quiz.goNext()"
        >
          下一题
        </button>
      </div>
    </template>

    <div v-else-if="resultProfile" class="space-y-6">
      <div class="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div class="bg-paper p-8 ring-1 ring-ink/10">
          <p class="text-sm text-ink/60">主风格</p>
          <h2 class="font-display text-5xl text-ink">{{ resultProfile.primaryStyle }}</h2>
          <p class="mt-4 text-ink/70">{{ styleDescriptions[resultProfile.primaryStyle] }}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink class="inline-block bg-clay px-5 py-3 font-semibold text-paper" to="/gallery">查看匹配图集</RouterLink>
            <button type="button" class="border border-ink/20 px-5 py-3 text-sm text-ink" @click="retake">重新测试</button>
          </div>
        </div>
        <StyleRadarChart :scores="resultProfile.scores" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { styleDescriptions } from '../constants/styleDescriptions';
import ProgressBar from '../components/common/ProgressBar.vue';
import QuizCard from '../components/common/QuizCard.vue';
import StyleRadarChart from '../components/common/StyleRadarChart.vue';
import { useQuiz } from '../hooks/useQuiz';
import { useProfileStore } from '../stores/profileStore';
import { CompletedStyleProfile, QuizOption } from '../types';

const profileStore = useProfileStore();
const quiz = useQuiz(profileStore.getUserId());

const resumed = ref(false);
const showResult = ref(false);
const resultProfile = ref<CompletedStyleProfile>();

const remaining = computed(() => quiz.questions.length - quiz.answeredCount.value);

onMounted(async () => {
  await profileStore.loadProfile();
  if (profileStore.draft) {
    resumed.value = quiz.restoreDraft(profileStore.draft);
  }
});

async function persistDraft() {
  await profileStore.saveDraft(quiz.draft());
}

async function handleAnswer(option: QuizOption) {
  quiz.answer(option);
  if (quiz.isComplete.value) {
    await finish();
    return;
  }
  await persistDraft();
}

async function finish() {
  const profile = quiz.result();
  await profileStore.completeProfile(profile);
  resultProfile.value = profile;
  resumed.value = false;
  showResult.value = true;
}

function retake() {
  quiz.reset();
  resultProfile.value = undefined;
  showResult.value = false;
}
</script>
