/*
 * (C) 2026. - Rafael Urben
 */
import { Input } from "@/shadcn/components/ui/input.tsx";
import { Label } from "@/shadcn/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/components/ui/select.tsx";
import { useState } from "react";

import { parseNullableNumberFromInput } from "@/service/utils.ts";

const CUSTOM_TIME_SIGNATURE_VALUE = "__custom__";

const COMMON_TIME_SIGNATURES = [
  { value: "2/4", label: "2/4" },
  { value: "3/4", label: "3/4" },
  { value: "4/4", label: "4/4" },
  { value: "3/8", label: "3/8" },
  { value: "4/8", label: "4/8" },
  { value: "6/8", label: "6/8" },
];

interface PieceSectionTimeSelectorProps {
  numerator: number | null;
  denominator: number | null;
  onSignatureChange: (value: {
    numerator?: number | null;
    denominator?: number | null;
  }) => void;
}

export default function PieceSectionTimeSelector({
  numerator,
  denominator,
  onSignatureChange,
}: Readonly<PieceSectionTimeSelectorProps>) {
  const timeValue = `${String(numerator ?? "")}/${String(denominator ?? "")}`;

  const [useCustom, setUseCustom] = useState(
    COMMON_TIME_SIGNATURES.find(
      (timeSignature) => timeSignature.value === timeValue,
    )?.value === undefined,
  );

  return (
    <div>
      <Label className="text-xs text-muted-foreground">Time</Label>

      {useCustom ? (
        <div className="mt-1 flex">
          <Input
            type="number"
            min={0}
            step={1}
            value={numerator ?? ""}
            placeholder="Numerator"
            required={true}
            onChange={(event) => {
              onSignatureChange({
                numerator: parseNullableNumberFromInput(event.target.value),
              });
            }}
          />
          <span>/</span>
          <Input
            type="number"
            min={0}
            step={1}
            value={denominator ?? ""}
            placeholder="Denominator"
            required={true}
            onChange={(event) => {
              onSignatureChange({
                denominator: parseNullableNumberFromInput(event.target.value),
              });
            }}
          />
        </div>
      ) : (
        <Select
          value={timeValue}
          onValueChange={(value) => {
            if (value === CUSTOM_TIME_SIGNATURE_VALUE) {
              setUseCustom(true);
              return;
            }

            setUseCustom(false);
            const [nextNumerator, nextDenominator] = value.split("/");
            onSignatureChange({
              numerator: Number.parseInt(nextNumerator, 10),
              denominator: Number.parseInt(nextDenominator, 10),
            });
          }}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMMON_TIME_SIGNATURES.map((timeSignature) => (
              <SelectItem key={timeSignature.value} value={timeSignature.value}>
                {timeSignature.label}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_TIME_SIGNATURE_VALUE}>Custom</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
