import { Point, Stroke, StrokeData, WritingCharacter } from '@/types';

// 2点間の距離を計算
function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// 点と線の最短距離を計算
function pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx: number, yy: number;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

// ユーザーの描画座標を正規化（300x300座標系に変換）
function normalizeUserPoints(
  userPoints: Point[],
  canvasWidth: number,
  canvasHeight: number
): Point[] {
  const scale = Math.min(canvasWidth, canvasHeight) / 300;
  const offsetX = (canvasWidth - 300 * scale) / 2;
  const offsetY = (canvasHeight - 300 * scale) / 2;
  
  return userPoints.map(point => ({
    x: (point.x - offsetX) / scale,
    y: (point.y - offsetY) / scale,
  }));
}

// 筆順スコアを計算（40点満点）
export function calculateStrokeOrderScore(
  characterData: WritingCharacter,
  userStrokes: StrokeData[],
  canvasWidth: number = 600,
  canvasHeight: number = 600
): number {
  let score = 0;
  const tolerance = 15; // 300x300座標系での許容誤差（約5%）

  // 各画の評価
  for (let i = 0; i < characterData.strokeOrder.length; i++) {
    const correctStroke = characterData.strokeOrder[i];
    const userStroke = userStrokes[i];

    if (!userStroke || userStroke.points.length === 0) {
      continue; // 画が不足している場合はスキップ
    }

    // ユーザーの描画座標を正規化
    const normalizedPoints = normalizeUserPoints(userStroke.points, canvasWidth, canvasHeight);
    if (normalizedPoints.length === 0) continue;

    let strokeScore = 10; // 各画は10点満点

    // 開始点のチェック
    const startDistance = distance(
      normalizedPoints[0],
      correctStroke.startPoint
    );
    if (startDistance > tolerance) {
      strokeScore -= 3;
    }

    // 終了点のチェック
    const endDistance = distance(
      normalizedPoints[normalizedPoints.length - 1],
      correctStroke.endPoint
    );
    if (endDistance > tolerance) {
      strokeScore -= 3;
    }

    // 画の順序チェック
    if (userStroke.strokeNumber !== i + 1) {
      strokeScore -= 5;
    }

    score += Math.max(0, strokeScore);
  }

  return Math.min(40, score);
}

// 形の正確性スコアを計算（50点満点）
export function calculateShapeScore(
  characterData: WritingCharacter,
  userStrokes: StrokeData[],
  canvasWidth: number = 600,
  canvasHeight: number = 600
): number {
  let score = 0;

  // バウンディングボックスの比較（20点）
  const correctBounds = calculateBounds(characterData.strokeOrder);
  const userBounds = calculateUserBounds(userStrokes, canvasWidth, canvasHeight);

  if (correctBounds && userBounds) {
    const widthRatio = Math.min(
      userBounds.width / correctBounds.width,
      correctBounds.width / userBounds.width
    );
    const heightRatio = Math.min(
      userBounds.height / correctBounds.height,
      correctBounds.height / userBounds.height
    );
    const boundsScore = (widthRatio + heightRatio) / 2 * 20;
    score += boundsScore;
  }

  // 各画の長さの比較（15点）
  let lengthScore = 0;
  for (let i = 0; i < Math.min(characterData.strokeOrder.length, userStrokes.length); i++) {
    const correctLength = calculateStrokeLength(characterData.strokeOrder[i]);
    const normalizedPoints = normalizeUserPoints(userStrokes[i].points, canvasWidth, canvasHeight);
    const userLength = calculateNormalizedStrokeLength(normalizedPoints);
    if (correctLength > 0) {
      const ratio = Math.min(userLength / correctLength, correctLength / userLength);
      lengthScore += ratio;
    }
  }
  if (characterData.strokeOrder.length > 0) {
    score += (lengthScore / characterData.strokeOrder.length) * 15;
  }

  // 画の角度の比較（15点）
  let angleScore = 0;
  for (let i = 0; i < Math.min(characterData.strokeOrder.length, userStrokes.length); i++) {
    const correctAngle = calculateStrokeAngle(characterData.strokeOrder[i]);
    const normalizedPoints = normalizeUserPoints(userStrokes[i].points, canvasWidth, canvasHeight);
    const userAngle = calculateNormalizedStrokeAngle(normalizedPoints);
    const angleDiff = Math.abs(correctAngle - userAngle);
    const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff) / Math.PI;
    angleScore += (1 - normalizedDiff);
  }
  if (characterData.strokeOrder.length > 0) {
    score += (angleScore / characterData.strokeOrder.length) * 15;
  }

  return Math.min(50, score);
}

// バランス・美しさスコアを計算（50点満点）
export function calculateBalanceScore(
  characterData: WritingCharacter,
  userStrokes: StrokeData[],
  canvasWidth: number = 600,
  canvasHeight: number = 600
): number {
  let score = 0;

  // 中心位置の正確性（20点）
  const correctBounds = calculateBounds(characterData.strokeOrder);
  const userBounds = calculateUserBounds(userStrokes, canvasWidth, canvasHeight);

  if (correctBounds && userBounds) {
    const correctCenter = {
      x: correctBounds.x + correctBounds.width / 2,
      y: correctBounds.y + correctBounds.height / 2,
    };
    const userCenter = {
      x: userBounds.x + userBounds.width / 2,
      y: userBounds.y + userBounds.height / 2,
    };

    const centerDistance = distance(correctCenter, userCenter);
    const maxDistance = Math.sqrt(correctBounds.width ** 2 + correctBounds.height ** 2);
    const centerScore = Math.max(0, 1 - centerDistance / maxDistance) * 20;
    score += centerScore;
  }

  // 画のバランス（15点）
  // 各画の位置関係の評価
  let balanceScore = 0;
  if (characterData.strokeOrder.length > 1 && userStrokes.length > 1) {
    // 各画の中心位置のバランスを評価
    const correctCenters = characterData.strokeOrder.map(stroke => {
      const bounds = calculateBounds([stroke]);
      if (!bounds) return null;
      return {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
      };
    }).filter(center => center !== null) as Point[];

    const userCenters = userStrokes.map(stroke => {
      const normalizedPoints = normalizeUserPoints(stroke.points, canvasWidth, canvasHeight);
      if (normalizedPoints.length === 0) return null;
      const bounds = calculateUserBounds([{ ...stroke, points: normalizedPoints }], 300, 300);
      if (!bounds) return null;
      return {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
      };
    }).filter(center => center !== null) as Point[];

    if (correctCenters.length === userCenters.length && correctCenters.length > 0) {
      let totalBalance = 0;
      for (let i = 0; i < correctCenters.length; i++) {
        const dist = distance(correctCenters[i], userCenters[i]);
        const maxDist = Math.sqrt(300 ** 2 + 300 ** 2);
        totalBalance += Math.max(0, 1 - dist / maxDist);
      }
      balanceScore = (totalBalance / correctCenters.length) * 15;
    } else {
      balanceScore = 7.5; // 基本点
    }
  } else {
    balanceScore = 7.5; // 基本点
  }
  score += balanceScore;

  // 間隔の均等性（15点）
  // 画と画の間隔の評価
  let spacingScore = 0;
  if (characterData.strokeOrder.length > 1 && userStrokes.length > 1) {
    // 画間の距離を評価
    let totalSpacing = 0;
    let count = 0;
    for (let i = 0; i < Math.min(characterData.strokeOrder.length - 1, userStrokes.length - 1); i++) {
      const stroke1 = characterData.strokeOrder[i];
      const stroke2 = characterData.strokeOrder[i + 1];
      const userStroke1 = userStrokes[i];
      const userStroke2 = userStrokes[i + 1];
      
      if (stroke1 && stroke2 && userStroke1 && userStroke2) {
        const correctDist = distance(stroke1.endPoint, stroke2.startPoint);
        const normalizedPoints1 = normalizeUserPoints(userStroke1.points, canvasWidth, canvasHeight);
        const normalizedPoints2 = normalizeUserPoints(userStroke2.points, canvasWidth, canvasHeight);
        if (normalizedPoints1.length > 0 && normalizedPoints2.length > 0) {
          const userDist = distance(
            normalizedPoints1[normalizedPoints1.length - 1],
            normalizedPoints2[0]
          );
          if (correctDist > 0) {
            const ratio = Math.min(userDist / correctDist, correctDist / userDist);
            totalSpacing += ratio;
            count++;
          }
        }
      }
    }
    if (count > 0) {
      spacingScore = (totalSpacing / count) * 15;
    } else {
      spacingScore = 7.5; // 基本点
    }
  } else {
    spacingScore = 7.5; // 基本点
  }
  score += spacingScore;

  return Math.min(50, score);
}

// 総合スコアを計算（100点満点）
// 形とバランスを統合したスコアのみ
export function calculateTotalScore(
  characterData: WritingCharacter,
  userStrokes: StrokeData[],
  canvasWidth: number = 600,
  canvasHeight: number = 600
): {
  totalScore: number;
  shapeScore: number;
  balanceScore: number;
} {
  const shapeScore = calculateShapeScore(characterData, userStrokes, canvasWidth, canvasHeight);
  const balanceScore = calculateBalanceScore(characterData, userStrokes, canvasWidth, canvasHeight);

  // 形とバランスを統合（形50点、バランス50点で100点満点）
  const totalScore = shapeScore + balanceScore;

  return {
    totalScore: Math.round(totalScore),
    shapeScore: Math.round(shapeScore),
    balanceScore: Math.round(balanceScore),
  };
}

// ヘルパー関数: バウンディングボックスを計算
function calculateBounds(strokes: Stroke[]): { x: number; y: number; width: number; height: number } | null {
  if (strokes.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  strokes.forEach(stroke => {
    stroke.points.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function calculateUserBounds(
  strokes: StrokeData[],
  canvasWidth: number = 600,
  canvasHeight: number = 600
): { x: number; y: number; width: number; height: number } | null {
  if (strokes.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  strokes.forEach(stroke => {
    const normalizedPoints = normalizeUserPoints(stroke.points, canvasWidth, canvasHeight);
    normalizedPoints.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// ヘルパー関数: 画の長さを計算
function calculateStrokeLength(stroke: Stroke): number {
  let length = 0;
  for (let i = 1; i < stroke.points.length; i++) {
    length += distance(stroke.points[i - 1], stroke.points[i]);
  }
  return length;
}

function calculateUserStrokeLength(stroke: StrokeData): number {
  let length = 0;
  for (let i = 1; i < stroke.points.length; i++) {
    length += distance(stroke.points[i - 1], stroke.points[i]);
  }
  return length;
}

function calculateNormalizedStrokeLength(normalizedPoints: Point[]): number {
  let length = 0;
  for (let i = 1; i < normalizedPoints.length; i++) {
    length += distance(normalizedPoints[i - 1], normalizedPoints[i]);
  }
  return length;
}

// ヘルパー関数: 画の角度を計算
function calculateStrokeAngle(stroke: Stroke): number {
  if (stroke.points.length < 2) return 0;
  const start = stroke.points[0];
  const end = stroke.points[stroke.points.length - 1];
  return Math.atan2(end.y - start.y, end.x - start.x);
}

function calculateUserStrokeAngle(stroke: StrokeData): number {
  if (stroke.points.length < 2) return 0;
  const start = stroke.points[0];
  const end = stroke.points[stroke.points.length - 1];
  return Math.atan2(end.y - start.y, end.x - start.x);
}

function calculateNormalizedStrokeAngle(normalizedPoints: Point[]): number {
  if (normalizedPoints.length < 2) return 0;
  const start = normalizedPoints[0];
  const end = normalizedPoints[normalizedPoints.length - 1];
  return Math.atan2(end.y - start.y, end.x - start.x);
}

