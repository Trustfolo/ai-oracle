// lib/tarot.ts

export type TarotCard = {
  slug: string;
  nameJa: string;
  reversed: boolean;
  imageUrl: string;
};

/* ========= 画像対応 ========= */

export const TAROT_IMAGES: Record<string, string> = {
  fool: "/tarot/01_fool.png",
  magician: "/tarot/02_magician.png",
  high_priestess: "/tarot/03_high_priestess.png",
  empress: "/tarot/04_empress.png",
  emperor: "/tarot/05_emperor.png",
  hierophant: "/tarot/06_hierophant.png",
  lovers: "/tarot/07_lovers.png",
  chariot: "/tarot/08_chariot.png",
  strength: "/tarot/09_strength.png",
  hermit: "/tarot/10_hermit.png",
  wheel_of_fortune: "/tarot/11_wheel_of_fortune.png",
  justice: "/tarot/12_justice.png",
  hanged_man: "/tarot/13_hanged_man.png",
  death: "/tarot/14_death.png",
  temperance: "/tarot/15_temperance.png",
  devil: "/tarot/16_devil.png",
  tower: "/tarot/17_tower.png",
  star: "/tarot/18_star.png",
  moon: "/tarot/19_moon.png",
  sun: "/tarot/20_sun.png",
  judgement: "/tarot/21_judgement.png",
  world: "/tarot/22_world.png",
};

/* ========= 大アルカナ定義 ========= */

const TAROT_CARDS = [
  { slug: "fool", nameJa: "愚者" },
  { slug: "magician", nameJa: "魔術師" },
  { slug: "high_priestess", nameJa: "女教皇" },
  { slug: "empress", nameJa: "女帝" },
  { slug: "emperor", nameJa: "皇帝" },
  { slug: "hierophant", nameJa: "教皇" },
  { slug: "lovers", nameJa: "恋人" },
  { slug: "chariot", nameJa: "戦車" },
  { slug: "strength", nameJa: "力" },
  { slug: "hermit", nameJa: "隠者" },
  { slug: "wheel_of_fortune", nameJa: "運命の輪" },
  { slug: "justice", nameJa: "正義" },
  { slug: "hanged_man", nameJa: "吊るされた男" },
  { slug: "death", nameJa: "死神" },
  { slug: "temperance", nameJa: "節制" },
  { slug: "devil", nameJa: "悪魔" },
  { slug: "tower", nameJa: "塔" },
  { slug: "star", nameJa: "星" },
  { slug: "moon", nameJa: "月" },
  { slug: "sun", nameJa: "太陽" },
  { slug: "judgement", nameJa: "審判" },
  { slug: "world", nameJa: "世界" },
];

/* ========= カード抽選 ========= */

export function pickTarotCards(n: number): TarotCard[] {
  const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, n).map((card) => ({
    slug: card.slug,
    nameJa: card.nameJa,
    reversed: Math.random() < 0.5,
    imageUrl: TAROT_IMAGES[card.slug],
  }));
}
