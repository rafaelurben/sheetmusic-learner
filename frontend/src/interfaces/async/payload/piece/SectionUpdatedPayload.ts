/*
 * (C) 2026. - Rafael Urben
 */
import type { SectionDto } from "@/api/generated/openapi/models/SectionDto.ts";

export default interface SectionUpdatedPayload {
  sectionId: string;
  section: SectionDto;
}
