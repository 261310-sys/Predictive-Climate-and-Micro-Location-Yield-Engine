/**
 * Demo region catalogue for Indian agricultural areas.
 * Coordinates are approximate real locations; climate baselines are
 * illustrative seasonal averages used ONLY to drive the simulation.
 * Replace with IMD / ISRO Bhuvan / Copernicus derived values when integrating real data.
 */

export type SoilType = "Alluvial" | "Black (Regur)" | "Red Laterite" | "Arid Sandy" | "Clay Loam";

export interface Village {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface District {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Mean growing-season temperature (°C) */
  baseTemp: number;
  /** Normal annual rainfall (mm) */
  annualRain: number;
  /** Mean relative humidity (%) */
  humidity: number;
  soilPh: number;
  soilType: SoilType;
  /** Share of net sown area under irrigation (0-1) */
  irrigation: number;
  /** Productivity multiplier vs national average yield */
  productivity: number;
  villages: Village[];
}

export interface StateRegion {
  id: string;
  name: string;
  districts: District[];
}

export const REGIONS: StateRegion[] = [
  {
    id: "punjab",
    name: "Punjab",
    districts: [
      {
        id: "ludhiana", name: "Ludhiana", lat: 30.9, lng: 75.85,
        baseTemp: 26, annualRain: 680, humidity: 58, soilPh: 7.9, soilType: "Alluvial", irrigation: 0.98, productivity: 1.45,
        villages: [
          { id: "khanna", name: "Khanna", lat: 30.7, lng: 76.22 },
          { id: "jagraon", name: "Jagraon", lat: 30.79, lng: 75.47 },
          { id: "samrala", name: "Samrala", lat: 30.84, lng: 76.19 },
        ],
      },
      {
        id: "bathinda", name: "Bathinda", lat: 30.21, lng: 74.95,
        baseTemp: 28, annualRain: 430, humidity: 50, soilPh: 8.3, soilType: "Arid Sandy", irrigation: 0.95, productivity: 1.25,
        villages: [
          { id: "rampura-phul", name: "Rampura Phul", lat: 30.27, lng: 75.24 },
          { id: "talwandi-sabo", name: "Talwandi Sabo", lat: 29.98, lng: 75.08 },
        ],
      },
    ],
  },
  {
    id: "maharashtra",
    name: "Maharashtra",
    districts: [
      {
        id: "nashik", name: "Nashik", lat: 20.0, lng: 73.79,
        baseTemp: 27, annualRain: 1050, humidity: 62, soilPh: 7.4, soilType: "Black (Regur)", irrigation: 0.32, productivity: 1.05,
        villages: [
          { id: "niphad", name: "Niphad", lat: 20.08, lng: 74.11 },
          { id: "sinnar", name: "Sinnar", lat: 19.85, lng: 74.0 },
          { id: "dindori", name: "Dindori", lat: 20.2, lng: 73.83 },
        ],
      },
      {
        id: "yavatmal", name: "Yavatmal", lat: 20.39, lng: 78.12,
        baseTemp: 29, annualRain: 910, humidity: 57, soilPh: 7.8, soilType: "Black (Regur)", irrigation: 0.12, productivity: 0.82,
        villages: [
          { id: "pusad", name: "Pusad", lat: 19.91, lng: 77.57 },
          { id: "wani", name: "Wani", lat: 20.06, lng: 78.95 },
        ],
      },
    ],
  },
  {
    id: "karnataka",
    name: "Karnataka",
    districts: [
      {
        id: "mandya", name: "Mandya", lat: 12.52, lng: 76.9,
        baseTemp: 26, annualRain: 700, humidity: 66, soilPh: 6.6, soilType: "Red Laterite", irrigation: 0.55, productivity: 1.1,
        villages: [
          { id: "maddur", name: "Maddur", lat: 12.58, lng: 77.04 },
          { id: "srirangapatna", name: "Srirangapatna", lat: 12.42, lng: 76.69 },
        ],
      },
      {
        id: "dharwad", name: "Dharwad", lat: 15.46, lng: 75.01,
        baseTemp: 25, annualRain: 800, humidity: 63, soilPh: 7.6, soilType: "Black (Regur)", irrigation: 0.2, productivity: 0.92,
        villages: [
          { id: "kundgol", name: "Kundgol", lat: 15.26, lng: 75.25 },
          { id: "navalgund", name: "Navalgund", lat: 15.56, lng: 75.36 },
        ],
      },
    ],
  },
  {
    id: "uttar-pradesh",
    name: "Uttar Pradesh",
    districts: [
      {
        id: "meerut", name: "Meerut", lat: 28.98, lng: 77.71,
        baseTemp: 26, annualRain: 830, humidity: 64, soilPh: 7.5, soilType: "Alluvial", irrigation: 0.9, productivity: 1.2,
        villages: [
          { id: "sardhana", name: "Sardhana", lat: 29.15, lng: 77.62 },
          { id: "mawana", name: "Mawana", lat: 29.1, lng: 77.92 },
        ],
      },
      {
        id: "varanasi", name: "Varanasi", lat: 25.32, lng: 82.97,
        baseTemp: 27, annualRain: 1020, humidity: 68, soilPh: 7.2, soilType: "Alluvial", irrigation: 0.78, productivity: 1.0,
        villages: [
          { id: "pindra", name: "Pindra", lat: 25.48, lng: 82.78 },
          { id: "cholapur", name: "Cholapur", lat: 25.48, lng: 83.07 },
        ],
      },
    ],
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    districts: [
      {
        id: "jodhpur", name: "Jodhpur", lat: 26.24, lng: 73.02,
        baseTemp: 31, annualRain: 360, humidity: 42, soilPh: 8.4, soilType: "Arid Sandy", irrigation: 0.28, productivity: 0.68,
        villages: [
          { id: "bilara", name: "Bilara", lat: 26.18, lng: 73.7 },
          { id: "phalodi", name: "Phalodi", lat: 27.13, lng: 72.36 },
        ],
      },
      {
        id: "sri-ganganagar", name: "Sri Ganganagar", lat: 29.9, lng: 73.88,
        baseTemp: 28, annualRain: 290, humidity: 46, soilPh: 8.2, soilType: "Arid Sandy", irrigation: 0.85, productivity: 1.08,
        villages: [
          { id: "suratgarh", name: "Suratgarh", lat: 29.32, lng: 73.9 },
          { id: "padampur", name: "Padampur", lat: 29.7, lng: 73.62 },
        ],
      },
    ],
  },
  {
    id: "andhra-pradesh",
    name: "Andhra Pradesh",
    districts: [
      {
        id: "guntur", name: "Guntur", lat: 16.31, lng: 80.44,
        baseTemp: 30, annualRain: 900, humidity: 70, soilPh: 7.3, soilType: "Black (Regur)", irrigation: 0.6, productivity: 1.15,
        villages: [
          { id: "tenali", name: "Tenali", lat: 16.24, lng: 80.64 },
          { id: "narasaraopet", name: "Narasaraopet", lat: 16.23, lng: 80.05 },
        ],
      },
      {
        id: "anantapur", name: "Anantapur", lat: 14.68, lng: 77.6,
        baseTemp: 29, annualRain: 550, humidity: 55, soilPh: 6.9, soilType: "Red Laterite", irrigation: 0.15, productivity: 0.72,
        villages: [
          { id: "dharmavaram", name: "Dharmavaram", lat: 14.41, lng: 77.72 },
          { id: "kadiri", name: "Kadiri", lat: 14.11, lng: 78.16 },
        ],
      },
    ],
  },
  {
    id: "tamil-nadu",
    name: "Tamil Nadu",
    districts: [
      {
        id: "thanjavur", name: "Thanjavur", lat: 10.79, lng: 79.14,
        baseTemp: 29, annualRain: 1100, humidity: 74, soilPh: 7.0, soilType: "Clay Loam", irrigation: 0.7, productivity: 1.12,
        villages: [
          { id: "kumbakonam", name: "Kumbakonam", lat: 10.96, lng: 79.38 },
          { id: "pattukkottai", name: "Pattukkottai", lat: 10.43, lng: 79.32 },
        ],
      },
    ],
  },
];

export type CropId =
  | "rice"
  | "wheat"
  | "cotton"
  | "sugarcane"
  | "maize"
  | "soybean"
  | "groundnut"
  | "chickpea"
  | "bajra";

export interface Crop {
  id: CropId;
  name: string;
  hindi: string;
  season: "Kharif" | "Rabi" | "Annual";
  optTemp: [number, number];
  /** Seasonal water requirement (mm) */
  waterNeed: number;
  optPh: [number, number];
  /** Indicative national average yield, tonnes / hectare */
  baseYield: number;
  heatLimit: number;
}

export const CROPS: Crop[] = [
  { id: "rice", name: "Rice (Paddy)", hindi: "धान", season: "Kharif", optTemp: [22, 32], waterNeed: 1200, optPh: [5.5, 7.0], baseYield: 4.0, heatLimit: 35 },
  { id: "wheat", name: "Wheat", hindi: "गेहूँ", season: "Rabi", optTemp: [15, 25], waterNeed: 450, optPh: [6.0, 7.5], baseYield: 3.5, heatLimit: 32 },
  { id: "cotton", name: "Cotton", hindi: "कपास", season: "Kharif", optTemp: [21, 32], waterNeed: 700, optPh: [6.0, 8.0], baseYield: 1.6, heatLimit: 38 },
  { id: "sugarcane", name: "Sugarcane", hindi: "गन्ना", season: "Annual", optTemp: [20, 33], waterNeed: 1800, optPh: [6.5, 7.5], baseYield: 80, heatLimit: 38 },
  { id: "maize", name: "Maize", hindi: "मक्का", season: "Kharif", optTemp: [18, 30], waterNeed: 550, optPh: [5.8, 7.5], baseYield: 3.2, heatLimit: 35 },
  { id: "soybean", name: "Soybean", hindi: "सोयाबीन", season: "Kharif", optTemp: [20, 30], waterNeed: 500, optPh: [6.0, 7.5], baseYield: 1.1, heatLimit: 35 },
  { id: "groundnut", name: "Groundnut", hindi: "मूंगफली", season: "Kharif", optTemp: [22, 30], waterNeed: 500, optPh: [6.0, 7.5], baseYield: 1.6, heatLimit: 36 },
  { id: "chickpea", name: "Chickpea (Gram)", hindi: "चना", season: "Rabi", optTemp: [15, 27], waterNeed: 350, optPh: [6.0, 8.0], baseYield: 1.1, heatLimit: 32 },
  { id: "bajra", name: "Pearl Millet (Bajra)", hindi: "बाजरा", season: "Kharif", optTemp: [25, 35], waterNeed: 350, optPh: [6.5, 8.5], baseYield: 1.4, heatLimit: 42 },
];

export function findState(id: string) {
  return REGIONS.find((s) => s.id === id) ?? REGIONS[0]!;
}
export function findDistrict(stateId: string, districtId: string) {
  const s = findState(stateId);
  return s.districts.find((d) => d.id === districtId) ?? s.districts[0]!;
}
export function findVillage(stateId: string, districtId: string, villageId: string) {
  const d = findDistrict(stateId, districtId);
  return d.villages.find((v) => v.id === villageId) ?? d.villages[0]!;
}
export function findCrop(id: string) {
  return CROPS.find((c) => c.id === id) ?? CROPS[0]!;
}
