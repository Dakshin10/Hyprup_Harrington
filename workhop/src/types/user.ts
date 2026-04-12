export type UserRole = "student" | "business";

export interface UserProfile {
  uid: string;
  email: string | null;
  role: UserRole;
  createdAt: string;
}
