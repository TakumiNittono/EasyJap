import { WritingCharacter } from '@/types';
import { createCharacterData } from './utils';
import { generateKatakanaStrokes } from './generator';

// カタカナの基本データ
// 全46文字の筆順データを生成

// 全カタカナ文字のリスト（50音順）
export const katakanaList = [
  'ア', 'イ', 'ウ', 'エ', 'オ',
  'カ', 'キ', 'ク', 'ケ', 'コ',
  'サ', 'シ', 'ス', 'セ', 'ソ',
  'タ', 'チ', 'ツ', 'テ', 'ト',
  'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
  'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
  'マ', 'ミ', 'ム', 'メ', 'モ',
  'ヤ', 'ユ', 'ヨ',
  'ラ', 'リ', 'ル', 'レ', 'ロ',
  'ワ', 'ヲ', 'ン',
];

export const katakanaCharacters: WritingCharacter[] = katakanaList.map(character => {
  const strokes = generateKatakanaStrokes(character);
  return createCharacterData(character, 'katakana', strokes);
});

