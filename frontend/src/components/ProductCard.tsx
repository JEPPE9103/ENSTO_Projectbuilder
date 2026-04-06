import Link from "next/link";
import { type KeyboardEvent, useState } from "react";

import { Button } from "@/components/ui";
import type { Product } from "@/lib/api-types";
import { useToast } from "@/components/feedback/ToastProvider";

type ProductCardProps = {
  product: Product;
  onOpenDetails: (product: Product) => void;
};

export function ProductCard({ product, onOpenDetails }: ProductCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { showToast } = useToast();

  async function handleCopyArticle() {
    try {
      await navigator.clipboard.writeText(product.article_number);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1000);
    } catch {
      showToast({
        variant: "error",
        title: "Could not copy article number",
        message: "Your browser blocked clipboard access. Please copy manually.",
      });
    }
  }

  function openDetailsKeyboard(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenDetails(product);
    }
  }

  return (
    <article className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-surface transition-all duration-150 hover:scale-[1.01] hover:border-slate-300/90 hover:shadow-surface-hover sm:p-6">
      <div
        className="flex min-h-0 flex-1 cursor-pointer flex-col space-y-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
        role="button"
        tabIndex={0}
        onClick={() => onOpenDetails(product)}
        onKeyDown={openDetailsKeyboard}
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            title={product.name}
            className="min-h-[2.875rem] min-w-0 flex-1 line-clamp-2 text-base font-medium leading-tight text-slate-900"
          >
            {product.name}
          </h3>
          <span className="shrink-0 font-mono text-xs font-medium text-slate-700">
            {product.article_number}
          </span>
        </div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
          E {product.e_number}
        </p>
        <p
          title={[
            product.category,
            product.series,
            product.size,
            product.color,
            product.length_meters != null ? `${product.length_meters} m` : "",
          ]
            .filter(Boolean)
            .join(" · ")}
          className="mt-1 text-xs leading-relaxed text-slate-500"
        >
          {product.category}
          {product.series ? ` · ${product.series}` : ""}
          {product.size ? ` · ${product.size}` : ""}
          {product.color ? ` · ${product.color}` : ""}
          {product.length_meters != null ? ` · ${product.length_meters} m` : ""}
        </p>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
          {product.series && (
            <span className="rounded-full border border-slate-200/90 bg-slate-50 px-2 py-0.5">
              {product.series}
            </span>
          )}
          {product.size && (
            <span className="rounded-full border border-slate-200/90 bg-slate-50 px-2 py-0.5">
              {product.size}
            </span>
          )}
          {product.color && (
            <span className="rounded-full border border-slate-200/90 bg-slate-50 px-2 py-0.5">
              {product.color}
            </span>
          )}
          {product.length_meters != null && (
            <span
              title={`${product.length_meters} m`}
              className="rounded-full border border-slate-200/90 bg-slate-50 px-2 py-0.5 font-medium tabular-nums text-slate-600"
            >
              {product.length_meters} m
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500">Unit {product.unit}</p>
      </div>

      <div className="mt-auto flex min-h-[40px] items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <Link
          href="/projects"
          className="text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
          onClick={(e) => e.stopPropagation()}
        >
          Add in Projects →
        </Link>
        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="min-h-8 rounded-xl px-2 text-xs transition-all duration-150 hover:scale-[1.02]"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyArticle();
            }}
          >
            {isCopied ? "Copied" : "Copy"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="primary"
            className="min-h-8 rounded-xl px-3 text-xs font-semibold shadow-sm transition-all duration-150 hover:scale-[1.02]"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
          >
            Details
          </Button>
        </div>
      </div>
    </article>
  );
}
