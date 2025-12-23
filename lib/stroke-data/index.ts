// 筆順データのエクスポート
export { hiraganaCharacters, hiraganaList } from './hiragana';
export { katakanaCharacters, katakanaList } from './katakana';
export { createCharacterData, generateSimpleStrokeData } from './utils';

// 文字IDから文字データを取得するヘルパー関数
import { WritingCharacter } from '@/types';
import { hiraganaCharacters } from './hiragana';
import { katakanaCharacters } from './katakana';

export function getCharacterData(character: string, lessonType: 'hiragana' | 'katakana'): WritingCharacter | null {
  if (lessonType === 'hiragana') {
    return hiraganaCharacters.find(c => c.character === character) || null;
  } else {
    return katakanaCharacters.find(c => c.character === character) || null;
  }
}

// 全文字データを取得
export function getAllCharacters(): WritingCharacter[] {
  return [...hiraganaCharacters, ...katakanaCharacters];
}


