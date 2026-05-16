import { useEffect, useMemo, useState } from "react";
import dataset from "@/data/msa_dataset.json";
import { MSADataset, MSA, SortKey, SortDir, ColorMode } from "@/lib/msa-types";
import { fmtCompact, fmtInt, REGION_COLORS, growthColor } from "@/lib/msa-format";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { USMap } from "@/components/USMap";
import { Directory } from "@/components/Directory";
import { DetailPanel } from "@/components/DetailPanel";
import { Filters, FilterState } from "@/components/Filters";
import { ExternalLink, Database, Info } from "lucide-react";

const DATA = dataset as unknown as MSADataset;

export default function Home() {
  const allMsas = DATA.msas;

  // Compute pop bounds rounded to nearest 10k for slider
  const popBounds = useMemo<[number, number]>(() => {
    const max = Math.max(...allMsas.map((m) => m.population_2025_estimate));
    return [0, Math.ceil(max / 10000) * 10000];
  }, [allMsas]);

  const [filters, setFilters] = useState<FilterState>({
    q: "",
    state: "all",
    csa: "all",
    region: "all",
    popRange: popBounds,
  });

  const [sortKey, setSortKey] = useState<SortKey>("population_2025_estimate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [groupByRegion, setGroupByRegion] = useState(true);
  const [colorMode, setColorMode] = useState<ColorMode>("growth");
  const [selectedCbsa, setSelectedCbsa] = useState<string | null>(null);

  const handleSortChange = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      // Default sort direction: numeric desc, text asc
      const numeric = [
        "population_2025_estimate",
        "population_2020_census_base",
        "population_change",
        "population_change_pct",
      ];
      setSortDir(numeric.includes(k) ? "desc" : "asc");
    }
  };

  // Filter pipeline
  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return allMsas.filter((m) => {
      if (filters.region !== "all" && m.region !== filters.region) return false;
      if (filters.state !== "all" && !m.states.includes(filters.state))
        return false;
      if (filters.csa === "none" && m.csa_code) return false;
      if (
        filters.csa !== "all" &&
        filters.csa !== "none" &&
        m.csa_code !== filters.csa
      )
        return false;
      const p = m.population_2025_estimate;
      if (p < filters.popRange[0] || p > filters.popRange[1]) return false;
      if (q) {
        const hay = [
          m.title,
          m.cbsa,
          m.region,
          m.division,
          m.csa_title || "",
          m.states.join(" "),
          m.state_names.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allMsas, filters]);

  const selected = useMemo(
    () => allMsas.find((m) => m.cbsa === selectedCbsa) || null,
    [allMsas, selectedCbsa]
  );

  // Aggregate KPIs from filtered set
  const kpis = useMemo(() => {
    const sumPop2025 = filtered.reduce(
      (s, m) => s + m.population_2025_estimate,
      0
    );
    const sumPop2020 = filtered.reduce(
      (s, m) => s + m.population_2020_census_base,
      0
    );
    const totalChange = sumPop2025 - sumPop2020;
    const pctChange = sumPop2020 > 0 ? (totalChange / sumPop2020) * 100 : 0;
    const growing = filtered.filter((m) => m.population_change > 0).length;
    const declining = filtered.filter((m) => m.population_change < 0).length;
    return {
      count: filtered.length,
      sumPop2025,
      sumPop2020,
      totalChange,
      pctChange,
      growing,
      declining,
    };
  }, [filtered]);

  // Auto-scroll the selected row into view when selection changes from map
  useEffect(() => {
    if (!selectedCbsa) return;
    const el = document.querySelector(
      `[data-testid="row-msa-${selectedCbsa}"]`
    );
    if (el && "scrollIntoView" in el) {
      (el as HTMLElement).scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedCbsa]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-card-border bg-card/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size={32} />
            <div className="min-w-0">
              <div className="text-base font-semibold leading-tight tracking-tight">
                MSA Explorer
              </div>
              <div className="text-[11px] text-muted-foreground leading-tight">
                387 U.S. Metropolitan Statistical Areas · 2020 Census base →
                July 1, 2025 estimates
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <a
              href="https://www.census.gov/data/tables/time-series/demo/popest/2020s-total-metro-and-micro-statistical-areas.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 hover:text-foreground transition-colors"
              data-testid="link-census"
            >
              <Database className="h-3.5 w-3.5" />
              Census Bureau
              <ExternalLink className="h-3 w-3" />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* KPI strip */}
      <section
        className="max-w-[1600px] mx-auto px-5 pt-5"
        data-testid="kpi-strip"
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px rounded-lg border border-card-border bg-border overflow-hidden">
          <Kpi
            label="MSAs in view"
            value={fmtInt(kpis.count)}
            sub={`of ${allMsas.length}`}
            testid="kpi-count"
          />
          <Kpi
            label="2025 population"
            value={fmtCompact(kpis.sumPop2025)}
            sub={fmtInt(kpis.sumPop2025)}
            testid="kpi-pop-2025"
          />
          <Kpi
            label="2020 base"
            value={fmtCompact(kpis.sumPop2020)}
            sub={fmtInt(kpis.sumPop2020)}
            testid="kpi-pop-2020"
          />
          <Kpi
            label="Net change"
            value={(kpis.totalChange >= 0 ? "+" : "") + fmtCompact(kpis.totalChange)}
            sub={
              (kpis.pctChange >= 0 ? "+" : "") +
              kpis.pctChange.toFixed(2) +
              "%"
            }
            valueColor={growthColor(kpis.pctChange)}
            testid="kpi-change"
          />
          <Kpi
            label="Growing / Declining"
            value={`${kpis.growing} / ${kpis.declining}`}
            sub="MSAs"
            testid="kpi-direction"
          />
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-[1600px] mx-auto px-5 pt-5">
        <Filters
          msas={allMsas}
          csas={DATA.csas}
          states={DATA.states}
          regions={DATA.regions}
          filters={filters}
          onChange={setFilters}
          popBounds={popBounds}
          groupByRegion={groupByRegion}
          onGroupChange={setGroupByRegion}
          colorMode={colorMode}
          onColorModeChange={setColorMode}
          visibleCount={filtered.length}
          totalCount={allMsas.length}
        />
      </section>

      {/* Map + Detail */}
      <section className="max-w-[1600px] mx-auto px-5 pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <div className="rounded-lg border border-card-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-card-border">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Geographic distribution
                </span>
                <span className="text-[11px] text-muted-foreground">
                  · bubble size = 2025 population
                </span>
              </div>
              <Legend colorMode={colorMode} regions={DATA.regions} />
            </div>
            <div className="p-3">
              <USMap
                msas={filtered}
                selectedCbsa={selectedCbsa}
                onSelect={setSelectedCbsa}
                colorMode={colorMode}
              />
            </div>
          </div>

          <DetailPanel
            msa={selected}
            csas={DATA.csas}
            allMsas={allMsas}
            onClose={() => setSelectedCbsa(null)}
          />
        </div>
      </section>

      {/* Directory */}
      <section className="max-w-[1600px] mx-auto px-5 pt-5 pb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Directory
          </h2>
          <div className="text-[11px] text-muted-foreground">
            Sort by {labelForKey(sortKey)} · {sortDir.toUpperCase()} ·{" "}
            {groupByRegion ? "Grouped by region / division" : "Flat list"}
          </div>
        </div>
        <Directory
          msas={filtered}
          groupByRegion={groupByRegion}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          selectedCbsa={selectedCbsa}
          onSelect={setSelectedCbsa}
        />
      </section>

      {/* Methodology */}
      <section className="max-w-[1600px] mx-auto px-5 pb-12">
        <div
          className="rounded-lg border border-card-border bg-card p-5"
          data-testid="methodology"
        >
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              Sources & Methodology
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <p className="mb-2">
                <span className="text-foreground font-medium">
                  CBSA-EST2025-ALLDATA
                </span>{" "}
                and{" "}
                <span className="text-foreground font-medium">
                  CSA-EST2025-ALLDATA
                </span>{" "}
                are official Vintage 2025 datasets published by the U.S. Census
                Bureau's Population Estimates Program.
              </p>
              <p className="mb-2">
                The{" "}
                <span className="text-foreground font-medium">2020 column</span>{" "}
                is the{" "}
                <span className="text-foreground font-medium">
                  April 1, 2020 Census estimates base
                </span>
                {" "}from the official table — the population on Census Day after
                processing of the 2020 Decennial Census. The{" "}
                <span className="text-foreground font-medium">
                  2025 column
                </span>{" "}
                is the{" "}
                <span className="text-foreground font-medium">
                  July 1, 2025 vintage estimate
                </span>
                .
              </p>
              <p>
                Region and division are assigned from the first state in each
                MSA title; state filters cover every state with component
                counties in the CBSA. Coordinates and land area come from the
                2025 Census Gazetteer file.
              </p>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Primary sources
              </div>
              <ul className="space-y-1.5 text-sm">
                {DATA.metadata.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                      data-testid={`link-source-${s.label.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      {s.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground/80 mt-3 text-center">
          Data: U.S. Census Bureau · Vintage 2025 ·{" "}
          {DATA.metadata.record_count} records · Built as a static client-side
          explorer; no analytics, no tracking.
        </div>
      </section>
    </div>
  );
}

function labelForKey(k: SortKey): string {
  switch (k) {
    case "title":
      return "Title";
    case "cbsa":
      return "CBSA";
    case "population_2025_estimate":
      return "2025 Population";
    case "population_2020_census_base":
      return "2020 Base";
    case "population_change":
      return "Change";
    case "population_change_pct":
      return "% Change";
    case "region":
      return "Region";
    case "division":
      return "Division";
    case "csa_title":
      return "CSA";
  }
}

function Kpi({
  label,
  value,
  sub,
  valueColor,
  testid,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
  testid: string;
}) {
  return (
    <div className="bg-card p-4" data-testid={testid}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className="text-xl font-semibold font-mono mt-1 tabular-nums"
        style={{ color: valueColor }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
          {sub}
        </div>
      )}
    </div>
  );
}

function Legend({
  colorMode,
  regions,
}: {
  colorMode: ColorMode;
  regions: string[];
}) {
  if (colorMode === "growth") {
    const bins = [
      { label: "≤ -2%", color: growthColor(-3) },
      { label: "-2 – 0%", color: growthColor(-1) },
      { label: "0 – 2%", color: growthColor(1) },
      { label: "2 – 6%", color: growthColor(4) },
      { label: "6 – 12%", color: growthColor(8) },
      { label: "≥ 12%", color: growthColor(15) },
    ];
    return (
      <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
        {bins.map((b) => (
          <div key={b.label} className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: b.color }}
            />
            <span>{b.label}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground">
      {regions.map((r) => (
        <div key={r} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: REGION_COLORS[r] }}
          />
          <span>{r}</span>
        </div>
      ))}
    </div>
  );
}
