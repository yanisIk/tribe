
import {Document, Schema, Model, model} from "mongoose";
import { pointSchema, polygonSchema } from "./GeoJSONSchemas";

// Define the user profile interface
export interface IAnswer extends Document {
  userId?: string;
  questionId?: string;
  nickname?: string;
  assignedPollyVoice?: string;
  answer?: string;
  locationPoint?: {
    type: 'Point';
    coordinates: [number, number]; // [long, lat]
  };
  locationDetails?: {
    city: string;
    country: string;
  };
}

const AnswerSchema = new Schema({
  userId: { type: String, required: true, index: true },
  questionId: { type: String, required: true, index: true },
  nickname: { type: String },
  assignedPollyVoice: { type: String },
  answer: { type: String, required: true },
  locationPoint: { type: pointSchema },
  locationDetails: { 
    city: { type: String, index: true },
    country: { type: String, index: true },
  },
}, {
  timestamps: true
});

AnswerSchema.index({ locationPoint: "2dsphere" });

export const Answer: Model<IAnswer> = model<IAnswer>("Answer", AnswerSchema);
