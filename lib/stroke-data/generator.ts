import { createCharacterData } from './utils';

/**
 * 簡易的な筆順データを生成
 * 実際の実装では、正確な筆順データが必要です
 * ここでは、文字の形に基づいた基本的なストロークを生成します
 */

// 基本的なストロークパターン
function createSimpleStroke(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  points?: Array<{ x: number; y: number }>
) {
  const strokePoints = points || [
    { x: startX, y: startY },
    { x: endX, y: endY },
  ];
  return {
    points: strokePoints,
    startPoint: { x: startX, y: startY },
    endPoint: { x: endX, y: endY },
  };
}

// ひらがなの筆順データを生成
export function generateHiraganaStrokes(character: string) {
  const centerX = 150;
  const centerY = 150;
  const size = 100;

  // 各文字の基本的な筆順データ（簡易版）
  // 実際の実装では、正確な筆順データが必要です
  const strokeMap: Record<string, Array<{ points: Array<{ x: number; y: number }>; startPoint: { x: number; y: number }; endPoint: { x: number; y: number } }>> = {
    'あ': [
      {
        points: [
          { x: 100, y: 50 },
          { x: 100, y: 120 },
          { x: 100, y: 180 },
        ],
        startPoint: { x: 100, y: 50 },
        endPoint: { x: 100, y: 180 },
      },
      {
        points: [
          { x: 80, y: 100 },
          { x: 120, y: 100 },
        ],
        startPoint: { x: 80, y: 100 },
        endPoint: { x: 120, y: 100 },
      },
      {
        points: [
          { x: 100, y: 140 },
          { x: 100, y: 200 },
          { x: 80, y: 220 },
        ],
        startPoint: { x: 100, y: 140 },
        endPoint: { x: 80, y: 220 },
      },
    ],
    'い': [
      {
        points: [
          { x: 80, y: 50 },
          { x: 80, y: 100 },
          { x: 80, y: 150 },
        ],
        startPoint: { x: 80, y: 50 },
        endPoint: { x: 80, y: 150 },
      },
      {
        points: [
          { x: 120, y: 70 },
          { x: 120, y: 130 },
          { x: 120, y: 200 },
        ],
        startPoint: { x: 120, y: 70 },
        endPoint: { x: 120, y: 200 },
      },
    ],
    'う': [
      createSimpleStroke(centerX, centerY - size, centerX, centerY - size * 0.3),
      createSimpleStroke(centerX, centerY - size * 0.3, centerX - size * 0.3, centerY + size * 0.3, [
        { x: centerX, y: centerY - size * 0.3 },
        { x: centerX - size * 0.2, y: centerY },
        { x: centerX - size * 0.3, y: centerY + size * 0.3 },
        { x: centerX, y: centerY + size * 0.6 },
      ]),
    ],
    'え': [
      createSimpleStroke(centerX, centerY - size, centerX, centerY - size * 0.3),
      createSimpleStroke(centerX, centerY - size * 0.3, centerX - size * 0.3, centerY + size * 0.3, [
        { x: centerX, y: centerY - size * 0.3 },
        { x: centerX - size * 0.2, y: centerY },
        { x: centerX - size * 0.3, y: centerY + size * 0.3 },
        { x: centerX, y: centerY + size * 0.6 },
      ]),
      createSimpleStroke(centerX + size * 0.2, centerY, centerX + size * 0.4, centerY + size * 0.2),
    ],
    'お': [
      createSimpleStroke(centerX, centerY - size, centerX, centerY + size * 0.2),
      createSimpleStroke(centerX - size * 0.3, centerY, centerX + size * 0.3, centerY),
      createSimpleStroke(centerX, centerY + size * 0.2, centerX - size * 0.2, centerY + size * 0.8),
      createSimpleStroke(centerX + size * 0.2, centerY + size * 0.4, centerX + size * 0.4, centerY + size * 0.6),
    ],
  };

  // 既存のデータがある場合はそれを使用
  if (strokeMap[character]) {
    return strokeMap[character];
  }

  // デフォルト: 2画の簡易データ
  return [
    createSimpleStroke(centerX - size * 0.3, centerY - size, centerX - size * 0.3, centerY + size),
    createSimpleStroke(centerX + size * 0.3, centerY - size, centerX + size * 0.3, centerY + size),
  ];
}

// カタカナの筆順データを生成
export function generateKatakanaStrokes(character: string) {
  const centerX = 150;
  const centerY = 150;
  const size = 100;

  const strokeMap: Record<string, Array<{ points: Array<{ x: number; y: number }>; startPoint: { x: number; y: number }; endPoint: { x: number; y: number } }>> = {
    'ア': [
      {
        points: [
          { x: 80, y: 50 },
          { x: 120, y: 50 },
        ],
        startPoint: { x: 80, y: 50 },
        endPoint: { x: 120, y: 50 },
      },
      {
        points: [
          { x: 100, y: 50 },
          { x: 100, y: 200 },
        ],
        startPoint: { x: 100, y: 50 },
        endPoint: { x: 100, y: 200 },
      },
    ],
    'イ': [
      {
        points: [
          { x: 80, y: 50 },
          { x: 80, y: 150 },
        ],
        startPoint: { x: 80, y: 50 },
        endPoint: { x: 80, y: 150 },
      },
      {
        points: [
          { x: 120, y: 70 },
          { x: 120, y: 200 },
        ],
        startPoint: { x: 120, y: 70 },
        endPoint: { x: 120, y: 200 },
      },
    ],
    'ウ': [
      createSimpleStroke(centerX, centerY - size, centerX, centerY - size * 0.3),
      createSimpleStroke(centerX, centerY - size * 0.3, centerX - size * 0.3, centerY + size * 0.3, [
        { x: centerX, y: centerY - size * 0.3 },
        { x: centerX - size * 0.2, y: centerY },
        { x: centerX - size * 0.3, y: centerY + size * 0.3 },
      ]),
    ],
    'エ': [
      createSimpleStroke(centerX, centerY - size, centerX, centerY + size),
      createSimpleStroke(centerX - size * 0.3, centerY - size * 0.3, centerX + size * 0.3, centerY - size * 0.3),
      createSimpleStroke(centerX - size * 0.3, centerY + size * 0.3, centerX + size * 0.3, centerY + size * 0.3),
    ],
    'オ': [
      createSimpleStroke(centerX, centerY - size, centerX, centerY + size),
      createSimpleStroke(centerX - size * 0.3, centerY - size * 0.3, centerX + size * 0.3, centerY - size * 0.3),
      createSimpleStroke(centerX - size * 0.3, centerY + size * 0.3, centerX + size * 0.3, centerY + size * 0.3),
      createSimpleStroke(centerX + size * 0.2, centerY, centerX + size * 0.4, centerY + size * 0.2),
    ],
  };

  if (strokeMap[character]) {
    return strokeMap[character];
  }

  // デフォルト: 2画の簡易データ
  return [
    createSimpleStroke(centerX - size * 0.3, centerY - size, centerX - size * 0.3, centerY + size),
    createSimpleStroke(centerX + size * 0.3, centerY - size, centerX + size * 0.3, centerY + size),
  ];
}

