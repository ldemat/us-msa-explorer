export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="MSA Explorer logo"
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="6"
        fill="hsl(var(--primary))"
      />
      {/* Stylized concentric metro rings */}
      <circle
        cx="16"
        cy="16"
        r="10"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="1.3"
        fill="none"
        opacity="0.45"
      />
      <circle
        cx="16"
        cy="16"
        r="6.5"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="1.3"
        fill="none"
        opacity="0.7"
      />
      <circle cx="16" cy="16" r="3" fill="hsl(var(--primary-foreground))" />
      {/* Lat/lon hairlines */}
      <line
        x1="16"
        y1="3"
        x2="16"
        y2="29"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="0.6"
        opacity="0.25"
      />
      <line
        x1="3"
        y1="16"
        x2="29"
        y2="16"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="0.6"
        opacity="0.25"
      />
    </svg>
  );
}
