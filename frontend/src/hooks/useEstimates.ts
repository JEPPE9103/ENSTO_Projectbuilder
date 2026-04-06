import { useMutation, useQuery } from "@tanstack/react-query";

import { apiGet, apiPost } from "@/lib/api-client";
import type {
  Estimate,
  EstimateCalculationResult,
  MaterialRow,
  SystemConfiguration,
} from "@/lib/api-types";

export function useCalculateEstimate() {
  return useMutation({
    mutationFn: (payload: SystemConfiguration) =>
      apiPost<SystemConfiguration, EstimateCalculationResult>(
        "/estimates/calculate",
        payload,
      ),
  });
}

export function useSaveEstimate() {
  return useMutation({
    mutationFn: (payload: {
      project_system_id: number;
      material_rows: MaterialRow[];
    }) =>
      apiPost<typeof payload, Estimate>("/estimates", {
        project_system_id: payload.project_system_id,
        material_rows: payload.material_rows,
      }),
  });
}

export function useEstimate(id: number | undefined) {
  return useQuery({
    queryKey: ["estimates", id],
    queryFn: () => apiGet<Estimate>(`/estimates/${id}`),
    enabled: !!id,
  });
}

