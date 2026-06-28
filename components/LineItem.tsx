"use client";

import { LineItem as LineItemType } from "@/types/estimate";

interface Props {
  item: LineItemType;
  onChange: (updated: LineItemType) => void;
  onDelete: (id: string) => void;
}

export default function LineItem({ item, onChange, onDelete }: Props) {
  function updateField<K extends keyof LineItemType>(key: K, value: LineItemType[K]) {
    const updated = { ...item, [key]: value };
    if (key === "qty" || key === "unitPrice") {
      updated.total = Number(updated.qty) * Number(updated.unitPrice);
    }
    onChange(updated);
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-orange-50/30 group">
      <td className="py-2 px-2 text-xs text-gray-500 whitespace-nowrap">{item.category}</td>
      <td className="py-2 px-2">
        <input
          className="w-full text-sm text-gray-800 bg-transparent border-b border-transparent focus:border-orange-400 focus:outline-none"
          value={item.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </td>
      <td className="py-2 px-2 text-right">
        <input
          type="number"
          min={0}
          step={0.01}
          className="w-20 text-sm text-right bg-transparent border-b border-transparent focus:border-orange-400 focus:outline-none"
          value={item.qty}
          onChange={(e) => updateField("qty", Number(e.target.value))}
        />
      </td>
      <td className="py-2 px-2 text-sm text-gray-500">{item.unit}</td>
      <td className="py-2 px-2 text-right">
        <span className="text-gray-400 text-sm">$</span>
        <input
          type="number"
          min={0}
          step={0.01}
          className="w-20 text-sm text-right bg-transparent border-b border-transparent focus:border-orange-400 focus:outline-none"
          value={item.unitPrice}
          onChange={(e) => updateField("unitPrice", Number(e.target.value))}
        />
      </td>
      <td className="py-2 px-2 text-right text-sm font-semibold text-gray-800">
        ${item.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="py-2 px-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(item.id)}
          className="text-red-400 hover:text-red-600 text-xs font-bold px-1"
          title="Remove line"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
