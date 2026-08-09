"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

export type FilterOption = {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
};

export function FilterBar({
  filters,
  searchKey = "q",
  searchPlaceholder = "Search...",
}: {
  filters: FilterOption[];
  searchKey?: string;
  searchPlaceholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className={`mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-2 xl:grid-cols-4 ${pending ? "opacity-70" : ""}`}>
      <label className="block text-xs font-medium text-slate-500">
        Search
        <input
          defaultValue={searchParams.get(searchKey) ?? ""}
          onChange={(e) => update(searchKey, e.target.value)}
          placeholder={searchPlaceholder}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
        />
      </label>
      {filters.map((filter) => (
        <label key={filter.key} className="block text-xs font-medium text-slate-500">
          {filter.label}
          <select
            value={searchParams.get(filter.key) ?? ""}
            onChange={(e) => update(filter.key, e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
          >
            <option value="">All</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
