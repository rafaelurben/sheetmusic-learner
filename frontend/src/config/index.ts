import { type AppConfig, AppConfigSchema } from "./schema";

let config: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
  if (config) return config;

  const response = await fetch("/config.json", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load runtime config.");
  }

  const json = await response.json();
  config = AppConfigSchema.parse(json);

  return config;
}
