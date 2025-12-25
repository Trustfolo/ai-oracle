"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type OracleResponse = {
  text?: string;
  error?: string;
  details?: any;
};

function formatDateJP(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${y}.${m}.${day}（${w}）`;
}

function splitSections(text: string) {
  const guideMatch = text.match(/【今日の指針】([\s\S]*?)(?=【今日のキーワード】|$)/);
  const keyMatch = text.match(/【今日のキーワード】([\s\S]*?)(?=【行動のヒント】|$)/);
  const hintMatch = text.match(/【行動のヒント】([\s\S]*?)$/);

  const guide = (guideMatch?.[1] ?? "").trim();
  const keyword = (keyMatch?.[1] ?? "").trim();
  const hintsRaw = (hintMatch?.[1] ?? "").trim();

  const hints = hintsRaw
    .split("\n")
    .map((s) => s.replace(/^・\s?/, "").trim())
    .filter(Boolean);

  return { guide, keyword, hints };
}

function shimmerLine(seed: number) {
  const lines = [
    "今日は「整える」ほど運が味方します。",
    "小さな選択が、静かに未来を形づくります。",
    "焦りより、丁寧さが良い流れを呼びます。",
    "気づきは、日常の中に隠れています。",
    "いまの自分に優しくするほど、道が開けます。",
  ];
  return lines[seed % lines.length];
}

export default function Home() {
  const now = useMemo(() => new Date(), []);
  const dateLabel = useMemo(() => formatDateJP(now), [now]);

  const [raw, setRaw] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");
  const [revealed, setRevealed] = useState(false);

  const { guide, keyword, hints } = useMemo(() => splitSections(raw), [raw]);

  const daySeed = useMemo(() => {
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return y * 10000 + m * 100 + d;
  }, [now]);

  const tagline = useMemo(() => shimmerLine(daySeed), [daySeed]);

  // 本番では原文を出さない（必要なら Vercelの環境変数で ON）
  // Vercel: NEXT_PUBLIC_SHOW_RAW=1 を入れると表示される
  const showRaw = useMemo(() => process.env.NEXT_PUBLIC_SHOW_RAW === "1", []);

  useEffect(() => {
    if (!raw) return;
    const t = setTimeout(() => setRevealed(true), 30);
    return () => clearTimeout(t);
  }, [raw]);

  const fetchOracle = async () => {
    setLoading(true);
    setErr("");
    setRevealed(false);
    try {
      const res = await fetch("/api/oracle", { cache: "no-store" });
      const data: OracleResponse = await res.json();

      if (!res.ok) {
        setErr(data?.error ?? "エラーが発生しました。");
        setRaw("");
        return;
      }

      setRaw(data.text ?? "");
    } catch {
      setErr("通信エラーが発生しました。");
      setRaw("");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    if (!raw) return;
    try {
      await navigator.clipboard.writeText(raw);
      alert("コピーしました");
    } catch {
      alert("コピーに失敗しました");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-indigo-950 to-zinc-950 text-zinc-50">
      {/* 背景画像（public/oracle-bg.png） */}
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src="/oracle-bg.png"
            alt=""
            fill
            priority
            className="object-cover opacity-25 blur-[1px]"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* 光のぼかし（既存） */}
        <div className="pointer-events-none fixed inset-0 opacity-40">
          <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-indigo-500 blur-[120px]" />
          <div className="absolute top-40 -right-40 h-[520px] w-[520px] rounded-full bg-fuchsia-500 blur-[120px]" />
          <div className="absolute bottom-[-220px] left-1/3 h-[520px] w-[520px] rounded-full bg-sky-500 blur-[140px]" />
        </div>

        {/* 画面本体 */}
        <div className="relative mx-auto max-w-2xl px-4 py-10">
          {/* ヘッダー */}
          <header className="mb-7">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                AI Oracle
                <span className="text-white/40">•</span>
                {dateLabel}
              </div>

              <button
                onClick={copyText}
                disabled={!raw}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 hover:bg-white/10 disabled:opacity-40 backdrop-blur"
              >
                結果をコピー
              </button>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              今日のオラクル
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-200/80">{tagline}</p>

            {/* CTA */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={fetchOracle}
                disabled={loading}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 shadow-xl shadow-black/30 disabled:opacity-60"
              >
                <span className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-sky-200" />
                <span className="relative">
                  {loading ? "星を読んでいます..." : "今日の指針を受け取る"}
                </span>
              </button>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-zinc-200/80 backdrop-blur">
                未来を断定せず、行動に落とし込む“やさしい占い”です。
              </div>
            </div>

            {err && (
              <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {err}
              </div>
            )}
          </header>

          {/* コンテンツ */}
          <section className="space-y-4">
            {!raw && !err && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm text-zinc-200/80">
                  ボタンを押すと、今日のあなたに必要な視点と行動ヒントが届きます。
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/60">所要時間</div>
                    <div className="mt-1 text-sm font-semibold">約3秒</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/60">このオラクルについて</div>
                    <div className="mt-1 text-sm font-semibold leading-6">
                      焦らせず、今日を整えるヒントを届けます
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/60">使い方</div>
                    <div className="mt-1 text-sm font-semibold leading-6">
                      1日1回、指針を受け取る
                    </div>
                  </div>
                </div>
              </div>
            )}

            {raw && (
              <div
                className={[
                  "space-y-4 transition-all duration-500",
                  revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                ].join(" ")}
              >
                {/* 指針カード */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-zinc-200/70">【今日の指針】</div>
                    <div className="text-[10px] text-zinc-200/50">free preview</div>
                  </div>

                  <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-50">
                    {guide || raw}
                  </div>

                  {/* ✅ プレミアム誘導（カード丸ごとクリック可能） */}
                  <a
                    href="https://buy.stripe.com/5kQdR93jB3Mj4ZS7ZC7AI01"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="プレミアムで全文を読む（Stripeへ）"
                    className="group mt-4 block rounded-3xl border border-white/15 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-5 text-center transition hover:scale-[1.01] hover:border-white/25 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    <p className="mb-3 text-sm text-white/85">
                      この先は、今日をもう一段深く整える内容です
                    </p>

                    <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-black shadow-lg transition group-hover:scale-[1.02]">
                      🔓 プレミアムで今日のオラクル全文を読む
                    </span>

                    <p className="mt-2 text-xs text-white/60">
                      月額 ¥980｜毎日のオラクル全文が読み放題
                    </p>
                  </a>
                </div>

                {/* キーワード & ヒント */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <div className="text-xs font-medium text-zinc-200/70">
                      【今日のキーワード】
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <span className="text-xl font-semibold">{keyword || "—"}</span>
                      <span className="text-xs text-zinc-200/60">keyword</span>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <div className="text-xs font-medium text-zinc-200/70">
                      【行動のヒント】
                    </div>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-50">
                      {(hints.length ? hints : ["—"]).map((h, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/70" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 原文表示：開発用だけ（本番は環境変数でOFF） */}
                {showRaw && (
                  <details className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <summary className="cursor-pointer text-sm font-medium text-zinc-100">
                      生成テキスト（原文）を表示（開発用）
                    </summary>
                    <pre className="mt-4 whitespace-pre-wrap break-words text-xs leading-6 text-zinc-200/80">
                      {raw}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </section>

          <footer className="mt-10 text-xs text-zinc-200/60">
            ※ 医療・法律・投資の判断は行いません。必要なら専門家への相談も検討してください。
          </footer>
        </div>
      </div>
    </main>
  );
}
