import GenreClient from "./client";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at top, rgba(99,102,241,0.15), transparent 60%), linear-gradient(135deg, #0f172a, #312e81, #581c87)",
        padding: "40px 16px",
      }}
    >
      <GenreClient slug={slug} />
    </div>
  );
}
