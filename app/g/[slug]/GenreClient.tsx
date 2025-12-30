"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Genre } from "../../../lib/genres";

type DrawnCard = {
  index: number;
  role: string;
  slug?: string;
  nameJa: string;
  position: string;
  reversed: boolean;
  imageUrl?: string;
};

type ApiResponse = {
  text?: string;
  product?: string;
  tier?: "free" | "premium";
  drawnCards?: DrawnCard[] | null;
  error?: string;
  detail?: string;
};

type Section = { title: string; body: string };

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

export default function GenreClient({
  slug,
  genre,
}: {
  slug: string;
  genre: Genre | null;
}) {
  const [tier, setTier] = useState<"free" | "premium">("free");
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState("");
  const [cards, setCards] = useState<DrawnCard[] | null>(null);
  const [zoom, setZoom] = useState<DrawnCard | null>(null);
  const [err, setErr] = useState("");

  const sections = useMemo(() => parseBracketSections(raw), [raw]);

  const fetchOracle = async (t: "free" | "premium") => {
    setTier(t);
    setLoading(true);
    setErr("");
    setRaw("");
    setCards(null);

    try {
      const qs = new URLSearchParams({
        product: slug,
        tier: t,
        // q は将来：入力UIを作るならここに入れる
      });

      const res = await fetch(`/api/oracle?${qs.toString()}`, {
        cache: "no-store",
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) {
        setErr(data?.error ?? "エラーが発生しました");
        return;
      }

      setRaw(data.text ?? "");
      setCards(data.drawnCards ?? null);
    } catch {
      setErr("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (!genre) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm">ページが見つかりません。</p>
        <p className="mt-2 text-xs text-zinc-500">
          slug: <span className="font-mono">{slug}</span>
        </p>
        <div className="mt-4">
          <Link href="/" className="underline underline-offset-4 text-sm">
            ← トップに戻る
          </Link>
        </div>
      </main>
    );
  }

  const isTarot = slug === "tarot";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm underline underline-offset-4">
            ← トップに戻る
          </Link>

          <div className="text-[10px] text-zinc-400">{tier}</div>
        </div>

        <h1 className="text-2xl font-semibold">{genre.title}</h1>
        <p className="text-sm text-zinc-600">{genre.description}</p>

        <div className="flex gap-2">
          <button
            onClick={() => fetchOracle("free")}
            disabled={loading}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading && tier === "free" ? "生成中..." : "無料"}
          </button>

          <button
            onClick={() => fetchOracle("premium")}
            disabled={loading}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
          >
            {loading && tier === "premium" ? "生成中..." : "Premium"}
          </button>
        </div>

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}
      </header>

      {/* ===== タロットカード表示（3枚横並び） ===== */}
      {isTarot && Array.isArray(cards) && cards.length > 0 && (
        <section className="mb-8">
          <div className="grid grid-cols-3 gap-4">
            {cards.map((c) => (
              <button
                key={`${c.index}-${c.slug ?? c.nameJa}`}
                onClick={() => setZoom(c)}
                className="flex flex-col items-center gap-2 rounded-2xl p-2 hover:bg-zinc-50"
                type="button"
              >
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt={c.nameJa}
                    className={`w-full max-w-[170px] rounded-xl shadow-lg transition-transform ${
                      c.reversed ? "rotate-180" : ""
                    }`}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-[220px] w-full max-w-[170px] items-center justify-center rounded-xl border border-zinc-200 bg-white text-xs text-zinc-500">
                    no image
                  </div>
                )}

                <div className="text-xs text-zinc-700">
                  <span className="font-semibold">{c.role}</span>
                  <span className="text-zinc-500">（{c.position}）</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ===== テキスト結果 ===== */}
      {raw && (
        <section className="space-y-4">
          {sections.map((sec, i) => (
            <div
              key={`${sec.title}-${i}`}
              className="rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <div className="text-xs font-semibold text-zinc-600">
                {sec.title}
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-900">
                {sec.body || "—"}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ===== モーダル（クリックで拡大） ===== */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setZoom(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-[520px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoom(null)}
              className="absolute -top-3 -right-3 rounded-full bg-white px-3 py-2 text-xs font-semibold shadow"
              type="button"
              aria-label="close"
            >
              ×
            </button>

            <img
              src={zoom.imageUrl}
              alt={zoom.nameJa}
              className={`w-full rounded-2xl shadow-2xl ${
                zoom.reversed ? "rotate-180" : ""
              }`}
            />

            <div className="mt-3 text-center text-sm text-white">
              <span className="font-semibold">{zoom.nameJa}</span>{" "}
              <span className="opacity-80">/ {zoom.role}（{zoom.position}）</span>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-10 text-xs text-zinc-500">
        <Link href="/tokusho" className="underline underline-offset-4">
          特定商取引法に基づく表記
        </Link>
      </footer>
    </main>
  );
}
