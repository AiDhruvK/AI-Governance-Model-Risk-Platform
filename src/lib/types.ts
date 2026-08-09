export type FilterState = Record<string, string>;

export type KpiItem = {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "default" | "danger" | "warning" | "success" | "info";
};

export type NavRoleView = {
  role: string;
  label: string;
};
