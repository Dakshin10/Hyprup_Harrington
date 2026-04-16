import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  payment: { type: Number, required: true },
  duration: { type: Number, required: true },
  
  // 🔥 Date and Time for the job
  date: { type: Date },
  time: { type: String },
  
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
  address: { type: String },
  createdBy: { type: String, required: true }, // Firebase UID of the business
  businessName: { type: String }, // For easier display on student side
  
  applicants: { type: [String], default: [] },
  assignedUsers: { type: [String], default: [] }, // 🔥 array of student IDs
  peopleRequired: { type: Number, default: 1 }, // 🔥 NEW
  
  status: {
    type: String,
    enum: ["open", "full", "closed", "in-progress", "assigned", "completed", "cancelled"], // 🔥 Added cancelled and full
    default: "open",
  },
  
  confirmed: { type: Boolean, default: false },
  confirmationDeadline: { type: Number },
  backupUser: { type: String, default: null },
  checkIn: { type: Boolean, default: false },
  checkInAt: { type: Number, default: null },
  checkOutAt: { type: Number, default: null },
  completed: { type: Boolean, default: false },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  isUrgent: { type: Boolean, default: false },
  jobType: {
    type: String,
    enum: ["instant", "scheduled"],
    default: "scheduled",
  },
  createdAt: { type: Number, default: Date.now },
});

// Index for geospatial queries
JobSchema.index({ location: "2dsphere" });

export default mongoose.models.Job || mongoose.model("Job", JobSchema);
