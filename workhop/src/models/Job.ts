import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
  jobId: string;
  title: string;
  description?: string;
  payment: number;
  duration: number;
  location: string;
  createdBy: string;
  applicants: string[];
  selectedUser: string | null;
  backupUser?: string | null;
  status: "open" | "closed" | "in-progress" | "assigned" | "completed";
  // Confirmation
  confirmed?: boolean;
  confirmationDeadline?: number;
  // Execution
  checkIn?: boolean;
  checkInAt?: number | null;
  checkOutAt?: number | null;
  completed?: boolean;
  // Ratings
  ratingByStudent?: number;
  reviewByStudent?: string;
  ratingByBusiness?: number;
  reviewByBusiness?: string;
  // Payment
  paymentStatus?: "pending" | "paid";
  // Flags
  isUrgent?: boolean;
  jobType?: "instant" | "scheduled";
  slots?: number;
  createdAt: number;
}

const JobSchema = new Schema<IJob>(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    payment: { type: Number, required: true },
    duration: { type: Number, required: true },
    location: { type: String, required: true },
    createdBy: { type: String, required: true, index: true },
    applicants: { type: [String], default: [] },
    selectedUser: { type: String, default: null },
    backupUser: { type: String, default: null },
    status: {
      type: String,
      enum: ["open", "closed", "in-progress", "assigned", "completed"],
      default: "open",
      index: true,
    },
    confirmed: { type: Boolean, default: false },
    confirmationDeadline: { type: Number },
    checkIn: { type: Boolean, default: false },
    checkInAt: { type: Number, default: null },
    checkOutAt: { type: Number, default: null },
    completed: { type: Boolean, default: false },
    ratingByStudent: { type: Number },
    reviewByStudent: { type: String },
    ratingByBusiness: { type: Number },
    reviewByBusiness: { type: String },
    paymentStatus: { type: String, enum: ["pending", "paid"] },
    isUrgent: { type: Boolean, default: false },
    jobType: { type: String, enum: ["instant", "scheduled"], default: "instant" },
    slots: { type: Number, default: 1 },
    createdAt: { type: Number, default: () => Date.now() },
  },
  { collection: "jobs" }
);

// Compound index for efficient applicant queries
JobSchema.index({ applicants: 1 });
// Index for selectedUser queries (student active jobs)
JobSchema.index({ selectedUser: 1, completed: 1 });

const JobModel: Model<IJob> =
  mongoose.models.Job ?? mongoose.model<IJob>("Job", JobSchema);

export default JobModel;
