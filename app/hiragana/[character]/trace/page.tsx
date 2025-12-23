'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Point, StrokeData, WritingCharacter, PracticeRecord, MasteryLevel } from '@/types';
import { hiraganaCharacters, hiraganaList } from '@/lib/stroke-data/hiragana';
import { calculateTotalScore } from '@/lib/scoring';
import { savePracticeRecord, loadUserProgress, saveUserProgress, createInitialUserProgress } from '@/lib/storage';

export default function TracePracticePage({
  params,
}: {
  params: { character: string };
}) {
  const router = useRouter();
  const character = decodeURIComponent(params.character);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 前後の文字を取得
  const currentIndex = hiraganaList.indexOf(character);
  const prevCharacter = currentIndex > 0 ? hiraganaList[currentIndex - 1] : null;
  const nextCharacter = currentIndex >= 0 && currentIndex < hiraganaList.length - 1 ? hiraganaList[currentIndex + 1] : null;
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [strokeData, setStrokeData] = useState<StrokeData[]>([]);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<Point[]>([]);
  const [characterData, setCharacterData] = useState<WritingCharacter | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [scoreResult, setScoreResult] = useState<{
    totalScore: number;
    shapeScore: number;
    balanceScore: number;
  } | null>(null);
  const [practiceStartTime, setPracticeStartTime] = useState(Date.now());

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

    // Canvas設定
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // ガイドラインの描画
    drawGuide(ctx, canvas.width, canvas.height);
  }, [character, characterData, currentStroke, strokeData, currentStrokePoints]);

  const drawGuide = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    if (!characterData) return;

    // スケールを計算（300x300の座標系をキャンバスサイズに合わせる）
    const scale = Math.min(width, height) / 300;
    const offsetX = (width - 300 * scale) / 2;
    const offsetY = (height - 300 * scale) / 2;

    // 背景に文字全体を薄く表示（なぞるためのガイド）
    ctx.font = `${Math.min(width, height) * 0.6}px "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
    ctx.fillStyle = '#d1d5db';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.4;
    ctx.fillText(character, width / 2, height / 2);
    ctx.globalAlpha = 1.0;

    // 完了した画を描画（緑色）
    strokeData.forEach((stroke, index) => {
      if (stroke.points.length > 1) {
        ctx.strokeStyle = '#34C759';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    });


    // 現在描画中の画（ユーザーが書いている線）
    if (currentStrokePoints.length > 1) {
      ctx.strokeStyle = '#007AFF';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentStrokePoints[0].x, currentStrokePoints[0].y);
      for (let i = 1; i < currentStrokePoints.length; i++) {
        ctx.lineTo(currentStrokePoints[i].x, currentStrokePoints[i].y);
      }
      ctx.stroke();
    }
  };

  const getPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
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
    e.stopPropagation();
    
    // 既に全ての画を完了している場合は開始しない
    if (characterData && currentStroke >= characterData.totalStrokes) {
      return;
    }

    setIsDrawing(true);
    const point = getPoint(e);
    setCurrentStrokePoints([point]);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGuide(ctx, canvas.width, canvas.height);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();

    const point = getPoint(e);
    setCurrentStrokePoints(prev => [...prev, point]);

    // リアルタイムで描画を更新
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      drawGuide(ctx, canvas.width, canvas.height);
    });
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isDrawing) return;
    setIsDrawing(false);

    // ストロークデータを保存
    if (currentStrokePoints.length > 0 && characterData && currentStroke < characterData.totalStrokes) {
      const newStroke: StrokeData = {
        strokeNumber: currentStroke + 1,
        points: [...currentStrokePoints],
        timestamp: new Date(),
      };
      setStrokeData(prev => [...prev, newStroke]);
      setCurrentStroke(prev => prev + 1);
      setCurrentStrokePoints([]);

      // キャンバスを再描画
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawGuide(ctx, canvas.width, canvas.height);
        }
      }
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGuide(ctx, canvas.width, canvas.height);
    setStrokeData([]);
    setCurrentStroke(0);
    setCurrentStrokePoints([]);
    setShowScore(false);
    setScoreResult(null);
    setPracticeStartTime(Date.now()); // Reset practice start time
  };

  const handleScore = () => {
    if (!characterData || strokeData.length === 0) {
      alert('Please write the character before scoring');
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
      mode: 'strokeOrder',
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
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-3 sm:p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <Link
            href="/hiragana"
            className="text-primary active:opacity-70 mb-2 inline-block text-sm sm:text-base"
          >
            ← Back to Hiragana List
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">
            Tracing Practice: {character}
          </h1>
        </header>

        {/* キャンバスエリア */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <button
              onClick={resetCanvas}
              className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg active:bg-gray-300 transition-colors text-sm font-medium"
            >
              🔄 Reset
            </button>
            <button
              onClick={handleScore}
              className="px-3 py-2 bg-primary text-white rounded-lg active:bg-blue-600 transition-colors text-sm font-medium"
            >
              ✓ Score
            </button>
          </div>

          <div className="aspect-square max-w-full mx-auto">
            <canvas
              ref={canvasRef}
              className="w-full h-full border-2 border-gray-200 rounded-lg touch-none select-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onTouchCancel={stopDrawing}
              style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
            />
          </div>

          {/* 前後の文字へのナビゲーション */}
          <div className="flex items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6 px-2 sm:px-4">
            {prevCharacter ? (
              <Link
                href={`/hiragana/${encodeURIComponent(prevCharacter)}/trace`}
                className="px-4 sm:px-6 py-3 bg-gray-200 text-gray-800 rounded-lg active:bg-gray-300 transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[48px]"
              >
                ← {prevCharacter}
              </Link>
            ) : (
              <div></div>
            )}
            {nextCharacter ? (
              <Link
                href={`/hiragana/${encodeURIComponent(nextCharacter)}/trace`}
                className="px-4 sm:px-6 py-3 bg-primary text-white rounded-lg active:bg-blue-600 transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[48px]"
              >
                {nextCharacter} →
              </Link>
            ) : (
              <div></div>
            )}
          </div>

          {/* Progress Display */}
          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Completed strokes: {currentStroke} / {characterData?.totalStrokes || 0}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${characterData ? (currentStroke / characterData.totalStrokes) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Score Result Display */}
          {showScore && scoreResult && (
            <div className="mt-4 sm:mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-3 sm:mb-4 text-center">
                Score Result
              </h3>
              <div className="text-center mb-3 sm:mb-4">
                <div className="text-4xl sm:text-5xl font-bold text-green-600">
                  {scoreResult.totalScore} pts
                </div>
                <p className="text-sm sm:text-base text-gray-600 mt-2">Total Score</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">Shape Accuracy</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    {scoreResult.shapeScore} / 50
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">Balance & Beauty</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    {scoreResult.balanceScore} / 50
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={resetCanvas}
                  className="px-6 py-4 sm:py-3 bg-primary text-white rounded-lg active:bg-blue-600 transition-colors text-base font-medium min-h-[48px]"
                >
                  Practice Again
                </button>
                <Link
                  href="/hiragana"
                  className="px-6 py-4 sm:py-3 bg-gray-200 text-gray-800 rounded-lg active:bg-gray-300 transition-colors text-base font-medium text-center min-h-[48px] flex items-center justify-center"
                >
                  Back to Character Selection
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Hint */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 sm:p-4">
          <p className="text-sm sm:text-base text-blue-800">
            💡 <strong>Hint:</strong> Follow the guidelines and write with the correct stroke order.
            You can draw with a mouse or touch.
          </p>
        </div>
      </div>
    </main>
  );
}

