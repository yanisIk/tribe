
import {Document, Schema, Model, model} from "mongoose";
import { pointSchema, polygonSchema } from "./GeoJSONSchemas";

// Define the user profile interface
export interface IMessage extends Document {
  userId?: string;
  nickname?: string;
  assignedPollyVoice?: string;
  message?: string;
  locationPoint?: {
    type: 'Point';
    coordinates: [number, number]; // [long, lat]
  };
  locationDetails?: {
    city: string;
    country: string;
  };
}

// Define the User Profile schema.
const MessageSchema = new Schema({
  userId: { type: String, required: true, index: true },
  nickname: { type: String },
  assignedPollyVoice: { type: String },
  message: { type: String, required: true },
  locationPoint: { type: pointSchema },
  locationDetails: { 
    city: { type: String, index: true },
    country: { type: String, index: true },
  },
}, {
  timestamps: true
});

MessageSchema.index({ locationPoint: "2dsphere" });

export const Message: Model<IMessage> = model<IMessage>("Message", MessageSchema);
