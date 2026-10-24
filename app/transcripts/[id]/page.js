import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ticket transcript",
  robots: { index: false, follow: false },
};

async function loadTranscript(id) {
  if (!/^[a-f0-9]{32}$/.test(id)) return { status: "not-found" };

  const base = (process.env.BOT_API_URL || "").replace(/\/+$/, "");
  if (!base) return { status: "error" };

  try {
    const res = await fetch(`${base}/api/transcripts/${id}`, {
      headers: { Authorization: `Bearer ${process.env.BOT_API_SECRET || ""}` },
      cache: "no-store",
    });
    if (res.status === 404) return { status: "not-found" };
    if (!res.ok) return { status: "error" };
    return { status: "ok", data: await res.json() };
  } catch {
    return { status: "error" };
  }
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toISOString().replace("T", " ").slice(0, 16)} UTC`;
}

function isHttps(url) {
  return typeof url === "string" && url.startsWith("https://");
}

function Meta({ label, value }) {
  return (
    <div>
      <dt>{label}:</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default async function TranscriptPage({ params }) {
  const { id } = await params;
  const result = await loadTranscript(id);

  if (result.status === "not-found") notFound();

  if (result.status === "error") {
    return (
      <main className="wrap center">
        <p className="eyebrow">Argus</p>
        <h1>Transcript unavailable</h1>
        <p className="muted">
          The bot could not be reached right now. Please try again in a moment.
        </p>
      </main>
    );
  }

  const t = result.data;
  const privacyUrl = process.env.PRIVACY_URL;

  return (
    <main className="wrap">
      <p className="eyebrow">Ticket transcript</p>
      <h1>#{t.channelName}</h1>

      <dl className="meta">
        <Meta label="Server" value={t.guildName ?? "—"} />
        <Meta label="Opened by" value={t.ownerTag ?? "—"} />
        <Meta label="Opened" value={formatDate(t.openedAt)} />
        <Meta label="Closed" value={formatDate(t.closedAt)} />
        <Meta label="Closed by" value={t.closedByTag ?? "Automatically (inactivity)"} />
        <Meta label="Messages" value={String(t.messageCount)} />
        <Meta label="Reason" value={t.closeReason ?? "No reason provided"} />
        <Meta
          label="Rating"
          value={
            t.rating
              ? `${"★".repeat(t.rating)}${"☆".repeat(5 - t.rating)} (${t.rating}/5)`
              : "Not rated"
          }
        />
      </dl>

      <ol className="messages">
        {t.messages.map((m) => (
          <li key={m.id} className="msg">
            <img
              className="avatar"
              src={isHttps(m.avatar) ? m.avatar : undefined}
              alt=""
              width={40}
              height={40}
            />
            <div className="body">
              <p className="head">
                <span className="author">{m.author}</span>
                {m.bot && <span className="badge">Bot</span>}
                <span className="time">{formatDate(m.at)}</span>
              </p>

              {m.content && <p className="text">{m.content}</p>}

              {m.embeds.map((e, i) => (
                <div key={i} className="embed">
                  {e.title && <p className="embed-title">{e.title}</p>}
                  {e.description && <p className="embed-desc">{e.description}</p>}
                </div>
              ))}

              {m.attachments.length > 0 && (
                <ul className="files">
                  {m.attachments.map((a) => (
                    <li key={a.url}>
                      📎{" "}
                      {isHttps(a.url) ? (
                        <a href={a.url} target="_blank" rel="noopener noreferrer">
                          {a.name}
                        </a>
                      ) : (
                        a.name
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="note">
        Discord attachment links expire after some time, so files and images
        from this ticket may stop opening later. Anyone with this page’s link
        can read the transcript, so only share it with people you trust.
        {privacyUrl && (
          <>
            {" "}
            <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </>
        )}
      </p>
    </main>
  );
}
