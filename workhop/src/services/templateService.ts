import { mockDb } from "@/lib/mockDb";

interface JobTemplate {
  id?: string;
  title: string;
  description?: string;
  payment: number;
  duration: number;
  location?: any;
  address?: string;
  isUrgent: boolean;
  jobType: "instant" | "scheduled";
  slots: number;
  createdBy?: string;
  createdAt?: number;
}

// ─── Fetch templates ──────────────────────────────────────────────────────────
export async function getTemplates(): Promise<JobTemplate[]> {
  const user = mockDb.getUser();
  if (!user) return [];
  
  // Use a different key or mockDb method for templates if needed, 
  // but for simplicity we'll just check if we can store them in profiles or dummy list.
  // Let's add TEMPLATES to mockDb if not there.
  return (localStorage.getItem("workhop_templates") ? JSON.parse(localStorage.getItem("workhop_templates")!) : []) as JobTemplate[];
}

// ─── Save template ────────────────────────────────────────────────────────────
export async function saveTemplate(
  template: Omit<JobTemplate, "id" | "createdBy" | "createdAt">
): Promise<JobTemplate> {
  const user = mockDb.getUser();
  const templates = await getTemplates();
  const newTemplate = {
    ...template,
    id: `temp-${Date.now()}`,
    createdBy: user?.uid || "demo-user",
    createdAt: Date.now()
  };
  localStorage.setItem("workhop_templates", JSON.stringify([...templates, newTemplate]));
  return newTemplate;
}
