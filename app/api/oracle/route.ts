import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "free"; // 将来用（今は free 固定）

  const today = new Date().toISOString().slice(0, 10);

  /* =========================
     プロンプト定義
     ========================= */

  // 【B】無料用プロンプト（短く・強く）
  const FREE_PROMPT = `
あなたは「AIオラクル」です。

今日は ${today} です。

今日は日付に基づき、
その人の思考や行動を静かに整える
「今日の指針」だけを伝えてください。

以下のルールを厳守してください。
・未来を断定しない
・恐怖や不安を煽らない
・医療・法律・投資の判断をしない

出力形式は必ず以下のみ：

【今日の指針】
（3〜5行。短く、余韻を残す）

【今日のキーワード】
（1語）

文章は、
読み終わったあとに「少し整う」感覚を残すトーンで。
`;

  // 【A】プレミアム用プロンプト（※今は未使用）
  const PREMIUM_PROMPT = `
あなたは「AIオラクル（Oracle）」です。

今日は ${today} です。

今日は日付に基づき、
このユーザーが「今日をどう過ごすと整うか」を
深く、具体的に伝えてください。

ルール：
・未来を断定しない
・恐怖や不安を煽らない
・医療・法律・投資の判断をしない
・占いではなく「思考と行動の整理」に徹する

出力構成：

【今日の指針】
・なぜ今日はこういう日かの背景
・内面への問いかけ

【今日のキーワード】
・1語（漢字 or ひらがな）

【行動のヒント】
・今日できる具体的な行動を3つ
・5分〜30分でできるもの

【ひとことメッセージ】
・今日を終えるときに思い出してほしい言葉

文章は、
静かで誠実、知的で押しつけがましくないトーンで。
`;

  const prompt = mode === "premium" ? PREMIUM_PROMPT : FREE_PROMPT;

  /* =========================
     OpenAI 呼び出し
     ========================= */

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
      }),
    });

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content;

    return NextResponse.json({ text, mode });
  } catch (e: any) {
    return NextResponse.json(
      { error: "OpenAI API error", detail: String(e) },
      { status: 500 }
    );
  }
}
