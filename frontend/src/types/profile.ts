import { DecorStyle } from './enums';
import { QuizOption } from './quiz';

export interface StyleProfile {
  /** 一次测试尝试的唯一标识；同一次测试（含中途离开后续答）复用同一条记录 */
  id: string;
  userId: string;
  /** 已作答的选项，按题序存放，支持断点续答与翻回修改 */
  answers: QuizOption[];
  /** 停下时所在的题号，重新打开时回到这一题 */
  currentIndex: number;
  /** 以下三项仅在答完全部题目后计算，未完成时不赋值 */
  scores?: Record<DecorStyle, number>;
  primaryStyle?: DecorStyle;
  secondaryStyle?: DecorStyle;
  testedAt: string;
  /** 是否已答完全部题目 */
  completed: boolean;
}
