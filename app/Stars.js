/** Five stars filled proportionally to `value` (0-5). */
export default function Stars({ value, small = false }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span
      className={small ? "stars stars-sm" : "stars"}
      role="img"
      aria-label={`${v.toFixed(1)} out of 5 stars`}
    >
      ★★★★★
      <span className="stars-fill" style={{ width: `${(v / 5) * 100}%` }} aria-hidden="true">
        ★★★★★
      </span>
    </span>
  );
}
