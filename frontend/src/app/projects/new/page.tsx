"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Input, TextArea } from "@/components/ui";
import { useCreateProject } from "@/hooks/useProjects";

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();

  const [formState, setFormState] = useState({
    name: "",
    customer_name: "",
    country: "",
    project_type: "",
    notes: "",
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    createProject.mutate(formState, {
      onSuccess: (project) => {
        router.push(`/projects/${project.id}`);
      },
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-[#E2E8F0] pb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Projects
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
          Create project
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
          Save these details, then add systems and catalog lines in the workspace.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-surface transition-all duration-150 hover:shadow-surface-hover lg:max-w-3xl lg:p-8">
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-8 md:gap-y-5"
        >
          <Input
            label="Project name"
            required
            value={formState.name}
            onChange={(e) =>
              setFormState((s) => ({ ...s, name: e.target.value }))
            }
          />
          <Input
            label="Customer name"
            required
            value={formState.customer_name}
            onChange={(e) =>
              setFormState((s) => ({ ...s, customer_name: e.target.value }))
            }
          />
          <Input
            label="Country"
            required
            value={formState.country}
            onChange={(e) =>
              setFormState((s) => ({ ...s, country: e.target.value }))
            }
          />
          <Input
            label="Project type"
            required
            value={formState.project_type}
            onChange={(e) =>
              setFormState((s) => ({ ...s, project_type: e.target.value }))
            }
          />
          <div className="md:col-span-2">
            <TextArea
              label="Notes"
              rows={4}
              value={formState.notes}
              onChange={(e) =>
                setFormState((s) => ({ ...s, notes: e.target.value }))
              }
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-[#E2E8F0] pt-8 md:col-span-2">
            <Button
              type="submit"
              className="min-h-11 px-8 text-base"
              disabled={createProject.isPending}
            >
              {createProject.isPending ? "Creating…" : "Create project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
