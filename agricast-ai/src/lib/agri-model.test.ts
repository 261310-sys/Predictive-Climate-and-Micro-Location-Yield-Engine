import { describe, expect, it } from "vitest";
import { metricsFor, riskLevelFor } from "./agri-model";
import { REGIONS, CROPS } from "./regions";

describe("riskLevelFor", () => {
  it("classifies scores into Low < 30 ≤ Moderate < 50 ≤ High < 70 ≤ Severe", () => {
    expect(riskLevelFor(29)).toBe("Low");
    expect(riskLevelFor(30)).toBe("Moderate");
    expect(riskLevelFor(50)).toBe("High");
    expect(riskLevelFor(70)).toBe("Severe");
  });
});

describe("simulation engine", () => {
  const sel = { stateId: "punjab", districtId: "ludhiana", villageId: "khanna", cropId: "wheat" };

  it("is deterministic for the same location and crop", () => {
    expect(metricsFor(sel)).toEqual(metricsFor(sel));
  });

  it("changes output when the location or crop changes", () => {
    const other = metricsFor({ stateId: "rajasthan", districtId: "jodhpur", villageId: "phalodi", cropId: "wheat" });
    expect(other.droughtProb).not.toBe(metricsFor(sel).droughtProb);
    expect(metricsFor({ ...sel, cropId: "rice" }).expectedYield).not.toBe(metricsFor(sel).expectedYield);
  });

  it("keeps every risk score within 0–100 for all demo villages and crops", () => {
    for (const s of REGIONS)
      for (const d of s.districts)
        for (const v of d.villages)
          for (const c of CROPS) {
            const m = metricsFor({ stateId: s.id, districtId: d.id, villageId: v.id, cropId: c.id });
            for (const k of ["droughtProb", "excessRainRisk", "unseasonalRainRisk", "heatStressRisk", "climateRisk", "cropHealth"] as const) {
              expect(m[k]).toBeGreaterThanOrEqual(0);
              expect(m[k]).toBeLessThanOrEqual(100);
            }
          }
  });
});
