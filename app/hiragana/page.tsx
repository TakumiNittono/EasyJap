'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { hiraganaList } from '@/lib/stroke-data/hiragana';
import { UserProgress, MasteryLevel } from '@/types';
import { loadUserProgress } from '@/lib/storage';

export default function HiraganaPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const userProgress = loadUserProgress();
    setProgress(userProgress);
  }, []);

  const getMasteryColor = (character: string) => {
    if (!progress) return 'bg-gray-200';
    const charProgress = progress.characterProgress[character];
    if (!charProgress) return 'bg-gray-200';
    
    switch (charProgress.masteryLevel) {
      case MasteryLevel.Beginner:
        return 'bg-orange-200 hover:bg-orange-300';
      case MasteryLevel.Intermediate:
        return 'bg-blue-200 hover:bg-blue-300';
      case MasteryLevel.Advanced:
        return 'bg-green-200 hover:bg-green-300';
      default:
        return 'bg-gray-200';
    }
  };

  const getMasteryLabel = (character: string) => {
    if (!progress) return 'Not Practiced';
    const charProgress = progress.characterProgress[character];
    if (!charProgress) return 'Not Practiced';
    
    switch (charProgress.masteryLevel) {
      case MasteryLevel.Beginner:
        return 'Beginner';
      case MasteryLevel.Intermediate:
        return 'Intermediate';
      case MasteryLevel.Advanced:
        return 'Advanced';
      default:
        return 'Not Practiced';
    }
  };

  const filteredCharacters = hiraganaList.filter(char =>
    char.includes(searchQuery)
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-3 sm:p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <Link
            href="/"
            className="text-primary active:opacity-70 mb-2 inline-block text-sm sm:text-base"
          >
            ← Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 sm:mb-2">
            Select Hiragana
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Choose a character to practice</p>
        </header>

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <input
            type="text"
            placeholder="Search character..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        {/* 文字グリッド */}
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2 sm:gap-3 md:gap-4">
          {filteredCharacters.map((character) => {
            const charProgress = progress?.characterProgress[character];
            return (
              <Link
                key={character}
                href={`/hiragana/${encodeURIComponent(character)}/trace`}
                className={`${getMasteryColor(character)} rounded-lg p-3 sm:p-4 text-center transition-all active:scale-95 shadow-md min-h-[80px] sm:min-h-[100px] flex flex-col justify-center`}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">
                  {character}
                </div>
                <div className="text-xs text-gray-600">
                  {getMasteryLabel(character)}
                </div>
                {charProgress && (
                  <div className="text-xs text-gray-500 mt-1">
                    Best: {charProgress.bestScore} pts
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg p-4 shadow-md">
          <h3 className="font-bold mb-2 text-sm sm:text-base">Mastery Level</h3>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <span className="text-sm">Not Practiced</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-200 rounded"></div>
              <span className="text-sm">Beginner</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-200 rounded"></div>
              <span className="text-sm">Intermediate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-200 rounded"></div>
              <span className="text-sm">Advanced</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

