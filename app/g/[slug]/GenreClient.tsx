"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Genre } from "../../../lib/genres";

type DrawnCard = {
  index: number;
  role: string;
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
};

type Section = { title: string; body: string };

function parseBracketSections(text: string): Section[] {
  const src = (text ?? "").trim();
  if (!src) return [];

  const regex = /【([^】]+)】([\s\S]*?)(?=【[^】]+】|$)/g;
  const out: Section[] = [];
  let m: RegExpExecArray | null;

  while ((m = regex.exec(src)) !== null) {
    out.push({ title: m[1].trim(), body: m[2].trim() });
  }

  if (!out.length) {
    out.push({ title: "結果", body: src });
  }
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
    setCards(null);

    try {
      const qs = new URLSearchParams({
        product: slug,
        tier: t,
      });

      const res = await fetch(`/api/oracle?${qs.toString()}`, {
        cache: "no-store",
      });

      const data: ApiResponse = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "エラーが発生しました");
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
        <p>ページが見つかりません。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6 space-y-3">
        <Link href="/" className="text-sm underline underline-offset-4">
          ← トップに戻る
        </Link>

        <h1 className="text-2xl font-semibold">{genre.title}</h1>
        <p className="text-sm text-zinc-600">{genre.description}</p>

        <div className="flex gap-2">
          <button
            onClick={() => fetchOracle("free")}
            disabled={loading}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
          >
            無料
          </button>
          <button
            onClick={() => fetchOracle("premium")}
            disabled={loading}
            className="rounded-xl border px-4 py-2 text-sm font-semibold"
          >
            Premium
          </button>
        </div>
      </header>

      {/* ===== タロットカード表示 ===== */}
      {cards && cards.length > 0 && (
        <section className="mb-8">
          <div className="grid grid-cols-3 gap-4">
            {cards.map((c) => (
              <button
                key={c.index}
                onClick={() => setZoom(c)}
                className="flex flex-col items-center gap-2"
              >
                {c.imageUrl && (
                  <img
                    src={c.imageUrl}
                    alt={c.nameJa}
                    className={`w-full max-w-[160px] rounded-xl shadow-lg transition-transform ${
                      c.reversed ? "rotate-180" : ""
                    }`}
                  />
                )}
                <div className="text-xs text-zinc-600">
                  {c.role}（{c.position}）
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
              key={i}
              className="rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <div className="text-xs font-semibold text-zinc-600">
                {sec.title}
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-7">
                {sec.body}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ===== モーダル ===== */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setZoom(null)}
        >
          <img
            src={zoom.imageUrl}
            alt={zoom.nameJa}
            className={`max-h-[80vh] rounded-2xl ${
              zoom.reversed ? "rotate-180" : ""
            }`}
          />
        </div>
      )}

      {err && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}
    </main>
  );
}
