import { useMemo } from "react";
import { MSA, SortKey, SortDir } from "@/lib/msa-types";
import { fmtInt, fmtPct, fmtSigned, growthColor, REGION_COLORS } from "@/lib/msa-format";
import { ArrowUpDown, ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  msas: MSA[];
  groupByRegion: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  onSortChange: (key: SortKey) => void;
  selectedCbsa: string | null;
  onSelect: (cbsa: string) => void;
}

const COLS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "title", label: "MSA" },
  { key: "population_2025_estimate", label: "2025 Pop", align: "right" },
  { key: "population_2020_census_base", label: "2020 Base", align: "right" },
  { key: "population_change", label: "Change", align: "right" },
  { key: "population_change_pct", label: "% Change", align: "right" },
  { key: "csa_title", label: "CSA" },
];

export function Directory({
  msas,
  groupByRegion,
  sortKey,
  sortDir,
  onSortChange,
  selectedCbsa,
  onSelect,
}: Props) {
  const sorted = useMemo(() => {
    const arr = [...msas];
    const mult = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const va = (a as any)[sortKey];
      const vb = (b as any)[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1; // nulls last
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number")
        return (va - vb) * mult;
      return String(va).localeCompare(String(vb)) * mult;
    });
    return arr;
  }, [msas, sortKey, sortDir]);

  const grouped = useMemo(() => {
    if (!groupByRegion) return null;
    const map = new Map<string, Map<string, MSA[]>>();
    for (const m of sorted) {
      if (!map.has(m.region)) map.set(m.region, new Map());
      const d = map.get(m.region)!;
      if (!d.has(m.division)) d.set(m.division, []);
      d.get(m.division)!.push(m);
    }
    // Preserve a deterministic region order
    const regionOrder = ["Northeast", "Midwest", "South", "West"];
    return regionOrder
      .filter((r) => map.has(r))
      .map((r) => ({
        region: r,
        divisions: Array.from(map.get(r)!.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([division, items]) => ({ division, items })),
      }));
  }, [sorted, groupByRegion]);

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (k !== sortKey)
      return <ArrowUpDown className="h-3 w-3 opacity-40 inline-block ml-1" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 inline-block ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 inline-block ml-1" />
    );
  };

  // Header
  const header = (
    <div className="sticky top-0 z-10 grid grid-cols-[minmax(180px,1.6fr)_minmax(80px,0.7fr)_minmax(80px,0.7fr)_minmax(80px,0.7fr)_minmax(70px,0.6fr)_minmax(140px,1.1fr)] gap-3 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/80 backdrop-blur border-b border-card-border">
      {COLS.map((c) => (
        <button
          key={c.key}
          onClick={() => onSortChange(c.key)}
          data-testid={`sort-${c.key}`}
          className={cn(
            "flex items-center gap-1 hover:text-foreground transition-colors text-left",
            c.align === "right" && "justify-end text-right"
          )}
        >
          {c.label}
          <SortIcon k={c.key} />
        </button>
      ))}
    </div>
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-card-border bg-card">
        {header}
        <div
          className="p-8 text-center text-sm text-muted-foreground"
          data-testid="directory-empty"
        >
          No MSAs match the current filters.
        </div>
      </div>
    );
  }

  const renderRow = (m: MSA) => {
    const isSel = m.cbsa === selectedCbsa;
    return (
      <button
        key={m.cbsa}
        onClick={() => onSelect(m.cbsa)}
        data-testid={`row-msa-${m.cbsa}`}
        className={cn(
          "w-full text-left grid grid-cols-[minmax(180px,1.6fr)_minmax(80px,0.7fr)_minmax(80px,0.7fr)_minmax(80px,0.7fr)_minmax(70px,0.6fr)_minmax(140px,1.1fr)] gap-3 px-4 py-2 text-sm border-b border-card-border/60 hover-elevate",
          isSel && "bg-primary/10"
        )}
      >
        <div className="min-w-0">
          <div className="font-medium truncate flex items-center gap-1.5">
            {isSel && (
              <ChevronRight className="h-3 w-3 text-primary shrink-0" />
            )}
            <span className="truncate">{m.title}</span>
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {m.cbsa} · {m.states.join(", ")}
          </div>
        </div>
        <div className="text-right font-mono tabular-nums self-center">
          {fmtInt(m.population_2025_estimate)}
        </div>
        <div className="text-right font-mono tabular-nums self-center text-muted-foreground">
          {fmtInt(m.population_2020_census_base)}
        </div>
        <div
          className="text-right font-mono tabular-nums self-center"
          style={{ color: growthColor(m.population_change_pct) }}
        >
          {fmtSigned(m.population_change)}
        </div>
        <div
          className="text-right font-mono tabular-nums self-center font-medium"
          style={{ color: growthColor(m.population_change_pct) }}
        >
          {fmtPct(m.population_change_pct)}
        </div>
        <div className="self-center truncate text-muted-foreground text-xs">
          {m.csa_title || (
            <span className="italic text-muted-foreground/60">No CSA</span>
          )}
        </div>
      </button>
    );
  };

  if (groupByRegion && grouped) {
    return (
      <div className="rounded-lg border border-card-border bg-card overflow-x-auto">
        <div className="min-w-[760px]">
        {header}
        <div data-testid="directory-list">
          {grouped.map((g) => (
            <div key={g.region}>
              <div
                className="sticky top-[37px] z-[5] flex items-center justify-between px-4 py-1.5 bg-secondary/70 backdrop-blur text-[11px] uppercase tracking-wider"
                data-testid={`region-header-${g.region}`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: REGION_COLORS[g.region] }}
                  />
                  {g.region}
                </span>
                <span className="text-muted-foreground font-mono">
                  {g.divisions.reduce((s, d) => s + d.items.length, 0)} MSAs
                </span>
              </div>
              {g.divisions.map((d) => (
                <div key={d.division}>
                  <div
                    className="px-4 py-1 bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground font-medium"
                    data-testid={`division-header-${d.division}`}
                  >
                    {d.division}{" "}
                    <span className="text-muted-foreground/60 font-mono">
                      · {d.items.length}
                    </span>
                  </div>
                  {d.items.map(renderRow)}
                </div>
              ))}
            </div>
          ))}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-card-border bg-card overflow-x-auto">
      <div className="min-w-[760px]">
        {header}
        <div data-testid="directory-list">{sorted.map(renderRow)}</div>
      </div>
    </div>
  );
}
