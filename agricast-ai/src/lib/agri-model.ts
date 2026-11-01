/**
 * AgriCast AI simulation engine.
 *
 * Every number produced here is SIMULATED demonstration data derived from
 * the static regional baselines in ./regions and a deterministic seeded
 * pseudo-random generator. No live weather, satellite, sensor or ML model
 * is connected. Each function is a seam where a real data source
 * (IMD forecasts, ISRO Bhuvan / Copernicus Sentinel-2 NDVI, soil probes,
 * a trained yield model) can be plugged in later.
 */
import { CROPS, findCrop, findDistrict, findState, findVillage, REGIONS, type Crop, type District, type Village } from "./regions";

export type RiskLevel = "Low" | "Moderate" | "High" | "Severe";

export interface Selection {
  stateId: string;
  districtId: string;
  villageId: string;
  cropId: string;
}

export interface Metrics {
  temperature: number;
  rainfall30d: number;
  rainfallDeviation: number;
  humidity: number;
  soilMoisture: number;
  soilPh: number;
  soilTemp: number;
  ndvi: number;
  cropHealth: number;
  expectedYield: number;
  normalYield: number;
  yieldChange: number;
  droughtProb: number;
  excessRainRisk: number;
  unseasonalRainRisk: number;
  heatStressRisk: number;
  climateRisk: number;
  riskLevel: RiskLevel;
  scores: { temperature: number; water: number; ph: number };
}

export const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic random generator so the same selection always yields the same demo data. */
export function seeded(key: string) {
  let a = hash(key);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function riskLevelFor(score: number): RiskLevel {
  if (score < 30) return "Low";
  if (score < 50) return "Moderate";
  if (score < 70) return "High";
  return "Severe";
}

export function resolve(sel: Selection) {
  const state = findState(sel.stateId);
  const district = findDistrict(state.id, sel.districtId);
  const village = findVillage(state.id, district.id, sel.villageId);
  const crop = findCrop(sel.cropId);
  return { state, district, village, crop };
}

function rangeScore(v: number, [lo, hi]: [number, number], falloff: number) {
  if (v >= lo && v <= hi) return 1;
  const dist = v < lo ? lo - v : v - hi;
  return clamp(1 - dist / falloff, 0, 1);
}

export function computeMetrics(district: District, village: Village, crop: Crop): Metrics {
  const r = seeded(`${village.id}:${crop.id}`);
  const rl = seeded(`${village.id}`); // location-only noise

  const temperature = round(district.baseTemp + (rl() - 0.5) * 2.4, 1);
  const rainfallDeviation = round((rl() - 0.5) * 60);
  const effectiveRain = district.annualRain * (1 + rainfallDeviation / 100);
  const rainfall30d = round((district.annualRain / 12) * (0.55 + rl() * 0.9) * (1 + rainfallDeviation / 200));
  const humidity = round(clamp(district.humidity + (rl() - 0.5) * 8), 0);
  const soilMoisture = round(
    clamp(10 + district.irrigation * 18 + district.annualRain / 70 + rainfallDeviation * 0.12 + rl() * 5, 6, 48),
    1,
  );
  const soilPh = round(district.soilPh + (rl() - 0.5) * 0.4, 1);
  const soilTemp = round(temperature - 2.5 + rl() * 2, 1);

  const tempScore = rangeScore(temperature, crop.optTemp, 8);
  const available = effectiveRain + district.irrigation * crop.waterNeed * 0.9;
  const ratio = available / crop.waterNeed;
  const waterScore = ratio >= 1 ? clamp(1 - Math.max(0, ratio - 2) * 0.25, 0.55, 1) : Math.pow(ratio, 0.8);
  const phScore = rangeScore(soilPh, crop.optPh, 2.5);

  const deficit = Math.max(0, 1 - effectiveRain / crop.waterNeed);
  const droughtProb = round(
    clamp(100 * (0.12 + deficit * 0.75 - district.irrigation * 0.4 + Math.max(0, -rainfallDeviation) / 100 * 0.7) + r() * 8, 3, 97),
  );
  const excessRainRisk = round(
    clamp(100 * (effectiveRain / 1500 - 0.3 + Math.max(0, rainfallDeviation) / 100 * 0.9) + (humidity - 60) * 0.4 + r() * 6, 3, 95),
  );
  const unseasonalRainRisk = round(
    clamp(10 + humidity * 0.35 + r() * 18 + (crop.season === "Rabi" ? 10 : 0) + Math.max(0, rainfallDeviation) * 0.2, 3, 92),
  );
  const heatMargin = crop.heatLimit - (temperature + 7);
  const heatStressRisk = round(clamp(45 - heatMargin * 8 + r() * 6, 3, 96));

  const climateRisk = round(
    clamp(droughtProb * 0.35 + excessRainRisk * 0.22 + heatStressRisk * 0.25 + unseasonalRainRisk * 0.18),
  );

  const cropHealth = round(clamp(100 * (tempScore * 0.3 + waterScore * 0.42 + phScore * 0.28) - climateRisk * 0.3 + 12, 8, 98));
  const ndvi = round(0.18 + (cropHealth / 100) * 0.68 + (r() - 0.5) * 0.04, 2);

  const normalYield = crop.baseYield * district.productivity;
  const expectedYield = round(normalYield * (0.6 + 0.45 * (cropHealth / 100)) * (1 - climateRisk / 450), crop.baseYield > 20 ? 1 : 2);
  const yieldChange = round((expectedYield / normalYield - 1) * 100, 1);

  return {
    temperature,
    rainfall30d,
    rainfallDeviation,
    humidity,
    soilMoisture,
    soilPh,
    soilTemp,
    ndvi,
    cropHealth,
    expectedYield,
    normalYield: round(normalYield, crop.baseYield > 20 ? 1 : 2),
    yieldChange,
    droughtProb,
    excessRainRisk,
    unseasonalRainRisk,
    heatStressRisk,
    climateRisk,
    riskLevel: riskLevelFor(climateRisk),
    scores: { temperature: round(tempScore * 100), water: round(waterScore * 100), ph: round(phScore * 100) },
  };
}

export function metricsFor(sel: Selection) {
  const { district, village, crop } = resolve(sel);
  return computeMetrics(district, village, crop);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SW_MONSOON = [0.01, 0.01, 0.015, 0.02, 0.04, 0.13, 0.26, 0.24, 0.16, 0.075, 0.025, 0.015];
const NE_MONSOON = [0.03, 0.01, 0.015, 0.03, 0.05, 0.04, 0.05, 0.07, 0.11, 0.24, 0.24, 0.11];

/** Normal vs simulated-current-year monthly climate. */
export function monthlyClimate(sel: Selection) {
  const { state, district, village } = resolve(sel);
  const m = metricsFor(sel);
  const r = seeded(`${village.id}:monthly`);
  const north = district.lat > 23;
  const amp = north ? 8.5 : 3.2;
  const weights = state.id === "tamil-nadu" ? NE_MONSOON : SW_MONSOON;
  return MONTHS.map((month, i) => {
    const monsoonCool = i >= 6 && i <= 8 ? -2.2 : 0;
    const t = district.baseTemp + amp * Math.cos((2 * Math.PI * (i - 4.3)) / 12) + monsoonCool;
    const normalRain = district.annualRain * weights[i]!;
    const rain = normalRain * (1 + m.rainfallDeviation / 100) * (0.75 + r() * 0.5);
    return {
      month,
      temp: round(t + (r() - 0.5) * 1.5, 1),
      normalTemp: round(t, 1),
      rain: round(rain),
      normalRain: round(normalRain),
      humidity: round(clamp(district.humidity + (weights[i]! - 0.08) * 120 + (r() - 0.5) * 6), 0),
    };
  });
}

/** 14-day simulated outlook. */
export function forecast14(sel: Selection) {
  const { village } = resolve(sel);
  const m = metricsFor(sel);
  const r = seeded(`${village.id}:fc`);
  return Array.from({ length: 14 }, (_, i) => {
    const wave = Math.sin(i / 2.2) * 1.6;
    const rainy = r() < 0.25 + m.excessRainRisk / 250;
    return {
      day: `D+${i + 1}`,
      max: round(m.temperature + 5 + wave + (r() - 0.5) * 2, 1),
      min: round(m.temperature - 5 + wave * 0.6 + (r() - 0.5) * 2, 1),
      rain: rainy ? round(2 + r() * (m.rainfall30d / 6)) : 0,
      humidity: round(clamp(m.humidity + (rainy ? 12 : -4) + (r() - 0.5) * 8), 0),
    };
  });
}

/** Soil moisture: 30 days history + 7 days projection. */
export function soilMoistureSeries(sel: Selection) {
  const { village } = resolve(sel);
  const m = metricsFor(sel);
  const r = seeded(`${village.id}:sm`);
  let v = m.soilMoisture + 4;
  const out: { day: string; moisture: number | null; projected: number | null; optimal: number }[] = [];
  for (let i = -29; i <= 7; i++) {
    const rainEvent = r() < 0.18 ? 3 + r() * 5 : 0;
    v = clamp(v - (0.25 + r() * 0.5) + rainEvent, 5, 50);
    if (i === 0) v = m.soilMoisture;
    out.push({
      day: i === 0 ? "Today" : i < 0 ? `${i}d` : `+${i}d`,
      moisture: i <= 0 ? round(v, 1) : null,
      projected: i >= 0 ? round(v, 1) : null,
      optimal: 28,
    });
  }
  return out;
}

/** Simulated yield history and forecast for the selected crop. */
export function yieldSeries(sel: Selection) {
  const { village, crop } = resolve(sel);
  const m = metricsFor(sel);
  const r = seeded(`${village.id}:${crop.id}:yield`);
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  const d = crop.baseYield > 20 ? 1 : 2;
  const hist = years.map((y) => ({
    year: String(y),
    actual: round(m.normalYield * (0.86 + r() * 0.22), d) as number | null,
    forecast: null as number | null,
    low: null as number | null,
    high: null as number | null,
    band: null as [number, number] | null,
  }));
  const last = hist[hist.length - 1]!;
  last.forecast = last.actual;
  if (last.actual !== null) last.band = [last.actual, last.actual];
  const low = round(m.expectedYield * (1 - 0.06 - m.climateRisk / 600), d);
  const high = round(m.expectedYield * (1 + 0.05), d);
  hist.push({ year: "2026 (forecast)", actual: null, forecast: m.expectedYield, low, high, band: [low, high] });
  return hist;
}

/** Monthly risk outlook for the next 6 months. */
export function riskOutlook(sel: Selection) {
  const { village } = resolve(sel);
  const m = metricsFor(sel);
  const r = seeded(`${village.id}:risk`);
  const labels = ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"];
  return labels.map((label, i) => {
    const drift = Math.sin(i / 1.6);
    return {
      label,
      drought: round(clamp(m.droughtProb + drift * 10 + (r() - 0.5) * 10)),
      excessRain: round(clamp(m.excessRainRisk - drift * 9 + (r() - 0.5) * 10)),
      heat: round(clamp(m.heatStressRisk + Math.cos(i / 1.4) * 8 + (r() - 0.5) * 8)),
      unseasonal: round(clamp(m.unseasonalRainRisk + (r() - 0.5) * 14)),
    };
  });
}

/** Fortnightly NDVI curve over a crop cycle. */
export function ndviSeries(sel: Selection) {
  const { village, crop } = resolve(sel);
  const m = metricsFor(sel);
  const r = seeded(`${village.id}:${crop.id}:ndvi`);
  return Array.from({ length: 12 }, (_, i) => {
    const growth = Math.sin((Math.PI * (i + 0.5)) / 12);
    const peak = m.ndvi + 0.06;
    return {
      period: `Wk ${i * 2 + 2}`,
      ndvi: round(clamp(0.15 + (peak - 0.15) * growth + (r() - 0.5) * 0.03, 0.05, 0.92), 2),
      healthyRef: round(0.15 + 0.7 * growth, 2),
    };
  });
}

/** 10x10 simulated NDVI field grid around the selected village. */
export function ndviGrid(sel: Selection, size = 10) {
  const { village, crop } = resolve(sel);
  const m = metricsFor(sel);
  const r = seeded(`${village.id}:${crop.id}:grid`);
  const span = 0.03; // degrees
  const cells: { row: number; col: number; ndvi: number; bounds: [[number, number], [number, number]] }[] = [];
  const hotspotR = Math.floor(r() * size);
  const hotspotC = Math.floor(r() * size);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const dist = Math.hypot(row - hotspotR, col - hotspotC);
      const stress = dist < 3 ? (3 - dist) * 0.08 : 0;
      const ndvi = round(clamp(m.ndvi + (r() - 0.5) * 0.18 - stress, 0.05, 0.92), 2);
      const lat0 = village.lat + span / 2 - (row * span) / size;
      const lng0 = village.lng - span / 2 + (col * span) / size;
      cells.push({ row, col, ndvi, bounds: [[lat0, lng0], [lat0 - span / size, lng0 + span / size]] });
    }
  }
  return cells;
}

export function ndviLabel(v: number) {
  if (v < 0.2) return "Bare / stressed";
  if (v < 0.4) return "Sparse";
  if (v < 0.6) return "Moderate";
  return "Dense & healthy";
}

/** Risk snapshot for every demo village, for the map. */
export function allLocationsRisk(cropId: string) {
  const crop = findCrop(cropId);
  return REGIONS.flatMap((s) =>
    s.districts.flatMap((d) =>
      d.villages.map((v) => {
        const m = computeMetrics(d, v, crop);
        return {
          stateId: s.id,
          stateName: s.name,
          districtId: d.id,
          districtName: d.name,
          villageId: v.id,
          villageName: v.name,
          lat: v.lat,
          lng: v.lng,
          droughtProb: m.droughtProb,
          excessRainRisk: m.excessRainRisk,
          climateRisk: m.climateRisk,
          riskLevel: m.riskLevel,
        };
      }),
    ),
  );
}

/** Crop comparison for the selected location. */
export function cropComparison(sel: Selection) {
  const { district, village } = resolve(sel);
  return CROPS.map((c) => {
    const m = computeMetrics(district, village, c);
    return { crop: c.name.split(" (")[0], cropId: c.id, health: m.cropHealth, risk: m.climateRisk, yieldChange: m.yieldChange };
  });
}
