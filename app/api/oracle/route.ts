// app/api/oracle/route.ts

import { NextResponse } from "next/server";
import { GENRE_MAP } from "../../../lib/genres";
import { pickTarotCards } from "../../../lib/tarot";

/* ========= utility ========= */

function normalize(input: unknown) {
  const raw = String(input ?? "");
  try {
    return decodeURIComponent(raw).trim().toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ========= 共通ルール ========= */

function baseRules() {
  return `
以下のルールを必ず守ってください。
・未来を断定しない
・恐怖や不安を煽らない
・医療・法律・投資の判断をしない
・占いは「思考と行動の整理」に使う
・第三者を操作・支配する助言をしない
`;
}

/* ========= FREE ========= */

function commonFree(today: string) {
  return `
あなたは「AIオラクル（無料）」です。
今日は ${today} です。

${baseRules()}
`;
}

/* ========= TAROT ========= */

type Tier = "free" | "premium";

function tarotPrompt(
  today: string,
  _tier: Tier,
  drawn: ReturnType<typeof pickTarotCards>,
  q?: string
) {
  const line = (i: number, role: string) => {
    const c = drawn[i];
    const pos = c.reversed ? "逆位置" : "正位置";
    return `${i + 1}) ${role}：${c.nameJa}（${pos}）`;
  };

  return `
あなたは「AIタロット」です。
今日は ${today} です。

ユーザーの問い：
「${q || "（質問は未入力）"}」

【引いたカード】
${line(0, "過去")}
${line(1, "現在")}
${line(2, "助言")}

${baseRules()}
`;
}

/* ========= main ========= */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const productRaw = searchParams.get("product") ?? "oracle";
  const tierRaw = searchParams.get("tier") ?? "free";
  const qRaw = searchParams.get("q") ?? "";

  const product = normalize(productRaw);
  const tier = normalize(tierRaw) === "premium" ? "premium" : "free";
  const q = qRaw.trim();

  const safeProduct = GENRE_MAP[product] ? product : "oracle";
  const today = todayISO();

  let prompt = "";
  let drawn: ReturnType<typeof pickTarotCards> | null = null;

  if (safeProduct === "tarot") {
    drawn = pickTarotCards(3);
    prompt = tarotPrompt(today, tier, drawn, q);
  } else {
    prompt = commonFree(today);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing" },
      { status: 500 }
    );
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: safeProduct === "tarot" ? 0.7 : 0.9,
    }),
  });

  const json = await res.json();
  const text = json.choices?.[0]?.message?.content ?? "";

  return NextResponse.json({
    text,
    product: safeProduct,
    tier,
    drawnCards:
      safeProduct === "tarot" && drawn
        ? drawn.map((c, i) => ({
            index: i,
            role: i === 0 ? "過去" : i === 1 ? "現在" : "助言",
            slug: c.slug, // ★ 追加：将来拡張に効く
            nameJa: c.nameJa,
            position: c.reversed ? "逆位置" : "正位置",
            reversed: Boolean(c.reversed),
            imageUrl: c.imageUrl, // ★ 画像
          }))
        : null,
  });
}
