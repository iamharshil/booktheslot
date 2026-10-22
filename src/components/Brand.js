import Link from "next/link";

export default function Brand({ href = "/", inverse = false, compact = false }) {
  return (
    <Link
      href={href}
      className={`brand-lockup${inverse ? " brand-lockup-inverse" : ""}${compact ? " brand-lockup-compact" : ""}`}
      aria-label="BookTheSlot home"
    >
      <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="15" fill="#244b3b" />
        <circle cx="24" cy="24" r="16" fill="#f7f5f0" />
        <circle cx="24" cy="24" r="13.5" fill="none" stroke="#d9dfd5" />
        <text
          x="24"
          y="32"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="24"
          fontWeight="700"
          letterSpacing="-1.5"
          fill="#244b3b"
        >
          B
        </text>
        <circle cx="38.5" cy="10" r="4.5" fill="#a84a30" />
        <circle cx="38.5" cy="10" r="1.5" fill="#f7f5f0" />
      </svg>
      <span className="brand-wordmark" aria-label="BookTheSlot">
        <span className="brand-word-book">Book</span>
        <span className="brand-word-the">the</span>
        <span className="brand-word-slot">Slot</span>
      </span>
    </Link>
  );
}
