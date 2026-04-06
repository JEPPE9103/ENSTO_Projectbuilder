import { Button, Card } from "@/components/ui";
import type { SystemItem } from "@/components/project/types";

type ProjectItemsTableProps = {
  title: string;
  items: SystemItem[];
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
};

export function ProjectItemsTable({
  title,
  items,
  onIncrease,
  onDecrease,
  onRemove,
}: ProjectItemsTableProps) {
  return (
    <Card>
      <h2 className="mb-2 text-sm font-semibold text-slate-800">{title}</h2>
      {items.length === 0 && (
        <p className="text-xs text-slate-500">
          No products added to this system yet.
        </p>
      )}
      {items.length > 0 && (
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Product name</th>
              <th className="py-2 pr-3">Article number</th>
              <th className="py-2 pr-3">E-number</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3 text-right">Quantity</th>
              <th className="py-2 pr-3">Unit</th>
              <th className="py-2 pr-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.productId}
                className="border-b border-slate-100 transition-colors duration-150 ease-out hover:bg-slate-50/70"
              >
                <td className="py-1.5 pr-3">{item.name}</td>
                <td className="py-1.5 pr-3 font-mono text-[11px]">
                  {item.articleNumber}
                </td>
                <td className="py-1.5 pr-3">{item.eNumber}</td>
                <td className="py-1.5 pr-3">{item.category}</td>
                <td className="py-1.5 pr-3 text-right">
                  <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-1">
                    <button
                      type="button"
                      className="px-1 text-slate-600 hover:text-slate-900"
                      onClick={() => onDecrease(item.productId)}
                    >
                      -
                    </button>
                    <span className="min-w-[1.5rem] text-center">{item.quantity}</span>
                    <button
                      type="button"
                      className="px-1 text-slate-600 hover:text-slate-900"
                      onClick={() => onIncrease(item.productId)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="py-1.5 pr-3">{item.unit}</td>
                <td className="py-1.5 pr-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(item.productId)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
