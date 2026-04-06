import { Button, Card } from "@/components/ui";
import type { Product } from "@/lib/api-types";

type ProductDetailsModalProps = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
};

export function ProductDetailsModal({
  product,
  open,
  onClose,
}: ProductDetailsModalProps) {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {product.name}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                E-nr {product.e_number} •{" "}
                <span className="font-mono text-[11px]">
                  {product.article_number}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
            <div>
              <dt className="font-medium text-slate-700">Category</dt>
              <dd>{product.category}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Series</dt>
              <dd>{product.series}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Size</dt>
              <dd>{product.size}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Color</dt>
              <dd>{product.color}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Unit</dt>
              <dd>{product.unit}</dd>
            </div>
            {product.length_meters && (
              <div>
                <dt className="font-medium text-slate-700">Length</dt>
                <dd>{product.length_meters} m</dd>
              </div>
            )}
          </dl>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

