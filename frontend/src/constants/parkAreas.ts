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
    'パーク内',
    'パーク外',
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
  tdl: [
    'ワールドバザール',
    'アドベンチャーランド',
    'ウエスタンランド',
    'クリッターカントリー',
    'ファンタジーランド',
    'トゥーンタウン',
    'トゥモローランド',
    'パーク内',
    'パーク外',
  ],
  tds: [
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
export function getParkByArea(area: string): 'disneyland' | 'disneysea' | 'tdl' | 'tds' | null {
  if (PARK_AREAS.disneyland.includes(area as any)) {
    return 'disneyland';
  }
  if (PARK_AREAS.disneysea.includes(area as any)) {
    return 'disneysea';
  }
  if (PARK_AREAS.tdl.includes(area as any)) {
    return 'tdl';
  }
  if (PARK_AREAS.tds.includes(area as any)) {
    return 'tds';
  }
  return null;
}
