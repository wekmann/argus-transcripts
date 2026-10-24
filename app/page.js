import Stars from "./Stars";

export const dynamic = "force-dynamic";

async function loadSummary() {
  const base = (process.env.BOT_API_URL || "").replace(/\/+$/, "");
  if (!base) return null;

  try {
    const res = await fetch(`${base}/api/ratings/summary`, {
      headers: { Authorization: `Bearer ${process.env.BOT_API_SECRET || ""}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data.count !== "number") return null;
    return data;
  } catch {
    return null;
  }
}

export default async function Home() {
  const summary = await loadSummary();

  return (
    <main className="wrap center">
      <p className="eyebrow">Argus</p>
      <h1>Ticket transcripts</h1>
      <p className="muted">
        Open the link you received after your ticket was closed to view its
        transcript.
      </p>

      {summary && (
        <section className="rating-card" aria-label="Average support rating">
          <p className="rating-label">Average support rating</p>
          {summary.count > 0 ? (
            <>
              <p className="rating-value">
                {summary.average.toFixed(2)} <small>/ 5</small>
              </p>
              <Stars value={summary.average} />
              <p className="rating-count">
                Based on {summary.count} {summary.count === 1 ? "rating" : "ratings"}
              </p>
            </>
          ) : (
            <p className="rating-count">No ratings yet.</p>
          )}
        </section>
      )}
    </main>
  );
}
