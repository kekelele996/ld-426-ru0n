import { DecorStyle } from './enums';
import { QuizOption } from './quiz';

export interface StyleProfile {
  /** 测试记录 ID，同一次测试（含未完成草稿）复用同一条记录 */
  id: string;
  userId: string;
  /** 未完成草稿阶段不产生得分 */
  scores?: Partial<Record<DecorStyle, number>>;
  primaryStyle?: DecorStyle;
  secondaryStyle?: DecorStyle;
  /** 草稿时为最近一次作答时间，完成时为测试完成时间 */
  testedAt: string;
  completed: boolean;
  /** 每题已选选项，未作答的位置为 null，用于断点续答与回改 */
  answers?: (QuizOption | null)[];
}

/** 已答完并计算出风格结果的测试记录 */
export interface CompletedStyleProfile extends StyleProfile {
  completed: true;
  scores: Record<DecorStyle, number>;
  primaryStyle: DecorStyle;
  secondaryStyle: DecorStyle;
  answers: (QuizOption | null)[];
}
