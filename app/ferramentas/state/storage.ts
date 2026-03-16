const STORAGE_KEYS = {
  users: "ferramentaria_tool_users",
  models: "ferramentaria_tool_models",
  units: "ferramentaria_tool_units",
  movements: "ferramentaria_tool_movements",
  transferRequests: "ferramentaria_tool_transfer_requests",
} as const;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getStorageKey(name: keyof typeof STORAGE_KEYS): string {
  return STORAGE_KEYS[name];
}

export function readList<T>(name: keyof typeof STORAGE_KEYS): T[] {
  if (typeof window === "undefined") return [];
  return safeParse<T[]>(window.localStorage.getItem(STORAGE_KEYS[name]), []);
}

export function writeList<T>(name: keyof typeof STORAGE_KEYS, value: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS[name], JSON.stringify(value));
}
