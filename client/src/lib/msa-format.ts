export const fmtInt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export const fmtSigned = (n: number) =>
  (n >= 0 ? "+" : "") + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export const fmtPct = (n: number) =>
  (n >= 0 ? "+" : "") + n.toFixed(2) + "%";

export const fmtCompact = (n: number) => {
  if (Math.abs(n) >= 1_000_000)
    return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
};

// Growth color: red for decline, gray for neutral, green for growth, deeper green for strong growth
export function growthColor(pct: number): string {
  if (pct <= -2) return "hsl(0 72% 50%)"; // strong decline
  if (pct < 0) return "hsl(15 70% 55%)"; // mild decline
  if (pct < 2) return "hsl(45 80% 55%)"; // slow
  if (pct < 6) return "hsl(170 65% 45%)"; // moderate
  if (pct < 12) return "hsl(150 70% 42%)"; // strong
  return "hsl(140 80% 38%)"; // explosive
}

export function growthLabel(pct: number): string {
  if (pct <= -2) return "Strong decline";
  if (pct < 0) return "Decline";
  if (pct < 2) return "Slow growth";
  if (pct < 6) return "Moderate";
  if (pct < 12) return "Strong";
  return "Explosive";
}

// Region color palette
export const REGION_COLORS: Record<string, string> = {
  Northeast: "hsl(262 70% 60%)",
  Midwest: "hsl(36 90% 55%)",
  South: "hsl(0 72% 55%)",
  West: "hsl(192 90% 50%)",
};
