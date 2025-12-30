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

function splitHints(body: string): string[] {
  return (body ?? "")
    .split("\n")
    .map((s) => s.replace(/^[-・]\s?/, "").trim())
    .filter(Boolean);
}

export default function GenreClient({
  slug,
  genre,
}: {
  slug: string;
  genre: Genre | null;
}) {
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

  const [tier, setTier] = useState<"free" | "premium">("free");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [raw, setRaw] = useState("");

  const [cards, setCards] = useState<DrawnCard[] | null>(null);
  const [zoom, setZoom] = useState<DrawnCard | null>(null);

  const sections = useMemo(() => parseBracketSections(raw), [raw]);

  const isTarot = genre.slug === "tarot";

  const fetchOracle = async (t: "free" | "premium") => {
    setTier(t);
    setLoading(true);
    setErr("");
    setRaw("");
    setCards(null);

    try {
      const qs = new URLSearchParams({
        product: genre.slug, // ←絶対これ（tarotを返すため）
        tier: t,
      });

      const res = await fetch(`/api/oracle?${qs.toString()}`, {
        cache: "no-store",
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) {
        setErr(data?.error ?? "エラーが発生しました。");
        return;
      }

      setRaw(data.text ?? "");
      setCards(data.drawnCards ?? null); // ←ここで受け取る
    } catch {
      setErr("通信エラーが発生しました。");
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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm underline underline-offset-4">
            ← トップに戻る
          </Link>

          <button
            onClick={copyText}
            disabled={!raw}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
          >
            結果をコピー
          </button>
        </div>

        <h1 className="text-2xl font-semibold">{genre.title}</h1>
        <p className="text-sm text-zinc-600">{genre.description}</p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
      </header>

      {/* ===== タロットカード表示（3枚横並び + モーダル） ===== */}
      {isTarot && cards && cards.length > 0 && (
        <section className="mb-8">
          <div className="grid grid-cols-3 gap-4">
            {cards.map((c) => (
              <button
                key={`${c.index}-${c.slug ?? c.nameJa}`}
                onClick={() => setZoom(c)}
                className="flex flex-col items-center gap-2 rounded-2xl p-2 hover:bg-zinc-50"
                type="button"
              >
                <img
                  src={c.imageUrl}
                  alt={c.nameJa}
                  className={`w-full max-w-[170px] rounded-xl shadow-lg transition-transform ${
                    c.reversed ? "rotate-180" : ""
                  }`}
                  loading="lazy"
                />
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
      {!raw ? (
        <section className="rounded-3xl border border-zinc-200 bg-white p-6">
          <div className="text-sm text-zinc-700">
            「無料」または「Premium」を押すと結果が表示されます。
          </div>
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
                className="rounded-3xl border border-zinc-200 bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-zinc-600">
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

      {/* ===== モーダル ===== */}
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
              <span className="opacity-80">
                / {zoom.role}（{zoom.position}）
              </span>
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
