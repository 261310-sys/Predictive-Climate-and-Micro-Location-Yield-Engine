/**
 * Rule-based advisory engine (demo). Produces crop-specific mitigation
 * recommendations from simulated metrics. Not a live AI model — designed so a
 * real LLM / agronomy model can replace `buildRecommendations` and `answer`.
 */
import type { Metrics } from "./agri-model";
import type { Crop, District, Village } from "./regions";

export type Priority = "High" | "Medium" | "Low";
export type AdviceCategory = "Irrigation" | "Rainfall preparedness" | "Heat stress" | "Soil health" | "Crop protection" | "Yield";

export interface Recommendation {
  category: AdviceCategory;
  priority: Priority;
  title: string;
  detail: string;
}

type Tips = { irrigation: string; drought: string; rain: string; heat: string; protect: string };
const CROP_TIPS: Record<string, Tips> = {
  rice: {
    irrigation: "Adopt Alternate Wetting & Drying (AWD): re-flood only when the water level falls 15 cm below the soil surface — saves 20–30% water.",
    drought: "Switch to short-duration varieties (e.g. PR 126, Pusa Basmati 1509) or Direct Seeded Rice to cut water demand.",
    rain: "Keep field bunds strengthened and drainage outlets open; submergence-tolerant Swarna-Sub1 can survive 2 weeks underwater.",
    heat: "Maintain 5 cm standing water during flowering to cool the canopy; avoid nitrogen top-dress during heat waves.",
    protect: "High humidity favours blast and brown plant hopper — scout weekly and avoid excess urea.",
  },
  wheat: {
    irrigation: "Prioritise irrigation at Crown Root Initiation (21 DAS), jointing and grain-filling — the three most yield-critical stages.",
    drought: "Use mulching and sprinkler irrigation; consider drought-tolerant varieties such as HD 3086 or DBW 187.",
    rain: "Unseasonal rain at harvest causes lodging and grain sprouting — harvest early and arrange covered storage.",
    heat: "Terminal heat above 32°C shrivels grain. Apply a light irrigation and 2% KNO₃ foliar spray at grain-filling.",
    protect: "Watch for yellow rust in cool, humid spells; spray propiconazole at first sign.",
  },
  cotton: {
    irrigation: "Use drip irrigation with fertigation; critical stages are flowering and boll development.",
    drought: "Retain crop residue as mulch and opt for compact, early-maturing hybrids.",
    rain: "Excess rain causes boll rot and flower shedding — ensure ridge-and-furrow drainage.",
    heat: "Spray 2% DAP + 1% KNO₃ to reduce square and boll shedding under heat stress.",
    protect: "Install pheromone traps (5/acre) for pink bollworm monitoring.",
  },
  sugarcane: {
    irrigation: "Drip irrigation with trash mulching can save 40% water while maintaining cane weight.",
    drought: "Trash mulching and 2.5% potash spray during grand growth helps the crop withstand moisture stress.",
    rain: "Earth up and prop canes before heavy rain to prevent lodging; clear drainage channels.",
    heat: "Increase irrigation frequency in summer; intercrop with short legumes to shade soil.",
    protect: "Monitor for early shoot borer in dry spells and red rot after waterlogging.",
  },
  maize: {
    irrigation: "Tasseling and silking are the most sensitive stages — never skip irrigation then.",
    drought: "Ridge sowing with conservation tillage retains moisture; use drought-tolerant hybrids.",
    rain: "Maize is very sensitive to waterlogging; sow on raised beds in high-rainfall zones.",
    heat: "Heat at silking reduces pollination — schedule sowing so flowering avoids peak heat.",
    protect: "Scout for Fall Armyworm whorl damage; release Trichogramma or spray emamectin benzoate.",
  },
  soybean: {
    irrigation: "Give protective irrigation at pod filling if dry spell exceeds 10 days.",
    drought: "Broad Bed Furrow (BBF) sowing conserves moisture and drains excess water.",
    rain: "BBF or ridge-furrow layout prevents waterlogging damage during heavy monsoon spells.",
    heat: "Avoid late sowing to keep flowering away from heat spikes.",
    protect: "Watch for girdle beetle and yellow mosaic virus; remove infected plants early.",
  },
  groundnut: {
    irrigation: "Critical stages: pegging and pod development. Sprinklers improve pod filling.",
    drought: "Apply gypsum at 500 kg/ha at flowering and use polythene mulch to conserve moisture.",
    rain: "Excess rain at harvest causes pod sprouting — harvest promptly and dry pods quickly.",
    heat: "Light, frequent irrigations protect pegging under high soil temperatures.",
    protect: "Leaf spot and rust increase in humid spells; spray mancozeb or hexaconazole.",
  },
  chickpea: {
    irrigation: "One irrigation at pre-flowering and one at pod formation is usually sufficient — avoid over-irrigation.",
    drought: "Chickpea tolerates residual moisture; seed priming and early sowing beat terminal drought.",
    rain: "Unseasonal winter rain raises Botrytis grey mould risk — maintain wider row spacing.",
    heat: "Choose early varieties (e.g. JG 14) to escape terminal heat.",
    protect: "Install bird perches and pheromone traps for Helicoverpa pod borer.",
  },
  bajra: {
    irrigation: "Bajra needs little water — one irrigation at flowering boosts yield significantly in dry years.",
    drought: "Thin to optimum stand and use hybrids like HHB 67 Improved for arid zones.",
    rain: "Avoid sowing in low-lying fields prone to waterlogging.",
    heat: "Bajra is heat-hardy; still protect seedlings from hot winds with timely sowing after first rains.",
    protect: "Downy mildew risk rises with humidity — treat seed with metalaxyl.",
  },
};

export function tipsFor(crop: Crop): Tips {
  return CROP_TIPS[crop.id] ?? CROP_TIPS["rice"]!;
}

const pri = (score: number): Priority => (score >= 60 ? "High" : score >= 35 ? "Medium" : "Low");

export function buildRecommendations(m: Metrics, crop: Crop, district: District): Recommendation[] {
  const t = tipsFor(crop);
  const recs: Recommendation[] = [];

  const moistureGap = 28 - m.soilMoisture;
  recs.push({
    category: "Irrigation",
    priority: moistureGap > 8 ? "High" : moistureGap > 2 ? "Medium" : "Low",
    title:
      moistureGap > 2
        ? `Soil moisture ${m.soilMoisture}% is below the ~28% target — irrigate within 2–3 days`
        : `Soil moisture ${m.soilMoisture}% is adequate — hold irrigation and monitor`,
    detail: t.irrigation,
  });

  if (m.droughtProb >= 35) {
    recs.push({ category: "Irrigation", priority: pri(m.droughtProb), title: `Drought probability ${m.droughtProb}% — conserve water`, detail: t.drought });
  }

  recs.push({
    category: "Rainfall preparedness",
    priority: pri(Math.max(m.excessRainRisk, m.unseasonalRainRisk)),
    title:
      m.excessRainRisk >= m.unseasonalRainRisk
        ? `Excess rainfall risk ${m.excessRainRisk}% — prepare drainage`
        : `Unseasonal rain risk ${m.unseasonalRainRisk}% — protect harvest`,
    detail: t.rain,
  });

  recs.push({
    category: "Heat stress",
    priority: pri(m.heatStressRisk),
    title: `Heat stress risk ${m.heatStressRisk}% (crop limit ~${crop.heatLimit}°C)`,
    detail: t.heat,
  });

  const phOk = m.soilPh >= crop.optPh[0] && m.soilPh <= crop.optPh[1];
  recs.push({
    category: "Soil health",
    priority: phOk ? "Low" : "Medium",
    title: phOk
      ? `Soil pH ${m.soilPh} is within the ${crop.optPh[0]}–${crop.optPh[1]} range`
      : `Soil pH ${m.soilPh} is outside the ideal ${crop.optPh[0]}–${crop.optPh[1]} range`,
    detail: phOk
      ? `Maintain organic matter with FYM or green manure. ${district.soilType} soils benefit from a soil test every season (Soil Health Card scheme).`
      : m.soilPh > crop.optPh[1]
        ? "Alkaline soil: apply gypsum per soil-test recommendation and use acidifying fertilisers like ammonium sulphate."
        : "Acidic soil: apply agricultural lime per soil-test recommendation before sowing.",
  });

  recs.push({ category: "Crop protection", priority: m.humidity > 70 ? "Medium" : "Low", title: `Humidity ${m.humidity}% — pest & disease watch`, detail: t.protect });

  recs.push({
    category: "Yield",
    priority: m.yieldChange < -10 ? "High" : m.yieldChange < 0 ? "Medium" : "Low",
    title: `Expected yield ${m.expectedYield} t/ha (${m.yieldChange > 0 ? "+" : ""}${m.yieldChange}% vs normal)`,
    detail:
      m.climateRisk >= 50
        ? "Consider enrolling in PMFBY crop insurance before the cut-off date and staggering sowing to spread risk."
        : "Conditions are favourable — ensure timely nutrient application to capture the yield potential.",
  });

  const order: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
  return recs.sort((a, b) => order[a.priority] - order[b.priority]);
}

export interface ChatContext {
  m: Metrics;
  crop: Crop;
  district: District;
  village: Village;
}

export const QUICK_PROMPTS = [
  "When should I irrigate?",
  "Is there a drought risk?",
  "How do I prepare for heavy rain?",
  "How do I protect my crop from heat?",
  "Is my soil pH okay?",
  "What yield can I expect?",
  "Which pests should I watch for?",
];

/** Predefined demo responses, personalised with the current simulated context. */
export function answer(question: string, ctx: ChatContext): string {
  const q = question.toLowerCase();
  const { m, crop, district, village } = ctx;
  const t = tipsFor(crop);
  const where = `${village.name}, ${district.name}`;

  if (/^(hi|hello|namaste|hey)\b/.test(q)) {
    return `Namaste! I'm the AgriCast demo assistant. I'm looking at ${crop.name} in ${where}. Ask me about irrigation, rain, heat, soil, pests or yield.`;
  }
  if (/irrigat|water|moisture/.test(q)) {
    return `Simulated soil moisture in ${where} is ${m.soilMoisture}% (target ≈ 28%). ${
      m.soilMoisture < 26 ? "I'd irrigate in the next 2–3 days, preferably early morning to reduce evaporation." : "No irrigation needed right now — re-check in 3–4 days."
    }\n\nFor ${crop.name}: ${t.irrigation}`;
  }
  if (/drought|dry|deficit/.test(q)) {
    return `Drought probability is ${m.droughtProb}% with seasonal rainfall ${m.rainfallDeviation >= 0 ? "+" : ""}${m.rainfallDeviation}% vs normal. ${
      m.droughtProb >= 50 ? "That's a significant risk." : "Risk is manageable."
    }\n\n${t.drought}`;
  }
  if (/rain|flood|monsoon|waterlog|storm/.test(q)) {
    return `Excess rainfall risk is ${m.excessRainRisk}% and unseasonal rain risk is ${m.unseasonalRainRisk}%.\n\n${t.rain}\n\nTip: keep harvested produce under tarpaulin and check IMD district bulletins before field operations.`;
  }
  if (/heat|temperature|hot|sun/.test(q)) {
    return `Current simulated temperature is ${m.temperature}°C; ${crop.name} starts suffering above ~${crop.heatLimit}°C. Heat stress risk: ${m.heatStressRisk}%.\n\n${t.heat}`;
  }
  if (/soil|ph|fertili|nutrient|manure/.test(q)) {
    const ok = m.soilPh >= crop.optPh[0] && m.soilPh <= crop.optPh[1];
    return `Soil pH is ${m.soilPh} (${district.soilType} soil). ${crop.name} prefers ${crop.optPh[0]}–${crop.optPh[1]}, so it's ${ok ? "within range 👍" : "outside the ideal range"}.\n\n${
      ok ? "Keep adding organic matter and follow your Soil Health Card dosage." : m.soilPh > crop.optPh[1] ? "Apply gypsum based on a soil test to reduce alkalinity." : "Apply lime based on a soil test to reduce acidity."
    }`;
  }
  if (/pest|disease|insect|fung|bug/.test(q)) {
    return `With humidity at ${m.humidity}%, here's what to watch for in ${crop.name}:\n\n${t.protect}\n\nAlways follow label doses and consult your local KVK before spraying.`;
  }
  if (/yield|harvest|production|income/.test(q)) {
    return `Simulated expected yield is ${m.expectedYield} t/ha versus a local normal of ${m.normalYield} t/ha (${m.yieldChange > 0 ? "+" : ""}${m.yieldChange}%). Crop health index: ${m.cropHealth}/100.\n\n${
      m.climateRisk >= 50 ? "Given the elevated climate risk, consider PMFBY crop insurance." : "Timely nutrient and pest management should help you hit this target."
    }`;
  }
  if (/sow|plant|when|season|variety/.test(q)) {
    return `${crop.name} is a ${crop.season} crop. Optimal temperature range is ${crop.optTemp[0]}–${crop.optTemp[1]}°C. In ${district.name}, align sowing with the onset of reliable moisture and choose varieties recommended by your state agricultural university.`;
  }
  if (/insurance|scheme|pmfby|subsidy|loan/.test(q)) {
    return "Key schemes: PMFBY (crop insurance), PM-KISAN (income support), PMKSY 'Per Drop More Crop' (micro-irrigation subsidy) and the Soil Health Card scheme. Visit your nearest Common Service Centre or bank branch to enrol.";
  }
  return `I'm a demo assistant with predefined answers, so I may not understand that one. Try asking about irrigation, drought, rain, heat, soil pH, pests or yield for ${crop.name} in ${where}.`;
}
