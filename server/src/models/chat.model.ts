import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  job: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  message: string;
  seen: boolean;
}

const messageSchema = new Schema<IMessage>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true
    },
    seen: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", messageSchema);