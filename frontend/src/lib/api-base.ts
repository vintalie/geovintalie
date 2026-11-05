export const API_BASE_KEY = 'geovintalie_api_base';

export function getBaseUrl(): string {
  try {
    return localStorage.getItem(API_BASE_KEY) || '';
  } catch {
    return '';
  }
}

export function setBaseUrl(value: string): void {
  try {
    const v = value.trim();
    if (v) localStorage.setItem(API_BASE_KEY, v);
    else localStorage.removeItem(API_BASE_KEY);
  } catch {
    // localStorage unavailable in some environments; ignore
  }
}

export function clearBaseUrl(): void {
  try {
    localStorage.removeItem(API_BASE_KEY);
  } catch {
    // ignore
  }
}
