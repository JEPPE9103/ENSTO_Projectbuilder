import type { Project } from "@/lib/api-types";

type ProjectInfoCardProps = {
  project: Project;
};

export function ProjectInfoCard({ project }: ProjectInfoCardProps) {
  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-shadow duration-150 hover:shadow-md lg:p-8">
      <h2 className="text-lg font-semibold text-slate-900">
        Project information
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Review the baseline before you add systems and pricing.
      </p>

      <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-[#E2E8F0] pt-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-slate-500">Project name</dt>
          <dd className="mt-0.5 font-semibold text-slate-900">{project.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Customer</dt>
          <dd className="mt-0.5 font-semibold text-slate-900">{project.customer_name}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Location</dt>
          <dd className="mt-0.5 font-semibold text-slate-900">{project.country}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Project type</dt>
          <dd className="mt-0.5 font-semibold text-slate-900">{project.project_type}</dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-[#E2E8F0] pt-4">
        <div className="text-xs font-medium text-slate-500">Notes</div>
        <p className="mt-1 text-sm text-slate-700">
          {project.notes?.trim() ? project.notes : "No notes added for this project."}
        </p>
      </div>
    </section>
  );
}
