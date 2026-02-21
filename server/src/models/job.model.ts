import mongoose, { Schema, Document } from "mongoose";

export enum JobStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export interface IJob extends Document {
  contractor: mongoose.Types.ObjectId;
  worker: mongoose.Types.ObjectId | null; // ✅ allow null
  title: string;
  description: string;
  location: {
    type: "Point"; // ✅ strict type
    coordinates: [number, number]; // ✅ fixed tuple
  };
  budget: number;
  status: JobStatus;
}

const jobSchema = new Schema<IJob>(
  {
    contractor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    worker: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    budget: {
      type: Number,
      required: true,
      min: 100
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.PENDING
    }
  },
  { timestamps: true }
);

jobSchema.index({ location: "2dsphere" });

export default mongoose.model<IJob>("Job", jobSchema);