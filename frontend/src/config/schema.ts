import { z } from "zod";

export const AppConfigSchema = z.object({
  oidc: z.object({
    issuer: z.url(),
    clientId: z.string(),
    scope: z.string(),
  }),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
