import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MSA, CSA, StateInfo, ColorMode } from "@/lib/msa-types";
import { fmtCompact } from "@/lib/msa-format";

export interface FilterState {
  q: string;
  state: string; // "all" or state abbr
  csa: string; // "all", "none", or csa code
  region: string; // "all" or region name
  popRange: [number, number];
}

interface Props {
  msas: MSA[];
  csas: CSA[];
  states: StateInfo[];
  regions: string[];
  filters: FilterState;
  onChange: (f: FilterState) => void;
  popBounds: [number, number];
  groupByRegion: boolean;
  onGroupChange: (v: boolean) => void;
  colorMode: ColorMode;
  onColorModeChange: (v: ColorMode) => void;
  visibleCount: number;
  totalCount: number;
}

export function Filters({
  msas,
  csas,
  states,
  regions,
  filters,
  onChange,
  popBounds,
  groupByRegion,
  onGroupChange,
  colorMode,
  onColorModeChange,
  visibleCount,
  totalCount,
}: Props) {
  // States that actually appear in MSAs
  const stateOptions = useMemo(() => {
    const set = new Set<string>();
    msas.forEach((m) => m.states.forEach((s) => set.add(s)));
    return states.filter((s) => set.has(s.abbr));
  }, [msas, states]);

  // CSAs sorted by title
  const csaOptions = useMemo(
    () => [...csas].sort((a, b) => a.title.localeCompare(b.title)),
    [csas]
  );

  const update = (patch: Partial<FilterState>) =>
    onChange({ ...filters, ...patch });

  const isDefaultPop =
    filters.popRange[0] === popBounds[0] &&
    filters.popRange[1] === popBounds[1];

  const hasActive =
    filters.q !== "" ||
    filters.state !== "all" ||
    filters.csa !== "all" ||
    filters.region !== "all" ||
    !isDefaultPop;

  const clearAll = () =>
    onChange({
      q: "",
      state: "all",
      csa: "all",
      region: "all",
      popRange: popBounds,
    });

  return (
    <div
      className="rounded-lg border border-card-border bg-card p-4"
      data-testid="filters-panel"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px_180px_200px] gap-3 items-end">
        {/* Search */}
        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Search title, CBSA, state, region, division, CSA…"
              className="pl-9"
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Region */}
        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Region
          </Label>
          <Select
            value={filters.region}
            onValueChange={(v) => update({ region: v })}
          >
            <SelectTrigger data-testid="select-region">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* State */}
        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
            State
          </Label>
          <Select
            value={filters.state}
            onValueChange={(v) => update({ state: v })}
          >
            <SelectTrigger data-testid="select-state">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All states</SelectItem>
              {stateOptions.map((s) => (
                <SelectItem key={s.abbr} value={s.abbr}>
                  {s.name} ({s.abbr})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CSA */}
        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Combined Statistical Area
          </Label>
          <Select
            value={filters.csa}
            onValueChange={(v) => update({ csa: v })}
          >
            <SelectTrigger data-testid="select-csa">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All MSAs</SelectItem>
              <SelectItem value="none">Not part of a CSA</SelectItem>
              {csaOptions.map((c) => (
                <SelectItem key={c.code} value={String(c.code)}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Population range + controls */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-4 mt-4 pt-4 border-t border-card-border items-center">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              2025 Population Range
            </Label>
            <span
              className="text-xs font-mono text-muted-foreground"
              data-testid="text-pop-range"
            >
              {fmtCompact(filters.popRange[0])} – {fmtCompact(filters.popRange[1])}
            </span>
          </div>
          <Slider
            min={popBounds[0]}
            max={popBounds[1]}
            step={10000}
            value={filters.popRange}
            onValueChange={(v) => update({ popRange: [v[0], v[1]] as [number, number] })}
            data-testid="slider-population"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="group-toggle"
            checked={groupByRegion}
            onCheckedChange={onGroupChange}
            data-testid="switch-group-region"
          />
          <Label htmlFor="group-toggle" className="text-xs cursor-pointer">
            Group by region
          </Label>
        </div>

        <div className="flex items-center gap-1 rounded-md border border-input p-0.5 bg-background">
          <button
            onClick={() => onColorModeChange("growth")}
            data-testid="button-color-growth"
            className={`text-xs px-2.5 py-1 rounded ${
              colorMode === "growth"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Color: Growth
          </button>
          <button
            onClick={() => onColorModeChange("region")}
            data-testid="button-color-region"
            className={`text-xs px-2.5 py-1 rounded ${
              colorMode === "region"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Region
          </button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          disabled={!hasActive}
          data-testid="button-clear-filters"
        >
          <X className="h-3 w-3 mr-1" /> Clear
        </Button>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span data-testid="text-result-count">
          <span className="font-mono text-foreground font-medium">
            {visibleCount}
          </span>{" "}
          of {totalCount} MSAs shown
        </span>
        {hasActive && (
          <span className="text-primary">Filters active</span>
        )}
      </div>
    </div>
  );
}
