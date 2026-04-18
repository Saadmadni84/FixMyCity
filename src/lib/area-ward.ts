import { normalizeWard } from "./wards";

const WARD_AREA_MAP: Record<string, string[]> = {
  "Ward 1": ["Civil Lines", "Old Secretariat", "Clock Tower"],
  "Ward 2": ["University Road", "Model Town", "North Avenue"],
  "Ward 3": ["Central Market", "Connaught Place", "Gate 2", "Market Road"],
  "Ward 4": ["Karampura", "West End", "Shastri Market"],
  "Ward 5": ["Sector 4", "Green Park", "Sports Complex"],
  "Ward 6": ["Sector 8", "Lake View", "Rose Colony"],
  "Ward 7": ["Nehru Street", "Post Office", "Lajpat Nagar"],
  "Ward 8": ["Industrial Area", "Transport Nagar", "Depot Road"],
  "Ward 9": ["MG Road", "Community Hall", "Riverfront"],
  "Ward 10": ["Sector 11", "Power House", "Court Road"],
  "Ward 11": ["Sector 12", "Railway Colony", "Hospital Road"],
  "Ward 12": ["Bus Stop 14", "Station Road", "Karol Bagh"],
  "Ward 13": ["Sadar Bazar", "Temple Road", "Kailash Colony"],
  "Ward 14": ["Airport Road", "Cantonment", "Metro Enclave"],
  "Ward 15": ["Sector 15", "IT Park", "Tech Valley"],
  "Ward 16": ["Sector 16", "Milan Chowk", "East End"],
  "Ward 17": ["Sector 17", "Canal Road", "Silver Oak"],
  "Ward 18": ["Sector 18", "Palm Vihar", "South Avenue"],
  "Ward 19": ["Sector 19", "New Township", "Lake Road"],
  "Ward 20": ["Sector 20", "Village Road", "Ring Road"],
};

function normalizeText(input: string): string {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const KNOWN_AREAS = Object.values(WARD_AREA_MAP).flat();

export function inferWardFromText(input: unknown): string | null {
  const text = normalizeText(String(input || ""));
  if (!text) return null;

  // First, handle direct ward values like "ward 12".
  const directWard = normalizeWard(text);
  if (directWard) return directWard;

  for (const [ward, areas] of Object.entries(WARD_AREA_MAP)) {
    const match = areas.some((area) => {
      const needle = normalizeText(area);
      return needle && text.includes(needle);
    });
    if (match) return ward;
  }

  return null;
}

export function getAreasByWard(ward: string): string[] {
  const normalized = normalizeWard(ward);
  if (!normalized) return [];
  return WARD_AREA_MAP[normalized] || [];
}
