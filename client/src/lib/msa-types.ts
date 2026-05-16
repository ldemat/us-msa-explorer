export interface MSA {
  cbsa: string;
  title: string;
  lsad: string;
  population_2020_census_base: number;
  population_2020_estimate: number;
  population_2025_estimate: number;
  population_change: number;
  population_change_pct: number;
  states: string[];
  state_names: string[];
  primary_state: string;
  region: string;
  division: string;
  csa_code: string | null;
  csa_title: string | null;
  latitude: number;
  longitude: number;
  land_sq_miles: number;
  water_sq_miles: number;
}

export interface CSA {
  code: number;
  title: string;
}

export interface StateInfo {
  abbr: string;
  name: string;
  region: string;
  division: string;
}

export interface DatasetMetadata {
  record_count: number;
  vintage: string;
  official_table: string;
  official_csa_table: string;
  population_as_of: string;
  census_base_as_of: string;
  note: string;
  sources: { label: string; url: string }[];
}

export interface MSADataset {
  metadata: DatasetMetadata;
  regions: string[];
  divisions: string[];
  states: StateInfo[];
  csas: CSA[];
  msas: MSA[];
}

export type SortKey =
  | "title"
  | "cbsa"
  | "population_2025_estimate"
  | "population_2020_census_base"
  | "population_change"
  | "population_change_pct"
  | "region"
  | "division"
  | "csa_title";

export type SortDir = "asc" | "desc";

export type ColorMode = "growth" | "region";
