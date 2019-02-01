
import {Document, Schema, Model, model} from "mongoose";
import { pointSchema, polygonSchema } from "./GeoJSONSchemas";

// Define the user profile interface
export interface IMessage extends Document {
  userId?: string;
  surname?: string;
  assignedPollyVoice?: string;
  locationPoint?: {
    type: 'Point';
    coordinates: [number] // [long, lat]
  },
  locationDetails?: {
    city: string;
    country: string;
  },
}

// Define the User Profile schema.
const MessageSchema = new Schema({
  userId: { type: String, required: true },
  surname: { type: String },
  assignedPollyVoice: { type: String },
  locationPoint: { type: pointSchema },
  locationDetails: { 
    city: { type: String },
    country: { type: String },
  },
});

export const Message: Model<IMessage> = model<IMessage>("Message", MessageSchema);
