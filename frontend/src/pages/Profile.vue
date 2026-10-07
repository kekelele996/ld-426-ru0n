<template>
  <section class="space-y-7">
    <div>
      <p class="text-sm font-semibold uppercase tracking-[0.25em] text-clay">Profile</p>
      <h1 class="page-title mt-3">个人风格档案</h1>
    </div>

    <div v-if="latestCompleted" class="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div class="bg-paper p-8 ring-1 ring-ink/10">
        <p class="text-sm text-ink/60">最近完成的测试</p>
        <h2 class="font-display text-5xl text-ink">{{ latestCompleted.primaryStyle }}</h2>
        <p class="mt-4 text-ink/70">{{ styleDescriptions[latestCompleted.primaryStyle] }}</p>
        <p class="mt-4 text-xs text-ink/50">完成于 {{ formatDate(latestCompleted.testedAt) }}</p>
      </div>
      <StyleRadarChart :scores="latestCompleted.scores" />
    </div>
    <EmptyState v-else text="完成一次风格测试后，这里会出现你的长期偏好档案" />

    <div v-if="draft" class="flex flex-wrap items-center gap-x-4 gap-y-2 border border-dashed border-clay/60 bg-clay/5 px-5 py-4">
      <p class="text-sm text-ink/80">
        你有一次未完成的风格测试，已答 {{ draft.answers?.length ?? 0 }} / {{ totalQuestions }} 题，
        <span class="font-semibold text-clay">还差 {{ remainingQuestions }} 题</span>即可得到风格结果。
      </p>
      <RouterLink class="bg-clay px-4 py-2 text-sm font-semibold text-paper" to="/quiz">回到上次的题目</RouterLink>
    </div>

    <div v-if="history.length > 1" class="space-y-3">
      <h3 class="font-display text-2xl text-ink">历史测试</h3>
      <ul class="grid gap-3 md:grid-cols-2">
        <li v-for="item in history" :key="item.id" class="flex items-center justify-between bg-paper px-5 py-4 ring-1 ring-ink/10">
          <span class="font-semibold text-ink">{{ item.primaryStyle }}</span>
          <span class="text-xs text-ink/50">{{ formatDate(item.testedAt) }}</span>
        </li>
      </ul>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <MoodBoardCard v-for="board in boards.boards" :key="board.id" :board="board" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import EmptyState from '../components/common/EmptyState.vue';
import MoodBoardCard from '../components/common/MoodBoardCard.vue';
import StyleRadarChart from '../components/common/StyleRadarChart.vue';
import { mockQuiz } from '../api/mockQuiz';
import { styleDescriptions } from '../constants/styleDescriptions';
import { useMoodboardStore } from '../stores/moodboardStore';
import { useProfileStore } from '../stores/profileStore';

const profile = useProfileStore();
const boards = useMoodboardStore();

const totalQuestions = mockQuiz.length;
const latestCompleted = computed(() => profile.profile);
const draft = computed(() => profile.draft);
const remainingQuestions = computed(() => {
  const answered = profile.draft?.answers?.filter((option) => option !== null && option !== undefined).length ?? 0;
  return Math.max(0, totalQuestions - answered);
});
const history = computed(() => profile.history);

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(async () => {
  await profile.loadProfile();
  await boards.load();
});
</script>
