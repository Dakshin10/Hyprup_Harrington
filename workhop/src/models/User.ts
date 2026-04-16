import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  uid: string;
  email: string;
  role: "student" | "business";
  name?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "business"],
    required: true,
  },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Avoid re-compiling the model if it already exists
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
