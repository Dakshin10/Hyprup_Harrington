import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBusinessProfile extends Document {
  uid: string;
  name?: string;
  category?: string;
  location?: string;
  createdAt: number;
}

const BusinessProfileSchema = new Schema<IBusinessProfile>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    category: { type: String },
    location: { type: String },
    createdAt: { type: Number, default: () => Date.now() },
  },
  { collection: "businessProfiles" }
);

const BusinessProfileModel: Model<IBusinessProfile> =
  mongoose.models.BusinessProfile ??
  mongoose.model<IBusinessProfile>("BusinessProfile", BusinessProfileSchema);

export default BusinessProfileModel;
