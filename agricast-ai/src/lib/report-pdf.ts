import type { Metrics } from "./agri-model";
import type { Recommendation } from "./advice";
import type { Crop, District, StateRegion, Village } from "./regions";

export interface ReportInput {
  farmer: string;
  area: string;
  state: StateRegion;
  district: District;
  village: Village;
  crop: Crop;
  m: Metrics;
  recs: Recommendation[];
  generatedAt: Date;
  reportId: string;
}

/** Built-in PDF fonts only cover Latin-1; normalise typographic characters. */
const clean = (s: string) =>
  s
    .replace(/[–—]/g, "-")
    .replace(/≈/g, "~")
    .replace(/₃/g, "3")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[^\x20-\xFF\n]/g, "");

type RGB = [number, number, number];
const FOREST: RGB = [27, 61, 44];
const LEAF: RGB = [176, 224, 88];
const MUTED: RGB = [110, 125, 115];
const RISK: Record<"Low" | "Moderate" | "High" | "Severe", RGB> = { Low: [58, 156, 96], Moderate: [214, 168, 48], High: [222, 120, 50], Severe: [200, 60, 50] };

export async function downloadRiskReport(r: ReportInput) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 16;
  let y = 0;

  // Header band
  doc.setFillColor(...FOREST);
  doc.rect(0, 0, W, 38, "F");
  doc.setFillColor(...LEAF);
  doc.roundedRect(M, 11, 14, 14, 3, 3, "F");
  doc.setTextColor(...FOREST);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("AC", M + 7, 20, { align: "center" });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("AgriCast AI", M + 19, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Climate Risk Report", M + 19, 24);
  doc.setFontSize(8);
  doc.text(`Report ${r.reportId}`, W - M, 16, { align: "right" });
  doc.text(r.generatedAt.toLocaleString("en-IN"), W - M, 21, { align: "right" });
  doc.setTextColor(...LEAF);
  doc.text("SIMULATED DEMONSTRATION DATA", W - M, 30, { align: "right" });

  y = 50;
  doc.setTextColor(...FOREST);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(clean(`${r.village.name}, ${r.district.name}, ${r.state.name}`), M, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(
    clean(
      `${r.crop.name} (${r.crop.season})  |  ${r.district.soilType} soil  |  ${r.village.lat.toFixed(2)}N ${r.village.lng.toFixed(2)}E` +
        (r.farmer ? `  |  Farmer: ${r.farmer}` : "") +
        (r.area ? `  |  Area: ${r.area} ha` : ""),
    ),
    M,
    y,
  );

  // Risk box
  y += 8;
  const rc = RISK[r.m.riskLevel];
  doc.setFillColor(...rc);
  doc.roundedRect(M, y, W - 2 * M, 22, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("OVERALL CLIMATE RISK", M + 6, y + 8);
  doc.setFontSize(18);
  doc.text(`${r.m.riskLevel.toUpperCase()}  ${r.m.climateRisk}/100`, M + 6, y + 17);
  doc.setFontSize(9);
  doc.text("EXPECTED YIELD", W - M - 6, y + 8, { align: "right" });
  doc.setFontSize(16);
  doc.text(`${r.m.expectedYield} t/ha (${r.m.yieldChange > 0 ? "+" : ""}${r.m.yieldChange}%)`, W - M - 6, y + 17, { align: "right" });

  // Metrics grid
  y += 32;
  doc.setTextColor(...FOREST);
  doc.setFontSize(12);
  doc.text("Current conditions", M, y);
  y += 4;
  const metrics: [string, string][] = [
    ["Temperature", `${r.m.temperature} C`],
    ["Rainfall (30d)", `${r.m.rainfall30d} mm`],
    ["Season rain vs normal", `${r.m.rainfallDeviation > 0 ? "+" : ""}${r.m.rainfallDeviation}%`],
    ["Humidity", `${r.m.humidity}%`],
    ["Soil moisture", `${r.m.soilMoisture}% VWC`],
    ["Soil pH", `${r.m.soilPh}`],
    ["Crop health index", `${r.m.cropHealth}/100`],
    ["NDVI", `${r.m.ndvi}`],
  ];
  const colW = (W - 2 * M) / 4;
  metrics.forEach(([k, v], i) => {
    const cx = M + (i % 4) * colW;
    const cy = y + Math.floor(i / 4) * 16;
    doc.setFillColor(240, 246, 238);
    doc.roundedRect(cx, cy, colW - 3, 13, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(k, cx + 3, cy + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...FOREST);
    doc.text(v, cx + 3, cy + 10.5);
  });
  y += 36;

  // Hazards
  doc.setFontSize(12);
  doc.text("Hazard probabilities", M, y);
  y += 5;
  const hazards: [string, number][] = [
    ["Drought", r.m.droughtProb],
    ["Excess rainfall", r.m.excessRainRisk],
    ["Unseasonal rainfall", r.m.unseasonalRainRisk],
    ["Heat stress", r.m.heatStressRisk],
  ];
  hazards.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...FOREST);
    doc.text(k, M, y + 3.5);
    doc.setFillColor(232, 238, 230);
    doc.roundedRect(M + 42, y, 110, 4.5, 2, 2, "F");
    const c = v < 30 ? RISK.Low : v < 50 ? RISK.Moderate : v < 70 ? RISK.High : RISK.Severe;
    doc.setFillColor(...c);
    doc.roundedRect(M + 42, y, Math.max(4, (110 * v) / 100), 4.5, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.text(`${v}%`, W - M, y + 3.5, { align: "right" });
    y += 8;
  });

  // Recommendations
  y += 4;
  doc.setFontSize(12);
  doc.text("Recommended actions", M, y);
  y += 6;
  for (const rec of r.recs) {
    const body = doc.splitTextToSize(clean(rec.detail), W - 2 * M - 8) as string[];
    const h = 10 + body.length * 4.2;
    if (y + h > 275) {
      doc.addPage();
      y = 20;
    }
    const pc = rec.priority === "High" ? RISK.Severe : rec.priority === "Medium" ? RISK.Moderate : RISK.Low;
    doc.setFillColor(...pc);
    doc.rect(M, y - 3.5, 1.4, h - 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...pc);
    doc.text(`${rec.priority.toUpperCase()} PRIORITY  |  ${rec.category.toUpperCase()}`, M + 5, y);
    doc.setFontSize(10);
    doc.setTextColor(...FOREST);
    doc.text(clean(rec.title), M + 5, y + 5, { maxWidth: W - 2 * M - 8 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(body, M + 5, y + 10);
    y += h + 2;
  }

  // Footer disclaimer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(220, 228, 218);
    doc.line(M, 282, W - M, 282);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(
      "Disclaimer: All values are simulated demonstration data from the AgriCast AI prototype. No live weather, satellite, soil-sensor or ML feeds are connected.",
      M,
      287,
      { maxWidth: W - 2 * M - 15 },
    );
    doc.text(`${p}/${pages}`, W - M, 287, { align: "right" });
  }

  doc.save(`AgriCast-Risk-Report-${r.village.name}-${r.crop.id}.pdf`.replace(/\s+/g, "-"));
}
