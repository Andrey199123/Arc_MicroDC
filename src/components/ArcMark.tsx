type ArcMarkProps = {
  className?: string;
  title?: string;
};

export function ArcMark({ className, title = "Arc" }: ArcMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <path
        d="M14 50L29 16.5C30.3 13.6 33.7 13.6 35 16.5L50 50"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 49.5C26 40.5 34.5 36 43.5 36C48.4 36 52.9 37.3 57 39.8"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
