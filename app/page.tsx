"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GENRES } from "@/lib/genres";

type OracleResponse = {
  text?: string;
  error?: string;
  detail?: string;
  product?: string;
  tier?: "free" | "premium";
};

function formatDateJP(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${y}.${m}.${day}（${w}）`;
}

function splitSections(text: string) {
  const guideMatch = text.match(
    /【今日の指針】([\s\S]*?)(?=【今日のキーワード】|【行動のヒント】|【ひとことメッセージ】|$)/
  );
  const keyMatch = text.match(
    /【今日のキーワード】([\s\S]*?)(?=【行動のヒント】|【ひとことメッセージ】|$)/
  );
  const hintMatch = text.match(
    /【行動のヒント】([\s\S]*?)(?=【ひとことメッセージ】|$)/
  );
  const msgMatch = text.match(/【ひとことメッセージ】([\s\S]*?)$/);

  const guide = (guideMatch?.[1] ?? "").trim();
  const keyword = (keyMatch?.[1] ?? "").trim();
  const hintsRaw = (hintMatch?.[1] ?? "").trim();
  const message = (msgMatch?.[1] ?? "").trim();

  const hints = hintsRaw
    .split("\n")
    .map((s) => s.replace(/^・\s?/, "").trim())
    .filter(Boolean);

  return { guide, keyword, hints, message };
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
  const [tier, setTier] = useState<"free" | "premium">("free");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");
  const [revealed, setRevealed] = useState(false);

  const { guide, keyword, hints, message } = useMemo(
    () => splitSections(raw),
    [raw]
  );

  const daySeed = useMemo(() => {
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return y * 10000 + m * 100 + d;
  }, [now]);

  const tagline = useMemo(() => shimmerLine(daySeed), [daySeed]);

  // 本番では原文を出さない（必要なら Vercelの環境変数で ON）
  // Vercel: NEXT_PUBLIC_SHOW_RAW=1
  const showRaw = useMemo(() => process.env.NEXT_PUBLIC_SHOW_RAW === "1", []);

  // ジャンル検索
  const [q, setQ] = useState("");
  const filteredGenres = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return GENRES;
    return GENRES.filter((g) => {
      const t = `${g.slug} ${g.title} ${g.description}`.toLowerCase();
      return t.includes(query);
    });
  }, [q]);

  useEffect(() => {
    if (!raw) return;
    const t = setTimeout(() => setRevealed(true), 30);
    return () => clearTimeout(t);
  }, [raw]);

  const fetchOracle = async (t: "free" | "premium") => {
    setTier(t);
    setLoading(true);
    setErr("");
    setRevealed(false);

    try {
      // ★重要：mode ではなく product/tier で統一（Premium復活）
      const qs = new URLSearchParams({
        product: "oracle",
        tier: t,
      });

      const res = await fetch(`/api/oracle?${qs.toString()}`, {
        cache: "no-store",
      });

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
    <main className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-indigo-950 to-zinc-950 text-zinc-50">
      {/* 背景画像 */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/oracle-bg.png"
          alt=""
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* 光のぼかし */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-indigo-500 blur-[120px]" />
        <div className="absolute top-40 -right-40 h-[520px] w-[520px] rounded-full bg-fuchsia-500 blur-[120px]" />
        <div className="absolute bottom-[-220px] left-1/3 h-[520px] w-[520px] rounded-full bg-sky-500 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-10">
        {/* ヘッダー */}
        <header className="mb-7">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              AI Oracle Hub
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

          {/* CTA（無料 + Premium復活） */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => fetchOracle("free")}
              disabled={loading}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 shadow-xl shadow-black/30 disabled:opacity-60"
            >
              <span className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-sky-200" />
              <span className="relative">
                {loading && tier === "free"
                  ? "星を読んでいます..."
                  : "今日の指針を受け取る（無料）"}
              </span>
            </button>

            <button
              onClick={() => fetchOracle("premium")}
              disabled={loading}
              className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10 disabled:opacity-60 backdrop-blur"
              title="Stripe審査中は“Premiumの出力例”として動かします（後で課金連動）"
            >
              {loading && tier === "premium"
                ? "深掘り中..."
                : "深掘り（Premiumの出力例）"}
            </button>
          </div>

          {err && (
            <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {err}
            </div>
          )}
        </header>

        {/* 結果 */}
        <section className="space-y-4">
          {!raw && !err && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="text-sm text-zinc-200/80">
                入口は総合オラクル。必要ならジャンルに分岐してください。
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
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-zinc-200/70">
                    【今日の指針】
                  </div>
                  <div className="text-[10px] text-zinc-200/50">{tier}</div>
                </div>

                <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-50">
                  {guide || raw}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-medium text-zinc-200/70">
                      【今日のキーワード】
                    </div>
                    <div className="mt-2 text-lg font-semibold">
                      {keyword || "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-medium text-zinc-200/70">
                      【行動のヒント】
                    </div>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-50">
                      {(hints.length ? hints : ["—"]).map((h, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-white/70" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {message && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-medium text-zinc-200/70">
                      【ひとことメッセージ】
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-50">
                      {message}
                    </div>
                  </div>
                )}
              </div>

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

        {/* ジャンル */}
        <section className="mt-10">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">ジャンルから選ぶ</h2>
              <p className="mt-1 text-xs text-zinc-200/70">
                UIは共通。中身（プロンプト/課金）をジャンルごとに差し替えます。
              </p>
            </div>

            <div className="w-[160px]">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="検索"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-200/40 backdrop-blur outline-none focus:border-white/20"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filteredGenres.map((g) => (
              <Link
                key={g.slug}
                href={`/g/${g.slug}`}
                className="group block rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold">{g.title}</div>
                    <div className="mt-1 text-xs leading-5 text-zinc-200/70">
                      {g.description}
                    </div>
                  </div>

                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] text-zinc-200/70">
                    {g.badge ?? "soon"}
                  </span>
                </div>

                <div className="mt-4 text-xs text-zinc-200/60 group-hover:text-zinc-200/80">
                  → 開く
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-10 space-y-2 text-xs text-zinc-200/60">
          <p>
            ※ 医療・法律・投資の判断は行いません。必要に応じて専門家への相談もご検討ください。
          </p>

          <p>
            <a
              href="/tokusho"
              className="underline underline-offset-2 hover:text-zinc-200"
            >
              特定商取引法に基づく表記
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
