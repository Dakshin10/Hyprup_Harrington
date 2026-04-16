import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // UID of the recipient
  jobId: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["assigned", "cancelled", "applied", "completed"], 
    required: true 
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
