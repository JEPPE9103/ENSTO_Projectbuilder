"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { ProjectSystem, ProjectSystemConfig } from "@/lib/api-types";

import { useAppShell } from "@/components/layout/AppShellContext";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { useToast } from "@/components/feedback/ToastProvider";
import { MaterialList } from "@/components/project/MaterialList";
import { ProjectDetailRightPanel } from "@/components/project/ProjectDetailRightPanel";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { SystemBuilder } from "@/components/project/SystemBuilder";
import { SystemsList } from "@/components/project/SystemsList";
import { ProjectInfoCard } from "@/components/project/workflow/ProjectInfoCard";
import { ProjectStatsBar } from "@/components/project/workflow/ProjectStatsBar";
import { ProjectStepper } from "@/components/project/workflow/ProjectStepper";
import { QuoteProjectSummaryCard } from "@/components/project/workflow/QuoteProjectSummaryCard";
import { QuoteSummaryCard } from "@/components/project/workflow/QuoteSummaryCard";
import { ProjectAllSystemsReviewPanel } from "@/components/project/workflow/ProjectAllSystemsReviewPanel";
import { SystemPickerTabs } from "@/components/project/workflow/SystemPickerTabs";
import { SystemReviewPanel } from "@/components/project/workflow/SystemReviewPanel";
import { WorkflowScopeToggle } from "@/components/project/workflow/WorkflowScopeToggle";
import {
  productToSystemItem,
  type ProjectSystemView,
  type SystemItem,
  type SystemMaterial,
} from "@/components/project/types";
import { getLineTotal } from "@/lib/pricing";
import {
  normalizeConfigItems,
  normalizeConfigMaterials,
} from "@/lib/project-system-config";
import {
  useCreateProjectSystem,
  useDeleteProject,
  useDeleteProjectSystem,
  useProject,
  useProjectSystems,
  useUpdateProjectSystem,
} from "@/hooks/useProjects";
import { useProductCatalog } from "@/hooks/useProducts";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function itemsToMaterials(items: SystemItem[]): SystemMaterial[] {
  return items.map((item) => ({
    productId: item.productId,
    articleNumber: item.articleNumber,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    lineTotal: getLineTotal(item),
  }));
}

function mapSystem(system: ProjectSystem): ProjectSystemView {
  const config: ProjectSystemConfig | null =
    system.config_json && isObject(system.config_json)
      ? (system.config_json as ProjectSystemConfig)
      : null;
  const items = normalizeConfigItems(config?.items);
  const materials = normalizeConfigMaterials(config?.materials);
  return {
    id: system.id,
    name: system.title,
    notes: typeof config?.notes === "string" ? config.notes : "",
    items,
    materials: materials.length > 0 ? materials : itemsToMaterials(items),
    createdAt: system.created_at,
    updatedAt: system.updated_at,
  };
}

/**
 * Review/quote steps: persisted systems are the source of truth.
 * Draft builder state is only a draft until saved successfully.
 */
function stableItemsSignature(items: SystemItem[]): string {
  const keyFields = items
    .map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      unitPriceOverride: i.unitPriceOverride,
    }))
    .sort((a, b) => a.productId - b.productId);
  return JSON.stringify(keyFields);
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: project } = useProject(projectId);
  const { data: systemsData } = useProjectSystems(projectId);
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductCatalog();
  const createSystem = useCreateProjectSystem(projectId);
  const updateSystem = useUpdateProjectSystem(projectId);
  const deleteSystem = useDeleteProjectSystem(projectId);
  const deleteProject = useDeleteProject();
  const systems = useMemo(
    () => (systemsData ?? []).map(mapSystem),
    [systemsData],
  );
  const products = productsData ?? [];

  const [editingSystemId, setEditingSystemId] = useState<number | null>(null);
  /** When true, do not auto-load the first saved system into the builder (allows "another system"). */
  const [creatingNewSystem, setCreatingNewSystem] = useState(false);
  const [systemName, setSystemName] = useState("");
  const [notes, setNotes] = useState("");
  const [currentItems, setCurrentItems] = useState<SystemItem[]>([]);
  const [activeStep, setActiveStep] = useState(1);
  const { showToast } = useToast();
  const [confirmDeleteProjectOpen, setConfirmDeleteProjectOpen] = useState(false);
  const [confirmRemoveSystemId, setConfirmRemoveSystemId] = useState<number | null>(null);
  /** Review / Quote: which saved system is in focus when viewing one system (tabs). */
  const [step34FocusSystemId, setStep34FocusSystemId] = useState<number | null>(null);
  const [reviewScope, setReviewScope] = useState<"system" | "all">("all");
  const [quoteScope, setQuoteScope] = useState<"system" | "project">("project");

  const selectedSavedSystem = useMemo(() => {
    if (creatingNewSystem) return null;
    if (editingSystemId !== null) {
      return systems.find((s) => s.id === editingSystemId) ?? null;
    }
    return systems[0] ?? null;
  }, [systems, editingSystemId, creatingNewSystem]);

  const hasSavedSystem = systems.length > 0;

  const hasUnsavedDraft = useMemo(() => {
    if (creatingNewSystem) {
      return (
        currentItems.length > 0 ||
        systemName.trim() !== "" ||
        notes.trim() !== ""
      );
    }
    if (editingSystemId === null) return false;
    const baseline = systems.find((s) => s.id === editingSystemId);
    if (!baseline) return currentItems.length > 0;
    if (
      systemName.trim() !== baseline.name ||
      notes.trim() !== (baseline.notes ?? "").trim()
    ) {
      return true;
    }
    return (
      stableItemsSignature(currentItems) !== stableItemsSignature(baseline.items)
    );
  }, [
    creatingNewSystem,
    currentItems,
    editingSystemId,
    notes,
    systemName,
    systems,
  ]);

  const defaultWorkspaceSystemId = useMemo(
    () => editingSystemId ?? systems[0]?.id ?? null,
    [editingSystemId, systems],
  );

  const resolvedStep34FocusId = useMemo(() => {
    if (
      step34FocusSystemId !== null &&
      systems.some((s) => s.id === step34FocusSystemId)
    ) {
      return step34FocusSystemId;
    }
    return defaultWorkspaceSystemId;
  }, [step34FocusSystemId, systems, defaultWorkspaceSystemId]);

  const reviewSingleItems = useMemo(() => {
    if (resolvedStep34FocusId === null) return [];
    const sid = resolvedStep34FocusId;
    const isLiveDraft =
      !creatingNewSystem && editingSystemId === sid && hasUnsavedDraft;
    if (isLiveDraft) return currentItems;
    return systems.find((s) => s.id === sid)?.items ?? [];
  }, [
    resolvedStep34FocusId,
    creatingNewSystem,
    editingSystemId,
    hasUnsavedDraft,
    currentItems,
    systems,
  ]);

  const reviewSingleName = useMemo(() => {
    if (resolvedStep34FocusId === null) return "";
    const sid = resolvedStep34FocusId;
    const isLiveDraft =
      !creatingNewSystem && editingSystemId === sid && hasUnsavedDraft;
    if (isLiveDraft) {
      return (
        systemName.trim() ||
        systems.find((s) => s.id === sid)?.name ||
        "System"
      );
    }
    return systems.find((s) => s.id === sid)?.name ?? "";
  }, [
    resolvedStep34FocusId,
    creatingNewSystem,
    editingSystemId,
    hasUnsavedDraft,
    systemName,
    systems,
  ]);

  const allSystemsReviewSlices = useMemo(
    () =>
      systems.map((s) => {
        const isLiveDraft =
          !creatingNewSystem && editingSystemId === s.id && hasUnsavedDraft;
        return {
          id: s.id,
          name: isLiveDraft
            ? systemName.trim() || s.name
            : s.name,
          items: isLiveDraft ? currentItems : s.items,
        };
      }),
    [systems, creatingNewSystem, editingSystemId, hasUnsavedDraft, currentItems, systemName],
  );

  const quoteProjectSlices = useMemo(
    () =>
      systems.map((s) => {
        const isLiveDraft =
          !creatingNewSystem && editingSystemId === s.id && hasUnsavedDraft;
        return {
          id: s.id,
          name: isLiveDraft ? systemName.trim() || s.name : s.name,
          items: isLiveDraft ? currentItems : s.items,
        };
      }),
    [systems, creatingNewSystem, editingSystemId, hasUnsavedDraft, currentItems, systemName],
  );

  const reviewStatsItems = useMemo(() => {
    if (reviewScope === "all") {
      return systems.flatMap((s) => {
        const isLiveDraft =
          !creatingNewSystem && editingSystemId === s.id && hasUnsavedDraft;
        return isLiveDraft ? currentItems : s.items;
      });
    }
    return reviewSingleItems;
  }, [
    reviewScope,
    systems,
    creatingNewSystem,
    editingSystemId,
    hasUnsavedDraft,
    currentItems,
    reviewSingleItems,
  ]);

  const quoteStatsItems = useMemo(() => {
    if (quoteScope === "project") {
      return systems.flatMap((s) => {
        const isLiveDraft =
          !creatingNewSystem && editingSystemId === s.id && hasUnsavedDraft;
        return isLiveDraft ? currentItems : s.items;
      });
    }
    return reviewSingleItems;
  }, [
    quoteScope,
    systems,
    creatingNewSystem,
    editingSystemId,
    hasUnsavedDraft,
    currentItems,
    reviewSingleItems,
  ]);

  const syncBuilderFromSavedSystem = useCallback((dto: ProjectSystem) => {
    setCreatingNewSystem(false);
    const view = mapSystem(dto);
    setEditingSystemId(dto.id);
    setSystemName(dto.title);
    setNotes(view.notes ?? "");
    setCurrentItems(view.items);
  }, []);

  useEffect(() => {
    if (!systemsData?.length) return;
    if (creatingNewSystem) return;
    if (editingSystemId !== null) return;
    if (currentItems.length > 0) return;
    if (systemName.trim() !== "") return;
    const primary = mapSystem(systemsData[0]);
    /* eslint-disable react-hooks/set-state-in-effect */
    setEditingSystemId(primary.id);
    setSystemName(primary.name);
    setNotes(primary.notes ?? "");
    setCurrentItems(primary.items);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [systemsData, editingSystemId, currentItems.length, systemName, creatingNewSystem]);

  const workspaceStatus = useMemo(() => {
    if (creatingNewSystem) {
      return { mode: "new-system" as const };
    }
    if (editingSystemId !== null) {
      const sys = systems.find((s) => s.id === editingSystemId);
      return {
        mode: "editing" as const,
        systemName: systemName.trim() || sys?.name || "System",
      };
    }
    const primary = systems[0];
    if (primary) {
      return { mode: "selected" as const, systemName: primary.name };
    }
    return null;
  }, [creatingNewSystem, editingSystemId, systems, systemName]);

  const steps = [
    {
      id: 1,
      title: "Project Info",
      description: "Baseline details",
    },
    {
      id: 2,
      title: "Build System",
      description: "Catalog & line items",
    },
    {
      id: 3,
      title: "Review",
      description: "Project & zone pricing",
    },
    {
      id: 4,
      title: "Quote",
      description: "Project quotation & materials",
    },
  ];

  const combinedMaterials = useMemo(() => {
    const grouped = new Map<string, SystemMaterial>();
    for (const system of systems) {
      const rows = system.materials.length > 0 ? system.materials : itemsToMaterials(system.items);
      for (const row of rows) {
        const key = row.articleNumber || String(row.productId ?? "");
        if (!key) continue;
        const existing = grouped.get(key);
        if (existing) {
          existing.quantity += row.quantity;
        } else {
          grouped.set(key, { ...row });
        }
      }
    }
    return Array.from(grouped.values()).sort((a, b) =>
      a.articleNumber.localeCompare(b.articleNumber),
    );
  }, [systems]);

  const quoteMaterials = useMemo(() => {
    if (quoteScope === "project") {
      const grouped = new Map<string, SystemMaterial>();
      for (const s of systems) {
        const isLiveDraft =
          !creatingNewSystem && editingSystemId === s.id && hasUnsavedDraft;
        const items = isLiveDraft ? currentItems : s.items;
        const rows = itemsToMaterials(items);
        for (const row of rows) {
          const key = row.articleNumber || String(row.productId ?? "");
          if (!key) continue;
          const existing = grouped.get(key);
          if (existing) {
            existing.quantity += row.quantity;
          } else {
            grouped.set(key, { ...row });
          }
        }
      }
      return Array.from(grouped.values()).sort((a, b) =>
        a.articleNumber.localeCompare(b.articleNumber),
      );
    }
    if (resolvedStep34FocusId === null) return combinedMaterials;
    const sys = systems.find((s) => s.id === resolvedStep34FocusId);
    if (!sys) return combinedMaterials;
    const isLiveDraft =
      !creatingNewSystem &&
      editingSystemId === resolvedStep34FocusId &&
      hasUnsavedDraft;
    const items = isLiveDraft ? currentItems : sys.items;
    return itemsToMaterials(items).sort((a, b) =>
      a.articleNumber.localeCompare(b.articleNumber),
    );
  }, [
    quoteScope,
    resolvedStep34FocusId,
    systems,
    combinedMaterials,
    creatingNewSystem,
    editingSystemId,
    hasUnsavedDraft,
    currentItems,
  ]);

  const clearBuilder = useCallback(() => {
    setCreatingNewSystem(false);
    setEditingSystemId(null);
    setSystemName("");
    setNotes("");
    setCurrentItems([]);
  }, []);

  const startNewSystem = useCallback(() => {
    setCreatingNewSystem(true);
    setEditingSystemId(null);
    setSystemName("");
    setNotes("");
    setCurrentItems([]);
  }, []);

  function handleCancelBuilder() {
    if (creatingNewSystem) {
      setCreatingNewSystem(false);
      setEditingSystemId(null);
      setSystemName("");
      setNotes("");
      setCurrentItems([]);
      return;
    }
    if (editingSystemId !== null) {
      const sys = systems.find((s) => s.id === editingSystemId);
      if (sys) {
        setSystemName(sys.name);
        setNotes(sys.notes ?? "");
        setCurrentItems(sys.items);
      }
      return;
    }
    clearBuilder();
  }

  const handleStartNewSystemFromRail = useCallback(() => {
    startNewSystem();
    setActiveStep(2);
  }, [startNewSystem]);

  function handleDeleteProject() {
    if (!project) return;
    setConfirmDeleteProjectOpen(true);
  }

  function handleAddProduct(productId: number) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCurrentItems((items) => {
      const existing = items.find((item) => item.productId === product.id);
      if (existing) {
        return items.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                catalogUnitPrice: item.catalogUnitPrice ?? product.unit_price ?? null,
              }
            : item,
        );
      }
      return [...items, productToSystemItem(product)];
    });
  }

  function updateItemQuantity(productId: number, delta: number) {
    setCurrentItems((items) =>
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  }

  function handleRemoveCurrentItem(productId: number) {
    setCurrentItems((items) => items.filter((item) => item.productId !== productId));
  }

  function handleSetItemUnitPriceOverride(productId: number, value: number | null) {
    setCurrentItems((items) =>
      items.map((item) =>
        item.productId === productId ? { ...item, unitPriceOverride: value } : item,
      ),
    );
  }

  function handleEditSystem(systemId: number) {
    const system = systems.find((value) => value.id === systemId);
    if (!system) return;
    setCreatingNewSystem(false);
    setEditingSystemId(system.id);
    setSystemName(system.name);
    setNotes(system.notes ?? "");
    setCurrentItems(system.items);
  }

  function handleStep34SystemPick(systemId: number) {
    if (creatingNewSystem) {
      showToast({
        variant: "info",
        title: "Finish on Build first",
        message: "Save or exit the new system before switching which system you review or quote.",
      });
      return;
    }
    if (
      hasUnsavedDraft &&
      editingSystemId !== null &&
      editingSystemId !== systemId
    ) {
      showToast({
        variant: "info",
        title: "Unsaved changes",
        message: "Save or discard on the Build step before switching systems here.",
      });
      return;
    }
    setStep34FocusSystemId(systemId);
    handleEditSystem(systemId);
  }

  function handleRemoveSystem(systemId: number) {
    setConfirmRemoveSystemId(systemId);
  }

  function handleSaveSystem(options?: {
    thenStartNew?: boolean;
    thenGoToQuote?: boolean;
  }) {
    const trimmedName = systemName.trim();
    if (!trimmedName) {
      showToast({ variant: "error", title: "System name is required" });
      return;
    }
    if (currentItems.length === 0) {
      showToast({
        variant: "error",
        title: "Add products before saving",
        message: "Add at least one product to the system, then save again.",
      });
      return;
    }
    const config_json = {
      notes: notes.trim(),
      items: currentItems,
      materials: itemsToMaterials(currentItems),
    };
    const toastSaved = () =>
      showToast({
        variant: "success",
        title: "System saved",
        message: options?.thenStartNew
          ? `"${trimmedName}" was saved. Add the next system below.`
          : `"${trimmedName}" was saved to the project.`,
      });
    const afterSave = (data: ProjectSystem) => {
      if (options?.thenStartNew) {
        startNewSystem();
      } else {
        syncBuilderFromSavedSystem(data);
      }
      toastSaved();
      if (options?.thenGoToQuote) {
        setActiveStep(4);
      }
    };
    if (editingSystemId) {
      updateSystem.mutate(
        {
          systemId: editingSystemId,
          system_type: "item-group",
          title: trimmedName,
          config_json,
        },
        {
          onSuccess: (data) => {
            afterSave(data);
          },
          onError: () => {
            showToast({
              variant: "error",
              title: "Could not save system",
              message: "Please try again.",
            });
          },
        },
      );
      return;
    }
    createSystem.mutate(
      {
        system_type: "item-group",
        title: trimmedName,
        config_json,
      },
      {
        onSuccess: (data) => {
          afterSave(data);
        },
        onError: () => {
          showToast({
            variant: "error",
            title: "Could not save system",
            message: "Please try again.",
          });
        },
      },
    );
  }

  async function handleCopyBom() {
    if (currentItems.length === 0) {
      showToast({ variant: "info", title: "Nothing to copy", message: "Add products first." });
      return;
    }
    const text = currentItems
      .map(
        (item) =>
          `${item.articleNumber}\t${item.name}\t${item.category}\t${item.quantity}\t${item.unit}`,
      )
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      showToast({ variant: "success", title: "BOM copied", message: "Copied to clipboard." });
    } catch {
      showToast({
        variant: "error",
        title: "Could not copy BOM",
        message: "Your browser blocked clipboard access. Please copy manually.",
      });
    }
  }

  function handlePrepareExport() {
    showToast({
      variant: "info",
      title: "Export coming soon",
      message: "Export preparation is not available in this build yet.",
    });
  }

  async function persistWorkspaceDraftAsync(): Promise<void> {
    const trimmedName = systemName.trim();
    const persistable = trimmedName.length > 0 && currentItems.length > 0;
    if (!persistable) return;

    const config_json = {
      notes: notes.trim(),
      items: currentItems,
      materials: itemsToMaterials(currentItems),
    };

    if (creatingNewSystem) {
      const created = await createSystem.mutateAsync({
        system_type: "item-group",
        title: trimmedName,
        config_json,
      });
      await queryClient.refetchQueries({
        queryKey: ["project-systems", projectId],
      });
      syncBuilderFromSavedSystem(created);
      return;
    }

    if (editingSystemId !== null && hasUnsavedDraft) {
      await updateSystem.mutateAsync({
        systemId: editingSystemId,
        system_type: "item-group",
        title: trimmedName,
        config_json,
      });
      await queryClient.refetchQueries({
        queryKey: ["project-systems", projectId],
      });
    }
  }

  async function handlePrintProjectPdf() {
    const trimmedName = systemName.trim();
    const persistable = trimmedName.length > 0 && currentItems.length > 0;
    if (!hasSavedSystem && !persistable) {
      showToast({
        variant: "info",
        title: "Save a system first",
        message:
          "Add and save at least one system (zone) before printing the project quotation.",
      });
      return;
    }
    try {
      await persistWorkspaceDraftAsync();
    } catch {
      showToast({
        variant: "error",
        title: "Could not save changes",
        message: "Save your workspace successfully, then try printing the project PDF again.",
      });
      return;
    }
    router.push(`/projects/${projectId}/quote-print?scope=project&autoPrint=1`);
  }

  async function handlePrintSelectedSystemPdf() {
    const trimmedName = systemName.trim();
    const persistable = trimmedName.length > 0 && currentItems.length > 0;

    if (creatingNewSystem && persistable) {
      const config_json = {
        notes: notes.trim(),
        items: currentItems,
        materials: itemsToMaterials(currentItems),
      };
      try {
        const created = await createSystem.mutateAsync({
          system_type: "item-group",
          title: trimmedName,
          config_json,
        });
        await queryClient.refetchQueries({
          queryKey: ["project-systems", projectId],
        });
        syncBuilderFromSavedSystem(created);
        router.push(
          `/projects/${projectId}/quote-print?systemId=${created.id}&export=system&autoPrint=1`,
        );
      } catch {
        showToast({
          variant: "error",
          title: "Could not export yet",
          message: "Save the new system successfully, then try again.",
        });
      }
      return;
    }

    const targetId = resolvedStep34FocusId ?? editingSystemId ?? systems[0]?.id;
    if (!targetId) {
      showToast({
        variant: "info",
        title: "Nothing to export",
        message: "Save a system first, then print or export the selected section.",
      });
      return;
    }

    if (
      hasUnsavedDraft &&
      persistable &&
      editingSystemId !== null &&
      editingSystemId !== targetId
    ) {
      showToast({
        variant: "info",
        title: "Unsaved changes elsewhere",
        message:
          "Save or discard changes to the system in your workspace before exporting another section.",
      });
      return;
    }

    const isDraftForTarget =
      !creatingNewSystem && editingSystemId === targetId && hasUnsavedDraft;

    if (isDraftForTarget && !persistable) {
      showToast({
        variant: "info",
        title: "Cannot export yet",
        message: "Give the system a name and keep at least one product line, or save on Build.",
      });
      return;
    }

    if (isDraftForTarget && persistable) {
      const config_json = {
        notes: notes.trim(),
        items: currentItems,
        materials: itemsToMaterials(currentItems),
      };
      try {
        await updateSystem.mutateAsync({
          systemId: editingSystemId!,
          system_type: "item-group",
          title: trimmedName,
          config_json,
        });
        await queryClient.refetchQueries({
          queryKey: ["project-systems", projectId],
        });
        router.push(
          `/projects/${projectId}/quote-print?systemId=${targetId}&export=system&autoPrint=1`,
        );
      } catch {
        showToast({
          variant: "error",
          title: "Could not export yet",
          message: "Save the system successfully, then try again.",
        });
      }
      return;
    }

    router.push(
      `/projects/${projectId}/quote-print?systemId=${targetId}&export=system&autoPrint=1`,
    );
  }

  const { setRightPanel } = useAppShell();

  const liveQuoteHint = useMemo(() => {
    if (activeStep === 3) {
      if (reviewScope === "all") {
        return "Whole-project review is in the main area. This panel still shows the workspace line list from Build.";
      }
      return `Zone focus: “${reviewSingleName}”. Switch zones with the tabs on Review.`;
    }
    if (activeStep === 4) {
      if (quoteScope === "project") {
        return "Project quotation (default) lists every saved zone. Print / Save Project PDF produces one combined customer PDF.";
      }
      return `Showing only “${reviewSingleName}”. Switch to Project quotation for the full combined quote.`;
    }
    return undefined;
  }, [activeStep, reviewScope, quoteScope, reviewSingleName]);

  const canPrintSelectedSystem =
    hasSavedSystem ||
    (creatingNewSystem && systemName.trim().length > 0 && currentItems.length > 0);

  type RailActions = {
    updateItemQuantity: (productId: number, delta: number) => void;
    handleRemoveCurrentItem: (productId: number) => void;
    handleSaveSystem: () => void;
    handleCopyBom: () => Promise<void>;
    handlePrepareExport: () => void;
    handlePrintProjectPdf: () => void | Promise<void>;
    handlePrintSelectedSystemPdf: () => void | Promise<void>;
    handleEditSystem: (systemId: number) => void;
    handleRemoveSystem: (systemId: number) => void;
    handleStartNewSystemFromRail: () => void;
  };

  const railActionsRef = useRef<RailActions | null>(null);

  useLayoutEffect(() => {
    railActionsRef.current = {
      updateItemQuantity,
      handleRemoveCurrentItem,
      handleSaveSystem,
      handleCopyBom,
      handlePrepareExport,
      handlePrintProjectPdf,
      handlePrintSelectedSystemPdf,
      handleEditSystem,
      handleRemoveSystem,
      handleStartNewSystemFromRail,
    };
  });

  useEffect(() => {
    if (!project) {
      setRightPanel(null);
      return;
    }
    setRightPanel(
      <ProjectDetailRightPanel
        activeStep={activeStep}
        liveQuoteHint={liveQuoteHint}
        currentItems={currentItems}
        systems={systems}
        onIncrease={(id) => railActionsRef.current?.updateItemQuantity(id, 1)}
        onDecrease={(id) => railActionsRef.current?.updateItemQuantity(id, -1)}
        onRemove={(id) => railActionsRef.current?.handleRemoveCurrentItem(id)}
        onSaveProject={() => railActionsRef.current?.handleSaveSystem()}
        onGenerateQuoteSummary={() => setActiveStep(4)}
        onCopyBom={() => void railActionsRef.current?.handleCopyBom()}
        onPrepareExport={() => railActionsRef.current?.handlePrepareExport()}
        onPrintProjectPdf={() => void railActionsRef.current?.handlePrintProjectPdf()}
        onPrintSelectedSystemPdf={() =>
          void railActionsRef.current?.handlePrintSelectedSystemPdf()
        }
        canPrintSelectedSystem={canPrintSelectedSystem}
        onEditSystem={(id) => railActionsRef.current?.handleEditSystem(id)}
        onRemoveSystem={(id) => railActionsRef.current?.handleRemoveSystem(id)}
        activeSystemId={
          creatingNewSystem ? null : (editingSystemId ?? systems[0]?.id ?? null)
        }
        onStartNewSystem={
          systems.length > 0
            ? () => railActionsRef.current?.handleStartNewSystemFromRail()
            : undefined
        }
        removingSystemId={deleteSystem.variables}
        isSaving={createSystem.isPending || updateSystem.isPending}
        canGenerateQuote={hasSavedSystem}
        canPrintPdf={canPrintSelectedSystem}
        generateQuoteHelperText={
          hasSavedSystem
            ? undefined
            : "Save at least one zone (system) before opening the project quotation."
        }
        printPdfHelperText={
          hasSavedSystem
            ? undefined
            : "Save at least one zone (system) before printing the project PDF."
        }
      />,
    );
    return () => setRightPanel(null);
  }, [
    project,
    setRightPanel,
    activeStep,
    currentItems,
    systems,
    editingSystemId,
    deleteSystem.variables,
    createSystem.isPending,
    updateSystem.isPending,
    hasSavedSystem,
    creatingNewSystem,
    handleStartNewSystemFromRail,
    liveQuoteHint,
    canPrintSelectedSystem,
  ]);

  if (!project) {
    return (
      <p className="text-sm text-slate-600">Loading project information…</p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-8 xl:gap-9">
      <ConfirmDialog
        open={confirmDeleteProjectOpen}
        title="Delete project?"
        description={
          <>
            This will permanently delete{" "}
            <span className="font-semibold">“{project.name}”</span>{" "}
            and all saved systems in it. This action cannot be undone.
          </>
        }
        destructive
        confirmText="Delete project"
        cancelText="Cancel"
        onCancel={() => setConfirmDeleteProjectOpen(false)}
        onConfirm={() => {
          setConfirmDeleteProjectOpen(false);
          deleteProject.mutate(project.id, {
            onSuccess: () => {
              showToast({ variant: "success", title: "Project deleted" });
              router.push("/projects");
            },
            onError: () => {
              showToast({
                variant: "error",
                title: "Could not delete project",
                message: "Please try again.",
              });
            },
          });
        }}
      />

      <ConfirmDialog
        open={confirmRemoveSystemId !== null}
        title="Remove system from project?"
        description="This removes the saved system and its items from the project. You can’t undo this."
        destructive
        confirmText="Remove system"
        cancelText="Cancel"
        onCancel={() => setConfirmRemoveSystemId(null)}
        onConfirm={() => {
          const systemId = confirmRemoveSystemId;
          setConfirmRemoveSystemId(null);
          if (!systemId) return;
          deleteSystem.mutate(systemId, {
            onSuccess: () => {
              showToast({ variant: "success", title: "System removed" });
              if (editingSystemId === systemId) {
                clearBuilder();
              }
            },
            onError: () => {
              showToast({
                variant: "error",
                title: "Could not remove system",
                message: "Please try again.",
              });
            },
          });
        }}
      />
      <ProjectHeader
        project={project}
        onDeleteProject={handleDeleteProject}
        isDeleting={deleteProject.isPending}
        workspaceStatus={workspaceStatus}
        status={(() => {
          const isSaving = createSystem.isPending || updateSystem.isPending;
          if (isSaving) {
            return { label: "Saving…", detail: "Changes are being saved", tone: "neutral" as const };
          }
          if (!hasSavedSystem) {
            return {
              label: "No saved zones",
              detail: "Save at least one zone (system) to build the project quotation and PDF.",
              tone: "warning" as const,
            };
          }
          if (creatingNewSystem) {
            return {
              label: "Creating new system",
              detail: "Save to add another system — existing systems stay as they are.",
              tone: "warning" as const,
            };
          }
          if (hasUnsavedDraft) {
            return {
              label: "Unsaved changes",
              detail: "Save to update the project quotation and PDFs",
              tone: "warning" as const,
            };
          }
          const updatedAt = selectedSavedSystem?.updatedAt;
          return updatedAt
            ? {
                label: "Saved",
                detail: `Last saved ${new Date(updatedAt).toLocaleString()}`,
                tone: "success" as const,
              }
            : { label: "Saved", tone: "success" as const };
        })()}
      />

      <ProjectStepper
        steps={steps}
        currentStep={activeStep}
        onStepChange={setActiveStep}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-7 lg:gap-8">
        {activeStep === 1 && <ProjectInfoCard project={project} />}

        {activeStep === 2 && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 px-5 py-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Project → Zones (systems) → Products</p>
              <p className="mt-1">
                The <strong>project</strong> is what you sell: one combined quotation for the
                customer. <strong>Systems</strong> are internal zones (corridors, rooms, areas)—they
                group line items and appear as sections in the project PDF.
              </p>
            </div>
            {systems.length > 0 && (
              <SystemsList
                systems={systems}
                activeSystemId={
                  creatingNewSystem
                    ? null
                    : (editingSystemId ?? systems[0]?.id ?? null)
                }
                onSelect={handleEditSystem}
                onEdit={handleEditSystem}
                onRemove={handleRemoveSystem}
                removingId={deleteSystem.variables}
                onAddAnotherSystem={startNewSystem}
              />
            )}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-surface transition-all duration-150 hover:shadow-surface-hover lg:p-8">
              <SystemBuilder
                systemName={systemName}
                notes={notes}
                onSystemNameChange={setSystemName}
                onNotesChange={setNotes}
                itemsCount={currentItems.length}
                products={products}
                onAddProduct={(product) => handleAddProduct(product.id)}
                onSaveSystem={() => handleSaveSystem()}
                onSaveAndAddAnother={() => handleSaveSystem({ thenStartNew: true })}
                onCancelEdit={handleCancelBuilder}
                onLoadMoreProducts={() => fetchNextPage()}
                hasMoreProducts={Boolean(hasNextPage)}
                isLoadingMoreProducts={isFetchingNextPage}
                isSaving={createSystem.isPending || updateSystem.isPending}
                isEditing={editingSystemId !== null && !creatingNewSystem}
                builderMode={
                  creatingNewSystem
                    ? "new-system"
                    : editingSystemId !== null
                      ? "edit-saved"
                      : "first-system"
                }
              />
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <>
            <ProjectStatsBar items={reviewStatsItems} systemsCount={systems.length} />
            {!hasSavedSystem && (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                Save at least one zone (system) before reviewing pricing.
              </div>
            )}
            {hasSavedSystem && (
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <WorkflowScopeToggle
                  label="Review view"
                  value={reviewScope}
                  onChange={setReviewScope}
                  options={[
                    { value: "all", label: "Whole project" },
                    { value: "system", label: "Selected zone" },
                  ]}
                />
                <p
                  className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                    reviewScope === "all"
                      ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-950"
                      : "border-slate-200 bg-slate-50 text-slate-800"
                  }`}
                >
                  {reviewScope === "all"
                    ? "Showing: Whole project — all saved zones with subtotals"
                    : `Showing: Selected zone only — “${reviewSingleName}”`}
                </p>
                {reviewScope === "system" && systems.length > 0 && (
                  <SystemPickerTabs
                    systems={systems}
                    selectedId={resolvedStep34FocusId}
                    onSelect={handleStep34SystemPick}
                  />
                )}
              </div>
            )}
            {hasSavedSystem && hasUnsavedDraft && creatingNewSystem && (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-5 py-4 text-sm text-amber-950">
                You are building a <strong>new</strong> system. Save it on the Build step before
                this review matches a persisted system.
              </div>
            )}
            {hasSavedSystem && hasUnsavedDraft && !creatingNewSystem && (
              <div className="rounded-2xl border border-[#E2E8F0] bg-slate-50 px-5 py-4 text-sm text-slate-700">
                You have unsaved changes to the loaded zone. Use <strong>Save</strong> below or in
                the side panel (or save on Build) to update the copy used for quote and PDF.
              </div>
            )}
            {hasSavedSystem && reviewScope === "system" && (
              <SystemReviewPanel
                systemName={reviewSingleName}
                items={reviewSingleItems}
                onIncrease={(id) => updateItemQuantity(id, 1)}
                onDecrease={(id) => updateItemQuantity(id, -1)}
                onRemove={handleRemoveCurrentItem}
                onSetUnitPriceOverride={handleSetItemUnitPriceOverride}
              />
            )}
            {hasSavedSystem && reviewScope === "all" && (
              <ProjectAllSystemsReviewPanel
                projectName={project.name}
                systems={allSystemsReviewSlices}
              />
            )}
            {hasSavedSystem && (
              <div className="flex flex-col items-end gap-3 rounded-2xl border border-slate-200/90 bg-white px-5 py-5 shadow-sm">
                <p className="max-w-lg text-right text-xs leading-relaxed text-slate-600">
                  Persists the zone in your workspace (name, lines, pricing overrides)—same action
                  as <strong>Save</strong> in the side panel. For price edits, use{" "}
                  <strong>Selected zone</strong> and pick the right tab above.
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    className="min-h-10 rounded-xl"
                    disabled={createSystem.isPending || updateSystem.isPending}
                    onClick={() => handleSaveSystem()}
                  >
                    {createSystem.isPending || updateSystem.isPending ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-10 rounded-xl"
                    disabled={createSystem.isPending || updateSystem.isPending}
                    onClick={() => handleSaveSystem({ thenGoToQuote: true })}
                  >
                    Save &amp; Generate Project Quote
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {activeStep === 4 && (
          <>
            <ProjectStatsBar items={quoteStatsItems} systemsCount={systems.length} />
            {!hasSavedSystem && (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                Save at least one zone (system) before opening the project quotation.
              </div>
            )}
            {hasSavedSystem && (
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <WorkflowScopeToggle
                  label="Quotation view"
                  value={quoteScope}
                  onChange={setQuoteScope}
                  options={[
                    { value: "project", label: "Project quotation" },
                    { value: "system", label: "Selected zone only" },
                  ]}
                />
                <p
                  className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                    quoteScope === "project"
                      ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-950"
                      : "border-slate-200 bg-slate-50 text-slate-800"
                  }`}
                >
                  {quoteScope === "project"
                    ? "Showing: Project quotation (default) — every saved zone, grouped with subtotals"
                    : `Showing: Selected zone only — “${reviewSingleName}”`}
                </p>
                {quoteScope === "system" && systems.length > 0 && (
                  <SystemPickerTabs
                    systems={systems}
                    selectedId={resolvedStep34FocusId}
                    onSelect={handleStep34SystemPick}
                  />
                )}
                {quoteScope === "project" && (
                  <p className="text-sm text-slate-600">
                    This is the main customer quotation: <strong>{systems.length}</strong> saved{" "}
                    {systems.length === 1 ? "zone" : "zones"}, each as its own section with a
                    subtotal, plus one project total. Use{" "}
                    <strong>Print / Save Project PDF</strong> in the side panel for a single PDF.
                    Use <strong>Print selected system</strong> only when you need an internal
                    one-zone export.
                  </p>
                )}
              </div>
            )}
            {hasSavedSystem && hasUnsavedDraft && creatingNewSystem && (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-5 py-4 text-sm text-amber-950">
                Finish and <strong>save</strong> your new system on the Build step before this quote
                reflects saved data.
              </div>
            )}
            {hasSavedSystem && hasUnsavedDraft && !creatingNewSystem && (
              <div className="rounded-2xl border border-[#E2E8F0] bg-slate-50 px-5 py-4 text-sm text-slate-700">
                You have unsaved changes to the loaded system. Save on Build before printing.
              </div>
            )}
            {hasSavedSystem && quoteScope === "system" && (
              <QuoteSummaryCard
                project={project}
                systemName={reviewSingleName}
                items={reviewSingleItems}
                onSetUnitPriceOverride={handleSetItemUnitPriceOverride}
              />
            )}
            {hasSavedSystem && quoteScope === "project" && (
              <QuoteProjectSummaryCard project={project} systems={quoteProjectSlices} />
            )}
            <MaterialList materials={quoteMaterials} />
          </>
        )}

        <section className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E2E8F0] pt-8">
          <Button
            type="button"
            variant="secondary"
            className="min-h-10 rounded-xl transition-all duration-150 hover:scale-[1.01]"
            onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
            disabled={activeStep === 1}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-10 rounded-xl transition-all duration-150 hover:scale-[1.01]"
            onClick={() => setActiveStep((s) => Math.min(4, s + 1))}
            disabled={activeStep === 4}
          >
            Next
          </Button>
        </section>
      </div>
    </div>
  );
}

