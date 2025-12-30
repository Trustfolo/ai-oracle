export type Genre = {
  slug: string;
  title: string;
  description: string;
  badge?: "free" | "premium" | "soon";
};

export const GENRES: Genre[] = [
  { slug: "oracle", title: "AIオラクル", description: "今日の指針を静かに整える", badge: "free" },

  { slug: "love", title: "AI恋愛占い", description: "恋の流れ・距離感・行動のヒント", badge: "soon" },
  { slug: "palm", title: "AI手相占い", description: "手相から読み解く傾向と整え方", badge: "soon" },

  { slug: "tarot", title: "AIタロット", description: "問いに対してカードで視点を得る", badge: "soon" },
  { slug: "zodiac", title: "AI星座占い", description: "12星座の今日の流れを読む", badge: "soon" },
  { slug: "astro", title: "AI占星術", description: "運気を“行動設計”に落とし込む", badge: "soon" },

  { slug: "4pillars", title: "AI四柱推命", description: "命式ベースで傾向と過ごし方", badge: "soon" },
  { slug: "numerology", title: "AI数秘術", description: "数字で思考と行動のリズムを整える", badge: "soon" },
  { slug: "name", title: "AI姓名判断", description: "名前の印象と方向性を言語化", badge: "soon" },

  { slug: "fengshui", title: "AI風水", description: "空間の整え方を具体行動に変える", badge: "soon" },
  { slug: "dream", title: "AI夢占い", description: "夢を“内面の整理”として読み解く", badge: "soon" },

  { slug: "compat", title: "AI相性占い", description: "関係性の“詰まり”をほどく視点", badge: "soon" },
  { slug: "career", title: "AI仕事占い", description: "選択・優先順位・集中点を整える", badge: "soon" },
  { slug: "money", title: "AI金運占い", description: "金銭行動を現実的に整える", badge: "soon" },

  { slug: "wellness", title: "AI健康運", description: "生活リズムの整え方（医療判断なし）", badge: "soon" },

  { slug: "luck", title: "AI運気・厄除け", description: "流れを整えるルーティン提案", badge: "soon" },
  { slug: "color", title: "AIラッキーカラー", description: "今日の色で“気分と行動”を整える", badge: "soon" },
  { slug: "number", title: "AIラッキーナンバー", description: "行動のスイッチとして使う", badge: "soon" },
];

export const GENRE_MAP: Record<string, Genre> = GENRES.reduce(
  (acc, g) => {
    acc[g.slug.toLowerCase()] = g;
    return acc;
  },
  {} as Record<string, Genre>
);
