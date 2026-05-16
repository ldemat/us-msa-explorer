import { useMemo, useRef, useState, useEffect } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import topology from "@/data/us-states.json";
import { MSA, ColorMode } from "@/lib/msa-types";
import { growthColor, REGION_COLORS, fmtInt, fmtPct } from "@/lib/msa-format";

interface Props {
  msas: MSA[];
  selectedCbsa: string | null;
  onSelect: (cbsa: string) => void;
  colorMode: ColorMode;
}

export function USMap({ msas, selectedCbsa, onSelect, colorMode }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(960);
  const height = Math.round(width * 0.62);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setWidth(w);
    });
    obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, []);

  const { statePath, projection } = useMemo(() => {
    const topo = topology as any;
    const states = feature(
      topo,
      topo.objects.states
    ) as unknown as FeatureCollection<Geometry>;
    const proj = geoAlbersUsa().fitSize([width, height], states);
    const path = geoPath(proj);
    return {
      statePath: states.features.map((f) => path(f) || ""),
      projection: proj,
    };
  }, [width, height]);

  // Pop scale: sqrt for area
  const maxPop = useMemo(
    () => Math.max(...msas.map((m) => m.population_2025_estimate), 1),
    [msas]
  );
  const minR = 2;
  const maxR = Math.max(8, width * 0.022);

  const radius = (pop: number) => {
    const r = Math.sqrt(pop / maxPop) * maxR;
    return Math.max(minR, r);
  };

  // Project points and sort: large first so small render on top? We want small on top so they're clickable.
  const points = useMemo(() => {
    const pts = msas
      .map((m) => {
        const xy = projection([m.longitude, m.latitude]);
        if (!xy) return null;
        return { msa: m, x: xy[0], y: xy[1] };
      })
      .filter((p): p is { msa: MSA; x: number; y: number } => p !== null);
    // Sort descending by population so smaller points are rendered last (on top)
    pts.sort(
      (a, b) => b.msa.population_2025_estimate - a.msa.population_2025_estimate
    );
    return pts;
  }, [msas, projection]);

  const colorFor = (m: MSA) =>
    colorMode === "growth"
      ? growthColor(m.population_change_pct)
      : REGION_COLORS[m.region] ?? "hsl(192 90% 50%)";

  return (
    <div ref={wrapperRef} className="w-full" data-testid="map-container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Map of U.S. Metropolitan Statistical Areas"
      >
        {/* State outlines */}
        <g>
          {statePath.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="hsl(var(--muted))"
              stroke="hsl(var(--border))"
              strokeWidth={0.5}
              opacity={0.85}
            />
          ))}
        </g>

        {/* Points */}
        <g>
          {points.map(({ msa, x, y }) => {
            const r = radius(msa.population_2025_estimate);
            const isSel = selectedCbsa === msa.cbsa;
            return (
              <g key={msa.cbsa}>
                <title>{`${msa.title} • Pop 2025: ${fmtInt(msa.population_2025_estimate)} • ${fmtPct(msa.population_change_pct)}`}</title>
                <circle
                  data-testid={`map-point-${msa.cbsa}`}
                  cx={x}
                  cy={y}
                  r={r}
                  fill={colorFor(msa)}
                  fillOpacity={isSel ? 0.95 : 0.55}
                  stroke={isSel ? "hsl(var(--foreground))" : "hsl(var(--background))"}
                  strokeWidth={isSel ? 2 : 0.5}
                  style={{ cursor: "pointer", transition: "fill-opacity 120ms" }}
                  onClick={() => onSelect(msa.cbsa)}
                />
              </g>
            );
          })}
        </g>

        {/* Selected ring on top */}
        {selectedCbsa &&
          (() => {
            const sel = points.find((p) => p.msa.cbsa === selectedCbsa);
            if (!sel) return null;
            const r = radius(sel.msa.population_2025_estimate);
            return (
              <circle
                cx={sel.x}
                cy={sel.y}
                r={r + 4}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                opacity={0.9}
                style={{ pointerEvents: "none" }}
              />
            );
          })()}
      </svg>
    </div>
  );
}
