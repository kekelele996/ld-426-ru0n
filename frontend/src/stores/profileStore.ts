import { defineStore } from 'pinia';
import { QuizOption, StyleProfile } from '../types';
import { db } from '../utils/db';
import { calculateStyleResult } from '../utils/styleCalculator';

const USER_ID = 'local-user';

export interface QuizProgress {
  answers: QuizOption[];
  currentIndex: number;
}

export const useProfileStore = defineStore('profile', {
  state: () => ({
    /** 最近一次已完成的测试 */
    profile: undefined as StyleProfile | undefined,
    /** 全部测试记录（含未完成的草稿） */
    history: [] as StyleProfile[],
    /** 进行中（没答完）的那次测试，同一时间最多一条 */
    draft: undefined as StyleProfile | undefined
  }),
  getters: {
    completedHistory: (state) => state.history.filter((item) => item.completed)
  },
  actions: {
    async loadProfile() {
      this.history = await db.profiles.orderBy('testedAt').reverse().toArray();
      this.profile = this.history.find((item) => item.completed);
      this.draft = await this.findDraft();
    },
    /** 取出唯一一条未完成的记录；若有意外残留，只留最新一条 */
    async findDraft() {
      const drafts = await db.profiles.filter((item) => !item.completed).sortBy('testedAt');
      const [latest, ...stale] = drafts.reverse();
      if (stale.length) await db.profiles.bulkDelete(stale.map((item) => item.id));
      return latest;
    },
    /** 记录作答进度：首次作答新建记录并标为未完成，之后续答/翻题都更新同一条 */
    async saveDraft(progress: QuizProgress) {
      const base: StyleProfile = this.draft ?? {
        id: crypto.randomUUID(),
        userId: USER_ID,
        answers: [],
        currentIndex: 0,
        testedAt: new Date().toISOString(),
        completed: false
      };
      const draft: StyleProfile = { ...base, ...progress };
      await db.profiles.put(draft);
      this.draft = draft;
      return draft;
    },
    /** 全部题目答完后调用：在同一条记录上结算风格结果并标为已完成 */
    async completeDraft() {
      if (!this.draft) throw new Error('没有进行中的测试，无法结算');
      const result = calculateStyleResult(this.draft.answers);
      const profile: StyleProfile = {
        ...this.draft,
        ...result,
        testedAt: new Date().toISOString(),
        completed: true
      };
      await db.profiles.put(profile);
      this.draft = undefined;
      await this.loadProfile();
      return profile;
    }
  }
});
