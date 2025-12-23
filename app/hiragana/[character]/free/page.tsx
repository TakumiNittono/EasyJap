'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Point, StrokeData, WritingCharacter, PracticeRecord, MasteryLevel } from '@/types';
import { hiraganaCharacters } from '@/lib/stroke-data/hiragana';
import { calculateTotalScore } from '@/lib/scoring';
import { savePracticeRecord, loadUserProgress, saveUserProgress, createInitialUserProgress } from '@/lib/storage';

export default function FreePracticePage({
  params,
}: {
  params: { character: string };
}) {
  const character = decodeURIComponent(params.character);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showMasu, setShowMasu] = useState(false);
  const [strokeData, setStrokeData] = useState<StrokeData[]>([]);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<Point[]>([]);
  const [currentStrokeNumber, setCurrentStrokeNumber] = useState(1);
  const [characterData, setCharacterData] = useState<WritingCharacter | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [scoreResult, setScoreResult] = useState<{
    totalScore: number;
    shapeScore: number;
    balanceScore: number;
  } | null>(null);
  const [practiceStartTime] = useState(Date.now());

  useEffect(() => {
    // 文字データを取得
    const found = hiraganaCharacters.find(c => c.character === character);
    if (found) {
      setCharacterData(found);
    }
  }, [character]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    drawCanvas(ctx, canvas.width, canvas.height);
  }, [showGrid, showMasu, strokeData, currentStrokePoints]);

  const drawCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 背景を白に
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // グリッドまたはマス目の描画
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    if (showMasu) {
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      const masuSize = Math.min(width, height) * 0.8;
      const startX = (width - masuSize) / 2;
      const startY = (height - masuSize) / 2;
      ctx.strokeRect(startX, startY, masuSize, masuSize);
    }

    // 完了した画を描画
    strokeData.forEach((stroke) => {
      if (stroke.points.length > 1) {
        ctx.strokeStyle = '#007AFF';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    });

    // 現在描画中の画
    if (currentStrokePoints.length > 1) {
      ctx.strokeStyle = '#007AFF';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(currentStrokePoints[0].x, currentStrokePoints[0].y);
      for (let i = 1; i < currentStrokePoints.length; i++) {
        ctx.lineTo(currentStrokePoints[i].x, currentStrokePoints[i].y);
      }
      ctx.stroke();
    }
  };

  const getPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getPoint(e);
    setCurrentStrokePoints([point]);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawCanvas(ctx, canvas.width, canvas.height);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const point = getPoint(e);
    setCurrentStrokePoints(prev => [...prev, point]);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawCanvas(ctx, canvas.width, canvas.height);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // ストロークデータを保存
    if (currentStrokePoints.length > 0) {
      const newStroke: StrokeData = {
        strokeNumber: currentStrokeNumber,
        points: [...currentStrokePoints],
        timestamp: new Date(),
      };
      setStrokeData(prev => [...prev, newStroke]);
      setCurrentStrokeNumber(prev => prev + 1);
      setCurrentStrokePoints([]);
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawCanvas(ctx, canvas.width, canvas.height);
    setStrokeData([]);
    setCurrentStrokePoints([]);
    setCurrentStrokeNumber(1);
    setShowScore(false);
    setScoreResult(null);
  };

  const handleScore = () => {
    if (!characterData || strokeData.length === 0) {
      alert('文字を書いてから採点してください');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const score = calculateTotalScore(characterData, strokeData, canvas.width, canvas.height);
    setScoreResult(score);
    setShowScore(true);

    // 練習記録を保存
    const practiceTime = Math.floor((Date.now() - practiceStartTime) / 1000);
    const record: PracticeRecord = {
      characterId: character,
      practiceDate: new Date(),
      mode: 'beautiful',
      score: score.totalScore,
      strokeOrderScore: 0, // 筆順スコアは使用しない
      shapeScore: score.shapeScore,
      balanceScore: score.balanceScore,
      practiceTime,
      strokeData,
    };

    savePracticeRecord(record);

    // ユーザー進捗を更新
    const progress = loadUserProgress() || createInitialUserProgress();
    const charProgress = progress.characterProgress[character] || {
      masteryLevel: MasteryLevel.Beginner,
      bestScore: 0,
      practiceCount: 0,
      lastPracticeDate: null,
      averageScore: 0,
      strokeOrderAccuracy: 0,
    };

    charProgress.bestScore = Math.max(charProgress.bestScore, score.totalScore);
    charProgress.practiceCount += 1;
    charProgress.lastPracticeDate = new Date();
    charProgress.averageScore = (charProgress.averageScore * (charProgress.practiceCount - 1) + score.totalScore) / charProgress.practiceCount;
    charProgress.strokeOrderAccuracy = 0; // 筆順スコアは使用しない

    // 習熟度レベルの更新
    if (score.totalScore >= 60) {
      charProgress.masteryLevel = MasteryLevel.Advanced;
    } else if (score.totalScore >= 50) {
      charProgress.masteryLevel = MasteryLevel.Intermediate;
    } else {
      charProgress.masteryLevel = MasteryLevel.Beginner;
    }

    progress.characterProgress[character] = charProgress;
    progress.totalPracticeTime += practiceTime;
    progress.totalPracticeCount += 1;
    
    // 連続練習日数の更新（更新前に前回の練習日を保存）
    const previousPracticeDate = progress.lastPracticeDate ? new Date(progress.lastPracticeDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (previousPracticeDate) {
      previousPracticeDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - previousPracticeDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // 同じ日に複数回練習した場合は連続日数を増やさない
        // consecutiveDaysはそのまま
      } else if (diffDays === 1) {
        // 連続して練習した場合
        progress.consecutiveDays += 1;
      } else {
        // 連続が途切れた場合、今日から1日目としてリセット
        progress.consecutiveDays = 1;
      }
    } else {
      // 初回練習の場合は1日目
      progress.consecutiveDays = 1;
    }
    
    // 最後に練習日を更新
    progress.lastPracticeDate = new Date();

    saveUserProgress(progress);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-6">
          <Link
            href="/hiragana"
            className="text-primary hover:underline mb-2 inline-block"
          >
            ← ひらがな一覧に戻る
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
            {character} の自由書き練習
          </h1>
        </header>

        {/* キャンバスエリア */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="aspect-square max-w-2xl mx-auto">
            <canvas
              ref={canvasRef}
              className="w-full h-full border-2 border-gray-200 rounded-lg touch-none bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          {/* コントロール */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 flex-wrap">
            <button
              onClick={resetCanvas}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              🔄 リセット
            </button>
            <button
              onClick={() => {
                setShowGrid(!showGrid);
                resetCanvas();
              }}
              className={`px-6 py-3 rounded-lg transition-colors ${
                showGrid
                  ? 'bg-primary text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {showGrid ? '✓ グリッド表示中' : 'グリッド表示'}
            </button>
            <button
              onClick={() => {
                setShowMasu(!showMasu);
                resetCanvas();
              }}
              className={`px-6 py-3 rounded-lg transition-colors ${
                showMasu
                  ? 'bg-primary text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {showMasu ? '✓ マス目表示中' : 'マス目表示'}
            </button>
            <button
              onClick={handleScore}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              ✓ 採点する
            </button>
          </div>
        </div>

        {/* 採点結果表示 */}
        {showScore && scoreResult && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">
              採点結果
            </h3>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-green-600">
                {scoreResult.totalScore}点
              </div>
              <p className="text-gray-600 mt-2">総合スコア</p>
            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">形の正確性</p>
                  <p className="text-2xl font-bold text-primary">
                    {scoreResult.shapeScore} / 50
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">バランス・美しさ</p>
                  <p className="text-2xl font-bold text-primary">
                    {scoreResult.balanceScore} / 50
                  </p>
                </div>
              </div>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={resetCanvas}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                もう一度練習する
              </button>
              <Link
                href="/hiragana"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                文字選択に戻る
              </Link>
            </div>
          </div>
        )}

        {/* ヒント */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            💡 <strong>ヒント:</strong> ガイドなしで自由に書いて練習してください。
            グリッドやマス目を表示して、文字のバランスを確認できます。
          </p>
        </div>
      </div>
    </main>
  );
}

