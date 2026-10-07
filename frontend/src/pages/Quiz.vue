<template>
  <section class="space-y-8">
    <div class="max-w-4xl">
      <p class="text-sm font-semibold uppercase tracking-[0.25em] text-clay">Style quiz</p>
      <h1 class="page-title mt-3">把偏好变成可执行的装修方向</h1>
    </div>
    <template v-if="!completed">
      <ProgressBar :value="progress" />
      <div class="flex items-center justify-between">
        <div class="flex gap-2">
          <button
            v-for="(question, index) in questions"
            :key="question.id"
            class="h-9 w-9 rounded-full border text-sm font-semibold transition"
            :class="[
              index === currentIndex ? 'border-clay bg-clay text-paper' : 'border-ink/20 text-ink/70',
              index <= furthestIndex ? 'hover:border-clay' : 'cursor-not-allowed opacity-40'
            ]"
            :disabled="index > furthestIndex"
            @click="goTo(index)"
          >
            {{ index + 1 }}
          </button>
        </div>
        <button class="text-sm text-ink/60 underline underline-offset-4 disabled:opacity-40" :disabled="currentIndex === 0" @click="goTo(currentIndex - 1)">
          上一题
        </button>
      </div>
      <QuizCard v-if="currentQuestion" :question="currentQuestion" :selected="answers[currentIndex]" @answer="handleAnswer" />
    </template>
    <div v-else-if="profile?.primaryStyle" class="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div class="bg-paper p-8 ring-1 ring-ink/10">
        <p class="text-sm text-ink/60">主风格</p>
        <h2 class="font-display text-5xl text-ink">{{ profile.primaryStyle }}</h2>
        <p class="mt-4 text-ink/70">{{ styleDescriptions[profile.primaryStyle] }}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <RouterLink class="inline-block bg-clay px-5 py-3 font-semibold text-paper" to="/gallery">查看匹配图集</RouterLink>
          <button class="border border-ink/20 px-5 py-3 font-semibold text-ink transition hover:border-clay" @click="handleRestart">再测一次</button>
        </div>
      </div>
      <StyleRadarChart v-if="profile.scores" :scores="profile.scores" />
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
import { QuizOption } from '../types';

const { questions, currentQuestion, currentIndex, answers, progress, isComplete, furthestIndex, restore, answer, goTo, restart, finish } = useQuiz();
const profileStore = useProfileStore();
const completed = ref(false);
const profile = computed(() => profileStore.profile);

onMounted(restore);

async function handleAnswer(option: QuizOption) {
  await answer(option);
  if (isComplete.value) {
    await finish();
    completed.value = true;
  }
}

async function handleRestart() {
  await restart();
  completed.value = false;
}
</script>
