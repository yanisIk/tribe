
import {Document, Schema, Model, model} from "mongoose";
import { pointSchema, polygonSchema } from "./GeoJSONSchemas";

// Define the user profile interface
export interface IUserProfile extends Document {
  userId?: string;
  email?: string;
  surname?: string;
  assignedPollyVoice?: string;
  locationPoint?: {
    type: 'Point';
    coordinates: [number] // [long, lat]
  },
  locationDetails?: {
    city: string;
    country: string;
    cityPolygon: {
      type: 'Polygon',
      coordinates: [[
        [number]
      ]]
    };
  },
}

// Define the User Profile schema.
const UserProfileSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  surname: { type: String },
  assignedPollyVoice: { type: String },
  locationPoint: { type: pointSchema },
  locationDetails: { 
    city: { type: String },
    country: { type: String },
    cityPolygon: { type: polygonSchema }
  },
});

export const UserProfile: Model<IUserProfile> = model<IUserProfile>("UserProfile", UserProfileSchema);
