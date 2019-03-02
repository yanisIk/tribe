
import {Document, Schema, Model, model} from "mongoose";
import { pointSchema, polygonSchema } from "./GeoJSONSchemas";

// Define the user profile interface
export interface IQuestion extends Document {
  userId?: string;
  nickname?: string;
  assignedPollyVoice?: string;
  question?: string;
  locationPoint?: {
    type: 'Point';
    coordinates: [number, number]; // [long, lat]
  };
  locationDetails?: {
    city: string;
    country: string;
  };
}

const QuestionSchema = new Schema({
  userId: { type: String, required: true, index: true },
  nickname: { type: String },
  assignedPollyVoice: { type: String },
  question: { type: String, required: true },
  locationPoint: { type: pointSchema },
  locationDetails: { 
    city: { type: String, index: true },
    country: { type: String, index: true },
  },
}, {
  timestamps: true
});

QuestionSchema.index({ locationPoint: "2dsphere" });

export const Question: Model<IQuestion> = model<IQuestion>("Question", QuestionSchema);
