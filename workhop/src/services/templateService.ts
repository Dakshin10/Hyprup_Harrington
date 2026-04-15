import { apiFetch } from "./api";

interface JobTemplate {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  payment: number;
  duration: number;
  location?: string;
  isUrgent: boolean;
  jobType: "instant" | "scheduled";
  slots: number;
  createdBy?: string;
  createdAt?: number;
}

// ─── Fetch templates ──────────────────────────────────────────────────────────
export async function getTemplates(): Promise<JobTemplate[]> {
  const data = await apiFetch<{ templates: JobTemplate[] }>("/api/templates");
  return data.templates.map((t) => ({ ...t, id: t._id as string }));
}

// ─── Save template ────────────────────────────────────────────────────────────
export async function saveTemplate(
  template: Omit<JobTemplate, "id" | "_id" | "createdBy" | "createdAt">
): Promise<JobTemplate> {
  const data = await apiFetch<{ template: JobTemplate }>("/api/templates", {
    method: "POST",
    body: JSON.stringify(template),
  });
  return data.template;
}
