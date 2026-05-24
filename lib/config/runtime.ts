function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getBrowserOrigin(): string | null {
  const location = (globalThis as { location?: { origin?: string } }).location;

  return typeof location?.origin === "string" ? location.origin : null;
}

export function getClientSocketUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  const browserOrigin = getBrowserOrigin();
  if (browserOrigin) {
    return trimTrailingSlash(browserOrigin);
  }

  return "http://localhost:3001";
}

export function getServerApiBaseUrl(): string {
  const configuredUrl =
    process.env.NEXT_API_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL;

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  return "http://localhost:3000";
}