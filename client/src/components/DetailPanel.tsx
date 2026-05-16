import { MSA, CSA } from "@/lib/msa-types";
import { fmtInt, fmtPct, fmtSigned, growthColor, growthLabel, REGION_COLORS } from "@/lib/msa-format";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, MapPin, Layers, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  msa: MSA | null;
  csas: CSA[];
  allMsas: MSA[];
  onClose: () => void;
}

export function DetailPanel({ msa, csas, allMsas, onClose }: Props) {
  if (!msa) {
    return (
      <div
        className="rounded-lg border border-card-border bg-card p-6 text-sm text-muted-foreground"
        data-testid="detail-empty"
      >
        <div className="flex items-center gap-2 mb-2 text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium">No metro selected</span>
        </div>
        Click any point on the map or row in the directory to inspect 2020-2025
        population dynamics, parent CSA, and component states.
      </div>
    );
  }

  // CSA sibling metros
  const siblings = msa.csa_code
    ? allMsas.filter((m) => m.csa_code === msa.csa_code && m.cbsa !== msa.cbsa)
    : [];

  // Rank within nation by 2025 pop
  const sortedByPop = [...allMsas].sort(
    (a, b) => b.population_2025_estimate - a.population_2025_estimate
  );
  const rank = sortedByPop.findIndex((m) => m.cbsa === msa.cbsa) + 1;

  const growth = msa.population_change_pct;
  const isGrowing = growth >= 0;

  return (
    <div
      className="rounded-lg border border-card-border bg-card overflow-hidden"
      data-testid={`detail-panel-${msa.cbsa}`}
    >
      {/* Header band */}
      <div className="relative">
        <div
          className="h-1.5"
          style={{ background: REGION_COLORS[msa.region] ?? "hsl(var(--primary))" }}
        />
        <div className="flex items-start justify-between p-5 pb-3 gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
              <span className="font-mono" data-testid="text-cbsa">
                CBSA {msa.cbsa}
              </span>
              <span className="text-border">·</span>
              <span>{msa.lsad}</span>
              <span className="text-border">·</span>
              <span>Rank #{rank}</span>
            </div>
            <h2
              className="text-xl font-semibold leading-tight tracking-tight"
              data-testid="text-msa-title"
            >
              {msa.title}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-detail"
            aria-label="Close detail panel"
            className="shrink-0 -mr-2 -mt-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Population KPIs */}
      <div className="grid grid-cols-2 gap-px bg-border">
        <div className="bg-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            2025 Estimate
          </div>
          <div
            className="text-lg font-semibold font-mono mt-1"
            data-testid="text-pop-2025"
          >
            {fmtInt(msa.population_2025_estimate)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            July 1, 2025
          </div>
        </div>
        <div className="bg-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            2020 Base
          </div>
          <div
            className="text-lg font-semibold font-mono mt-1"
            data-testid="text-pop-2020"
          >
            {fmtInt(msa.population_2020_census_base)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            April 1, 2020
          </div>
        </div>
        <div className="bg-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Absolute change
          </div>
          <div
            className="text-lg font-semibold font-mono mt-1 flex items-center gap-1"
            style={{ color: growthColor(growth) }}
            data-testid="text-pop-change"
          >
            {isGrowing ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {fmtSigned(msa.population_change)}
          </div>
        </div>
        <div className="bg-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Percent change
          </div>
          <div
            className="text-lg font-semibold font-mono mt-1"
            style={{ color: growthColor(growth) }}
            data-testid="text-pop-change-pct"
          >
            {fmtPct(growth)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {growthLabel(growth)}
          </div>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="p-5 space-y-3 text-sm">
        <Row label="States">
          <span data-testid="text-states">
            {msa.state_names.join(" · ")}
            <span className="text-muted-foreground ml-2 font-mono text-xs">
              ({msa.states.join(", ")})
            </span>
          </span>
        </Row>
        <Row label="Census region">
          <span
            className="inline-flex items-center gap-1.5 font-medium"
            data-testid="text-region"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: REGION_COLORS[msa.region] }}
            />
            {msa.region}
          </span>
        </Row>
        <Row label="Division">
          <span data-testid="text-division">{msa.division}</span>
        </Row>
        <Row label="Parent CSA">
          {msa.csa_code ? (
            <span data-testid="text-csa">
              {msa.csa_title}
              <span className="text-muted-foreground ml-2 font-mono text-xs">
                · CSA {msa.csa_code}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground" data-testid="text-no-csa">
              Not part of a CSA
            </span>
          )}
        </Row>
        <Row label="Coordinates">
          <span className="font-mono text-xs text-muted-foreground">
            {msa.latitude.toFixed(4)}, {msa.longitude.toFixed(4)}
          </span>
        </Row>
        <Row label="Land area">
          <span className="font-mono text-xs text-muted-foreground">
            {fmtInt(Math.round(msa.land_sq_miles))} sq mi
            {msa.water_sq_miles > 0 && (
              <>
                {" "}
                <span className="text-border">·</span>{" "}
                {fmtInt(Math.round(msa.water_sq_miles))} sq mi water
              </>
            )}
          </span>
        </Row>
      </div>

      {/* CSA Siblings */}
      {siblings.length > 0 && (
        <div className="border-t border-card-border p-5 pt-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <Layers className="h-3.5 w-3.5" />
            <span>Other MSAs in {msa.csa_title}</span>
          </div>
          <ul className="space-y-1 text-sm">
            {siblings.map((s) => (
              <li
                key={s.cbsa}
                className="flex justify-between gap-3"
                data-testid={`sibling-${s.cbsa}`}
              >
                <span className="truncate">{s.title}</span>
                <span className="font-mono text-xs text-muted-foreground shrink-0">
                  {fmtInt(s.population_2025_estimate)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-card-border bg-muted/40 px-5 py-3 text-[11px] text-muted-foreground flex items-center gap-1.5">
        <ExternalLink className="h-3 w-3" />
        Source: U.S. Census Bureau CBSA-EST2025-ALLDATA
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground pt-0.5">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
