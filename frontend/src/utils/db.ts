import Dexie, { Table } from 'dexie';
import { ComparisonPlan, InspirationImage, MoodBoard, StyleProfile } from '../types';

export class DecorDatabase extends Dexie {
  profiles!: Table<StyleProfile, string>;
  images!: Table<InspirationImage, string>;
  moodboards!: Table<MoodBoard, string>;
  comparisons!: Table<ComparisonPlan, string>;

  constructor() {
    super('decor-style-lab');
    this.version(1).stores({
      profiles: 'userId, primaryStyle, testedAt',
      images: 'id, style, roomType',
      moodboards: 'id, createdAt',
      comparisons: 'id, moodBoardId, createdAt'
    });
    // v2：测试记录改为按次存储（id 主键），同一次测试复用同一条记录；
    // 主键变更会重建 profiles 表，旧的本地测试数据为演示数据，直接清空
    this.version(2)
      .stores({
        profiles: 'id, userId, primaryStyle, testedAt'
      })
      .upgrade((tx) => tx.table('profiles').clear());
  }
}

export const db = new DecorDatabase();
