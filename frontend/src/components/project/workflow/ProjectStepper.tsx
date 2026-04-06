"use client";

type Step = {
  id: number;
  title: string;
  description: string;
};

type ProjectStepperProps = {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
};

export function ProjectStepper({
  steps,
  currentStep,
  onStepChange,
}: ProjectStepperProps) {
  return (
    <nav
      className="rounded-2xl border border-slate-200/90 bg-slate-50/90 p-1.5 shadow-surface"
      aria-label="Workspace mode"
    >
      <ul className="flex gap-1 overflow-x-auto">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          return (
            <li key={step.id} className="min-w-0 flex-1 shrink-0 sm:min-w-[7.5rem]">
              <button
                type="button"
                onClick={() => onStepChange(step.id)}
                title={step.description}
                className={`relative w-full rounded-xl px-3 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:px-4 sm:py-3.5 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/90"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                }`}
              >
                <span
                  className={`block text-sm font-semibold sm:text-[15px] ${isActive ? "text-slate-900" : ""}`}
                >
                  {step.title}
                </span>
                <span
                  className={`mt-0.5 block text-xs font-normal leading-snug ${
                    isActive ? "text-slate-500" : "text-slate-400"
                  } max-sm:sr-only`}
                >
                  {step.description}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
