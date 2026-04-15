import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  uid: string;
  email: string;
  role: "student" | "business";
  createdAt: string;
  // Student-specific
  available?: boolean;
  skills?: string[];
  name?: string;
  rating?: number;
  jobsCompleted?: number;
  reliability?: number;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    role: { type: String, enum: ["student", "business"], required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    available: { type: Boolean, default: true },
    skills: { type: [String], default: [] },
    name: { type: String },
    rating: { type: Number, default: 0 },
    jobsCompleted: { type: Number, default: 0 },
    reliability: { type: Number, default: 100 },
  },
  { collection: "users" }
);

const UserModel: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default UserModel;
