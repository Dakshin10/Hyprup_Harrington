export interface Job {
  id?: string;
  jobId: string;
  title: string;
  description?: string;
  payment: number;
  duration: number;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  address?: string; // Human-readable address

  createdBy: string;
  applicants: string[];
  selectedUser: string | null;
  status: "open" | "closed" | "in-progress" | "assigned" | "completed" | "cancelled";
  date?: string;
  time?: string;
  businessName?: string;
  // Worker confirmation system
  confirmed?: boolean;          // student clicked "I'll Be There"
  confirmationDeadline?: number;// unix ms — business can set a cutoff
  backupUser?: string | null;   // auto-promoted backup if worker doesn't confirm
  // Execution
  checkIn?: boolean;
  checkInAt?: number | null;   // unix ms timestamp when student checked in
  checkOutAt?: number | null;  // unix ms timestamp when student completed
  completed?: boolean;
  ratingByStudent?: number;
  reviewByStudent?: string;
  ratingByBusiness?: number;
  reviewByBusiness?: string;
  paymentStatus?: "pending" | "paid";
  isUrgent?: boolean;
  jobType?: "instant" | "scheduled";
  slots?: number;
  createdAt: number;
}
