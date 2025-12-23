// レッスンタイプ
export type LessonType = 'hiragana' | 'katakana';

// 練習モード
export type PracticeMode = 'strokeOrder' | 'beautiful' | 'speed';

// 習熟度レベル
export enum MasteryLevel {
  Beginner = 0, // 初級: スコア50未満
  Intermediate = 1, // 中級: スコア50-60
  Advanced = 2, // 上級: スコア60以上
}

// 座標ポイント
export interface Point {
  x: number;
  y: number;
}

// 画（ストローク）
export interface Stroke {
  strokeNumber: number; // 何画目か
  points: Point[]; // 画の座標データ
  startPoint: Point;
  endPoint: Point;
}

// 文字データ
export interface WritingCharacter {
  id: string;
  character: string; // ひらがな or カタカナ
  lessonType: LessonType;
  strokeOrder: Stroke[]; // 筆順データ
  totalStrokes: number;
}

// ストロークデータ（実際に書いたデータ）
export interface StrokeData {
  strokeNumber: number;
  points: Point[];
  timestamp: Date;
  pressure?: number; // 筆圧（タッチデバイスの場合）
}

// 練習記録
export interface PracticeRecord {
  characterId: string;
  practiceDate: Date;
  mode: PracticeMode;
  score: number; // 0-100
  strokeOrderScore: number; // 0-40
  shapeScore: number; // 0-30
  balanceScore: number; // 0-30
  practiceTime: number; // 練習時間（秒）
  strokeData: StrokeData[]; // 実際に書いたデータ
}

// 文字別進捗
export interface CharacterProgress {
  masteryLevel: MasteryLevel;
  bestScore: number;
  practiceCount: number;
  lastPracticeDate: Date | null;
  averageScore: number;
  strokeOrderAccuracy: number; // 筆順の正確性（0-1）
}

// ユーザー進捗
export interface UserProgress {
  characterProgress: Record<string, CharacterProgress>; // [characterId: progress]
  totalPracticeTime: number; // 秒
  totalPracticeCount: number;
  consecutiveDays: number;
  lastPracticeDate: Date | null;
  firstLaunchDate: Date;
}


