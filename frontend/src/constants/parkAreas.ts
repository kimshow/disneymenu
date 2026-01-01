/**
 * パークとエリアの対応関係
 */
export const PARK_AREAS = {
  disneyland: [
    'ワールドバザール',
    'アドベンチャーランド',
    'ウエスタンランド',
    'クリッターカントリー',
    'ファンタジーランド',
    'トゥーンタウン',
    'トゥモローランド',
  ],
  disneysea: [
    'メディテレーニアンハーバー',
    'アメリカンウォーターフロント',
    'ポートディスカバリー',
    'ロストリバーデルタ',
    'アラビアンコースト',
    'マーメイドラグーン',
    'ミステリアスアイランド',
    'ファンタジースプリングス',
  ],
} as const;

/**
 * エリアからパークを判定
 */
export function getParkByArea(area: string): 'disneyland' | 'disneysea' | null {
  if (PARK_AREAS.disneyland.includes(area as any)) {
    return 'disneyland';
  }
  if (PARK_AREAS.disneysea.includes(area as any)) {
    return 'disneysea';
  }
  return null;
}
