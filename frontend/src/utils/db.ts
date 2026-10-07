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
    // profiles 主键改为记录 id（同一次测试的草稿与完成态共用一条记录）
    this.version(2)
      .stores({
        profiles: 'id, userId, primaryStyle, completed, testedAt',
        images: 'id, style, roomType',
        moodboards: 'id, createdAt',
        comparisons: 'id, moodBoardId, createdAt'
      })
      .upgrade((tx) =>
        tx
          .table('profiles')
          .toCollection()
          .modify((profile) => {
            if (!profile.id) profile.id = profile.userId;
          })
      );
  }
}

export const db = new DecorDatabase();
