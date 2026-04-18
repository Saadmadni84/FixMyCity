export const WARDS = Array.from({ length: 20 }, (_, i) => `Ward ${i + 1}`);

export function normalizeWard(input: unknown): string {
  const value = String(input || "").trim().toLowerCase();
  if (!value) return "";

  const exact = WARDS.find((ward) => ward.toLowerCase() === value);
  if (exact) return exact;

  const numeric = value.replace(/^ward\s*/i, "");
  const asNumber = Number(numeric);
  if (Number.isFinite(asNumber) && asNumber > 0 && asNumber <= WARDS.length) {
    return `Ward ${asNumber}`;
  }

  return "";
}

export function parseWardsInput(input: unknown): string[] {
  const values = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];

  const unique = Array.from(new Set(values.map((v) => normalizeWard(v))));
  return unique.filter(Boolean);
}