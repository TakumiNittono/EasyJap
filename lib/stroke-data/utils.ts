import { WritingCharacter, Stroke } from '@/types';

/**
 * 文字の筆順データを生成するヘルパー関数
 * 実際の実装では、正確な筆順データが必要です
 */
export function createCharacterData(
  character: string,
  lessonType: 'hiragana' | 'katakana',
  strokes: Array<{
    points: Array<{ x: number; y: number }>;
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
  }>
): WritingCharacter {
  const strokeOrder: Stroke[] = strokes.map((stroke, index) => ({
    strokeNumber: index + 1,
    points: stroke.points,
    startPoint: stroke.startPoint,
    endPoint: stroke.endPoint,
  }));

  return {
    id: character,
    character,
    lessonType,
    strokeOrder,
    totalStrokes: strokes.length,
  };
}

/**
 * 簡易的な筆順データを生成（実際の筆順データの代わり）
 * 本番環境では、正確な筆順データを使用してください
 */
export function generateSimpleStrokeData(
  character: string,
  centerX: number = 150,
  centerY: number = 150,
  size: number = 100
): Array<{
  points: Array<{ x: number; y: number }>;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}> {
  // 簡易的なデータ生成（実際の実装では正確な筆順データが必要）
  // ここでは、文字の形に基づいた簡易的なストロークを生成
  return [
    {
      points: [
        { x: centerX - size / 2, y: centerY - size / 2 },
        { x: centerX + size / 2, y: centerY - size / 2 },
        { x: centerX + size / 2, y: centerY + size / 2 },
        { x: centerX - size / 2, y: centerY + size / 2 },
        { x: centerX - size / 2, y: centerY - size / 2 },
      ],
      startPoint: { x: centerX - size / 2, y: centerY - size / 2 },
      endPoint: { x: centerX - size / 2, y: centerY - size / 2 },
    },
  ];
}


