import { defineStore } from 'pinia';
import { CompletedStyleProfile, StyleProfile } from '../types';
import { db } from '../utils/db';

const USER_ID = 'local-user';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    /** 最近一次已完成的测试结果（档案主风格来源） */
    profile: undefined as CompletedStyleProfile | undefined,
    /** 进行中、尚未答完的测试草稿，同一时刻最多一条 */
    draft: undefined as StyleProfile | undefined,
    history: [] as CompletedStyleProfile[]
  }),
  actions: {
    /** 保存/更新进行中的草稿；同一次测试始终复用同一条记录 */
    async saveDraft(draft: StyleProfile) {
      await db.profiles.put(draft);
      this.draft = draft;
    },
    /** 草稿答完：用同一条记录写入完整结果 */
    async completeProfile(profile: CompletedStyleProfile) {
      await db.profiles.put(profile);
      this.draft = undefined;
      this.profile = profile;
      this.history = (await db.profiles.orderBy('testedAt').reverse().toArray()).filter(
        (record): record is CompletedStyleProfile => record.completed === true
      );
    },
    async loadProfile() {
      const records = await db.profiles.orderBy('testedAt').reverse().toArray();
      this.draft = records.find((record) => !record.completed);
      this.history = records.filter(
        (record): record is CompletedStyleProfile => record.completed === true
      );
      this.profile = this.history[0];
    },
    /** 放弃当前草稿（用户主动重开一次测试时） */
    async discardDraft() {
      if (this.draft) await db.profiles.delete(this.draft.id);
      this.draft = undefined;
    },
    getUserId() {
      return USER_ID;
    }
  }
});
