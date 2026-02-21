import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  job: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}

const reviewSchema = new Schema<IReview>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    }
  },
  { timestamps: true }
);

export default mongoose.model<IReview>("Review", reviewSchema);