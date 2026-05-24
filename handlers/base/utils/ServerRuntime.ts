function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
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