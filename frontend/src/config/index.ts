import { type AppConfig, AppConfigSchema } from "./schema";
import { Configuration, PublicApi } from "@/api/generated/openapi";

let config: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
  if (config) return config;

  try {
    const response = await new PublicApi(
      new Configuration({
        basePath: globalThis.location.origin,
      }),
    ).getFrontendConfig();
    config = AppConfigSchema.parse(response);

    return config;
  } catch (error) {
    console.error("Error loading configuration:", error);
    throw new Error("Failed to load runtime configuration!", { cause: error });
  }
}
