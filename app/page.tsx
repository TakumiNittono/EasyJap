'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserProgress, MasteryLevel } from '@/types';
import { loadUserProgress, createInitialUserProgress } from '@/lib/storage';

export default function Home() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const userProgress = loadUserProgress() || createInitialUserProgress();
    setProgress(userProgress);
  }, []);

  const totalCharacters = 92; // ひらがな46 + カタカナ46
  const masteredCharacters = progress 
    ? Object.values(progress.characterProgress).filter(
        cp => cp.masteryLevel === MasteryLevel.Advanced
      ).length
    : 0;
  const progressPercentage = Math.round((masteredCharacters / totalCharacters) * 100);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-3 sm:p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 sm:mb-2">
            Japanese Writing Master
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Master Japanese Writing from ZERO</p>
        </header>

        {/* Progress Summary Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Progress Summary</h2>
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
            {/* 円形プログレス */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32">
              <svg className="transform -rotate-90 w-24 h-24 sm:w-32 sm:h-32">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  className="sm:hidden"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  className="sm:hidden"
                  stroke="#007AFF"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercentage / 100)}`}
                  strokeLinecap="round"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  className="hidden sm:block"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  className="hidden sm:block"
                  stroke="#007AFF"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-primary">
                  {progressPercentage}%
                </span>
              </div>
            </div>

            {/* Statistics */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
              <div className="text-center sm:text-left">
                <p className="text-gray-600 text-xs sm:text-sm">Mastered Characters</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {masteredCharacters} / {totalCharacters}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-gray-600 text-xs sm:text-sm">Total Practice Time</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {progress ? Math.round(progress.totalPracticeTime / 60) : 0} min
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-gray-600 text-xs sm:text-sm">Consecutive Days</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {progress?.consecutiveDays || 0} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Link
            href="/hiragana"
            className="bg-primary text-white rounded-xl p-5 sm:p-6 text-center active:bg-blue-600 transition-colors shadow-lg min-h-[80px] sm:min-h-[120px] flex flex-col justify-center"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Hiragana</h3>
            <p className="text-sm sm:text-base text-blue-100">Practice Hiragana</p>
          </Link>
          <Link
            href="/katakana"
            className="bg-secondary text-white rounded-xl p-5 sm:p-6 text-center active:bg-green-600 transition-colors shadow-lg min-h-[80px] sm:min-h-[120px] flex flex-col justify-center"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Katakana</h3>
            <p className="text-sm sm:text-base text-green-100">Practice Katakana</p>
          </Link>
          <Link
            href="/progress"
            className="bg-accent text-white rounded-xl p-5 sm:p-6 text-center active:bg-orange-600 transition-colors shadow-lg min-h-[80px] sm:min-h-[120px] flex flex-col justify-center"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">View Progress</h3>
            <p className="text-sm sm:text-base text-orange-100">Check detailed progress</p>
          </Link>
        </div>

        {/* Recent Practice */}
        {progress && Object.keys(progress.characterProgress).length > 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Recent Practice</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(progress.characterProgress)
                .sort((a, b) => {
                  // Handle both Date objects and strings
                  const dateA = a[1].lastPracticeDate 
                    ? (a[1].lastPracticeDate instanceof Date 
                        ? a[1].lastPracticeDate.getTime() 
                        : new Date(a[1].lastPracticeDate).getTime())
                    : 0;
                  const dateB = b[1].lastPracticeDate 
                    ? (b[1].lastPracticeDate instanceof Date 
                        ? b[1].lastPracticeDate.getTime() 
                        : new Date(b[1].lastPracticeDate).getTime())
                    : 0;
                  return dateB - dateA;
                })
                .slice(0, 3)
                .map(([characterId, charProgress]) => (
                  <div
                    key={characterId}
                    className="border-2 border-gray-200 rounded-lg p-4 sm:p-5 active:border-primary transition-colors"
                  >
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-gray-600">Best Score for {characterId}</p>
                      <p className="text-xl sm:text-2xl font-bold text-primary mt-2">
                        {charProgress.bestScore} pts
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

