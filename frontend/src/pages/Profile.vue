<template>
  <section class="space-y-7">
    <div>
      <p class="text-sm font-semibold uppercase tracking-[0.25em] text-clay">Profile</p>
      <h1 class="page-title mt-3">个人风格档案</h1>
    </div>
    <div v-if="profile.draft" class="flex flex-wrap items-center justify-between gap-4 bg-paper p-6 ring-1 ring-clay/50">
      <div>
        <p class="font-semibold text-ink">你有一次没答完的风格测试</p>
        <p class="mt-1 text-sm text-ink/60">还差 {{ remaining }} 题，答完才会生成主风格</p>
      </div>
      <RouterLink class="bg-clay px-5 py-3 font-semibold text-paper" to="/quiz">继续测试</RouterLink>
    </div>
    <div v-if="profile.profile?.primaryStyle" class="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div class="bg-paper p-8 ring-1 ring-ink/10">
        <p class="text-sm text-ink/60">最近测试</p>
        <h2 class="font-display text-5xl text-ink">{{ profile.profile.primaryStyle }}</h2>
        <p class="mt-4 text-ink/70">{{ styleDescriptions[profile.profile.primaryStyle] }}</p>
      </div>
      <StyleRadarChart v-if="profile.profile.scores" :scores="profile.profile.scores" />
    </div>
    <EmptyState v-else-if="!profile.draft" text="完成一次风格测试后，这里会出现你的长期偏好档案" />
    <div v-if="profile.completedHistory.length" class="space-y-3">
      <h2 class="font-display text-2xl text-ink">历史测试</h2>
      <ul class="divide-y divide-ink/10 bg-paper ring-1 ring-ink/10">
        <li v-for="item in profile.completedHistory" :key="item.id" class="flex items-center justify-between px-5 py-3 text-sm">
          <span class="font-semibold text-ink">{{ item.primaryStyle }}</span>
          <span class="text-ink/50">{{ formatDate(item.testedAt) }}</span>
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
import { mockQuiz } from '../api/mockQuiz';
import EmptyState from '../components/common/EmptyState.vue';
import MoodBoardCard from '../components/common/MoodBoardCard.vue';
import StyleRadarChart from '../components/common/StyleRadarChart.vue';
import { styleDescriptions } from '../constants/styleDescriptions';
import { useMoodboardStore } from '../stores/moodboardStore';
import { useProfileStore } from '../stores/profileStore';

const profile = useProfileStore();
const boards = useMoodboardStore();

const remaining = computed(() => {
  const draft = profile.draft;
  if (!draft) return 0;
  return Math.max(0, mockQuiz.length - draft.answers.filter(Boolean).length);
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short' });
}

onMounted(async () => {
  await profile.loadProfile();
  await boards.load();
});
</script>
