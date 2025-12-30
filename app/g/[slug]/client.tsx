"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GENRES, GENRE_MAP } from "../../../lib/genres";
import type { Genre } from "../../../lib/genres";

/* ---------- 型 ---------- */

type ApiResponse = {
  text?: string;
  error?: string;
  detail?: string;
  product?: string;
  tier?: "free" | "premium";
};

type Section = { title: string; body: string };

/* ---------- util ---------- */

function normalize(input: unknown) {
  const raw = String(input ?? "");
  try {
    return decodeURIComponent(raw).trim().toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

function parseBracketSections(text: string): Section[] {
  const src = (text ?? "").trim();
  if (!src) return [];

  const regex = /【([^】]+)】([\s\S]*?)(?=【[^】]+】|$)/g;
  const out: Section[] = [];
  let m: RegExpExecArray | null;

  while ((m = regex.exec(src)) !== null) {
    const title = (m[1] ?? "").trim();
    const body = (m[2] ?? "").trim();
    if (title) out.push({ title, body });
  }

  if (!out.length) out.push({ title: "結果", body: src });
  return out;
}

function splitHints(body: string): string[] {
  return (body ?? "")
    .split("\n")
    .map((s) => s.replace(/^[-・]\s?/, "").trim())
    .filter(Boolean);
}

/* ---------- main ---------- */

export default function GenreClient({ slug }: { slug: string }) {
  const normalized = normalize(slug);

  const genre: Genre | null =
    GENRE_MAP[normalized] ??
    GENRES.find((g) => g.slug.toLowerCase() === normalized) ??
    null;

  const [tier, setTier] = useState<"free" | "premium">("free");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [raw, setRaw] = useState("");

  const sections = useMemo(() => parseBracketSections(raw), [raw]);

  const fetchOracle = async (t: "free" | "premium") => {
    setTier(t);
    setLoading(true);
    setErr("");

    try {
      const qs = new URLSearchParams({
        product: normalized,
        tier: t,
      });

      const res = await fetch(`/api/oracle?${qs.toString()}`, {
        cache: "no-store",
      });

      const data: ApiResponse = await res.json();

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

  if (!genre) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm">ページが見つかりません。</p>
        <p className="mt-2 text-xs text-zinc-500">
          slug: <span className="font-mono">{normalized}</span>
        </p>
        <div className="mt-4">
          <Link href="/" className="underline underline-offset-4 text-sm">
            ← トップに戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      {/* 上部だけ世界観（白背景でも占い感が出る） */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-56 bg-gradient-to-b from-indigo-200/60 via-purple-200/30 to-transparent" />
      <div className="relative space-y-6">
        {/* header */}
        <header className="space-y-3 text-center">
          <Link href="/" className="text-xs underline underline-offset-4">
            ← トップに戻る
          </Link>
          <h1 className="text-2xl font-semibold">{genre.title}</h1>
          <p className="text-sm text-zinc-600">{genre.description}</p>
        </header>

        {/* buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={() => fetchOracle("free")}
            disabled={loading}
            className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading && tier === "free" ? "生成中..." : "今日の結果（無料）"}
          </button>

          <button
            onClick={() => fetchOracle("premium")}
            disabled={loading}
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
          >
            {loading && tier === "premium" ? "生成中..." : "深掘り（Premium）"}
          </button>
        </div>

        {err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {!raw ? (
          <section className="rounded-3xl border border-black/5 bg-white/90 p-6 text-sm text-zinc-700 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur">
            「無料」または「Premium」を押すと結果が表示されます。
          </section>
        ) : (
          <section className="space-y-4">
            {sections.map((sec, idx) => {
              const isHint =
                sec.title.includes("行動のヒント") ||
                sec.title.includes("ヒント") ||
                sec.title.includes("アクション");

              const hintItems = isHint ? splitHints(sec.body) : [];

              return (
                <div
                  key={`${sec.title}-${idx}`}
                  className="rounded-3xl border border-black/5 bg-white/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full bg-zinc-900/5 px-3 py-1 text-xs font-semibold text-zinc-700">
                      {sec.title}
                    </div>
                    <div className="text-[10px] text-zinc-400">{tier}</div>
                  </div>

                  {isHint ? (
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-900">
                      {(hintItems.length ? hintItems : ["—"]).map((h, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-zinc-900/70" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-900">
                      {sec.body || "—"}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        <footer className="pt-6 text-center text-xs text-zinc-500">
          <Link href="/tokusho" className="underline underline-offset-4">
            特定商取引法に基づく表記
          </Link>
        </footer>
      </div>
    </main>
  );
}
