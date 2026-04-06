import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api-client";
import type { Project, ProjectCreate, ProjectSystem } from "@/lib/api-types";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => apiGet<Project[]>("/projects"),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectCreate) =>
      apiPost<ProjectCreate, Project>("/projects", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useProject(id: number | undefined) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => apiGet<Project>(`/projects/${id}`),
    enabled: !!id,
  });
}

export function useProjectSystems(projectId: number | undefined) {
  return useQuery({
    queryKey: ["project-systems", projectId],
    queryFn: () =>
      apiGet<ProjectSystem[]>(`/projects/${projectId}/systems`),
    enabled: !!projectId,
  });
}

export function useCreateProjectSystem(projectId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      system_type: string;
      title: string;
      config_json?: Record<string, unknown>;
    }) =>
      apiPost<typeof payload, ProjectSystem>(
        `/projects/${projectId}/systems`,
        payload,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-systems", projectId] });
    },
  });
}

export function useUpdateProjectSystem(projectId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      systemId: number;
      system_type: string;
      title: string;
      config_json?: Record<string, unknown>;
    }) =>
      apiPut<
        Omit<typeof payload, "systemId">,
        ProjectSystem
      >(`/projects/${projectId}/systems/${payload.systemId}`, {
        system_type: payload.system_type,
        title: payload.title,
        config_json: payload.config_json,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-systems", projectId] });
    },
  });
}

export function useDeleteProjectSystem(projectId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (systemId: number) =>
      apiDelete<void>(`/projects/${projectId}/systems/${systemId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-systems", projectId] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: number) => apiDelete<void>(`/projects/${projectId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

