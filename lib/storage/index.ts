import { UserProgress, PracticeRecord } from '@/types';

const STORAGE_KEYS = {
  USER_PROGRESS: 'jwm_user_progress',
  PRACTICE_RECORDS: 'jwm_practice_records',
} as const;

// ユーザー進捗の保存
export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save user progress:', error);
  }
}

// ユーザー進捗の読み込み
export function loadUserProgress(): UserProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    if (!data) return null;
    const progress = JSON.parse(data);
    // Dateオブジェクトの復元
    if (progress.firstLaunchDate) {
      progress.firstLaunchDate = new Date(progress.firstLaunchDate);
    }
    if (progress.lastPracticeDate) {
      progress.lastPracticeDate = new Date(progress.lastPracticeDate);
    }
    // characterProgress内のlastPracticeDateも復元
    if (progress.characterProgress) {
      Object.keys(progress.characterProgress).forEach(key => {
        const charProgress = progress.characterProgress[key];
        if (charProgress.lastPracticeDate) {
          charProgress.lastPracticeDate = new Date(charProgress.lastPracticeDate);
        }
      });
    }
    return progress;
  } catch (error) {
    console.error('Failed to load user progress:', error);
    return null;
  }
}

// 初期ユーザー進捗の作成
export function createInitialUserProgress(): UserProgress {
  return {
    characterProgress: {},
    totalPracticeTime: 0,
    totalPracticeCount: 0,
    consecutiveDays: 0,
    lastPracticeDate: null,
    firstLaunchDate: new Date(),
  };
}

// 練習記録の保存
export function savePracticeRecord(record: PracticeRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const records = loadPracticeRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEYS.PRACTICE_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save practice record:', error);
  }
}

// 練習記録の読み込み
export function loadPracticeRecords(): PracticeRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRACTICE_RECORDS);
    if (!data) return [];
    const records = JSON.parse(data) as PracticeRecord[];
    // Dateオブジェクトの復元
    return records.map(record => ({
      ...record,
      practiceDate: new Date(record.practiceDate),
      strokeData: record.strokeData.map(stroke => ({
        ...stroke,
        timestamp: new Date(stroke.timestamp),
      })),
    }));
  } catch (error) {
    console.error('Failed to load practice records:', error);
    return [];
  }
}

