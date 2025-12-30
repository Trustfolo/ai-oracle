export default function GLayout({ children }: { children: React.ReactNode }) {
      return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
      {/* ほんのり“それっぽさ”を足したいなら下の1行をON（任意）
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_60%)]" />
      */}
      {children}
    </div>
  );
}
