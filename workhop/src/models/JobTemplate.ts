import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJobTemplate extends Document {
  title: string;
  description?: string;
  payment: number;
  duration: number;
  location: string;
  isUrgent: boolean;
  jobType: "instant" | "scheduled";
  slots: number;
  createdBy: string;
  createdAt: number;
}

const JobTemplateSchema = new Schema<IJobTemplate>(
  {
    title: { type: String, required: true },
    description: { type: String },
    payment: { type: Number, required: true },
    duration: { type: Number, required: true },
    location: { type: String },
    isUrgent: { type: Boolean, default: false },
    jobType: { type: String, enum: ["instant", "scheduled"], default: "instant" },
    slots: { type: Number, default: 1 },
    createdBy: { type: String, required: true, index: true },
    createdAt: { type: Number, default: () => Date.now() },
  },
  { collection: "jobTemplates" }
);

const JobTemplateModel: Model<IJobTemplate> =
  mongoose.models.JobTemplate ??
  mongoose.model<IJobTemplate>("JobTemplate", JobTemplateSchema);

export default JobTemplateModel;
