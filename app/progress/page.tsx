'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserProgress, MasteryLevel } from '@/types';
import { loadUserProgress } from '@/lib/storage';
import { hiraganaList } from '@/lib/stroke-data/hiragana';
import { katakanaList } from '@/lib/stroke-data/katakana';

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const userProgress = loadUserProgress();
    setProgress(userProgress);
  }, []);

  if (!progress) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-600">データがありません</p>
        </div>
      </main>
    );
  }

  const totalCharacters = 92;
  const masteredCharacters = Object.values(progress.characterProgress).filter(
    cp => cp.masteryLevel === MasteryLevel.Advanced
  ).length;
  const progressPercentage = Math.round((masteredCharacters / totalCharacters) * 100);

  const hiraganaProgress = hiraganaList.filter(char =>
    progress.characterProgress[char]
  ).length;
  const katakanaProgress = katakanaList.filter(char =>
    progress.characterProgress[char]
  ).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-6">
          <Link
            href="/"
            className="text-primary hover:underline mb-2 inline-block"
          >
            ← ホームに戻る
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
            進捗・統計
          </h1>
        </header>

        {/* 全体進捗 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">全体進捗</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#007AFF"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {progressPercentage}%
                </span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 text-sm">習得済み文字</p>
                <p className="text-3xl font-bold text-primary">
                  {masteredCharacters} / {totalCharacters}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">総練習時間</p>
                <p className="text-3xl font-bold text-primary">
                  {Math.round(progress.totalPracticeTime / 60)}分
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">総練習回数</p>
                <p className="text-3xl font-bold text-primary">
                  {progress.totalPracticeCount}回
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* レッスンタイプ別進捗 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">ひらがな</h3>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>進捗</span>
                <span>{hiraganaProgress} / {hiraganaList.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-primary h-4 rounded-full"
                  style={{ width: `${(hiraganaProgress / hiraganaList.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">カタカナ</h3>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>進捗</span>
                <span>{katakanaProgress} / {katakanaList.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-secondary h-4 rounded-full"
                  style={{ width: `${(katakanaProgress / katakanaList.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">統計情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">連続練習日数</p>
              <p className="text-2xl font-bold text-primary">
                {progress.consecutiveDays}日
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">初回起動日</p>
              <p className="text-lg font-semibold">
                {new Date(progress.firstLaunchDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
            {progress.lastPracticeDate && (
              <div>
                <p className="text-gray-600 text-sm">最後の練習日</p>
                <p className="text-lg font-semibold">
                  {new Date(progress.lastPracticeDate).toLocaleDateString('ja-JP')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}



