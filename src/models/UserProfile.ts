
import {Document, Schema, Model, model} from "mongoose";
import { pointSchema, polygonSchema } from "./GeoJSONSchemas";

// Define the user profile interface
export interface IUserProfile extends Document {
  userId?: string;
  email?: string;
  nickname?: string;
  voiceGender?: string;
  assignedPollyVoice?: string;
  locationPoint?: {
    type: 'Point';
    coordinates: [number, number]; // [long, lat]
  };
  locationDetails?: {
    city: string;
    country: string;
    cityPolygon: {
      type: 'Polygon';
      coordinates: [[
        [number, number]
      ]];
    };
  };
  tribeRadiusInKm?: number;
}

// Define the User Profile schema.
const UserProfileSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  nickname: { type: String },
  voiceGender: { type: String },
  assignedPollyVoice: { type: String },
  locationPoint: { type: pointSchema },
  locationDetails: { 
    city: { type: String, index: true },
    country: { type: String, index: true },
    cityPolygon: { type: polygonSchema }
  },
  tribeRadiusInKm: {type: Number, default: 5}
}, {
  timestamps: true
});

UserProfileSchema.index({ locationPoint: "2dsphere" });

export const UserProfile: Model<IUserProfile> = model<IUserProfile>("UserProfile", UserProfileSchema);
