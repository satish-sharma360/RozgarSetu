import mongoose, { Schema, Document } from "mongoose";

export enum UserRole {
  WORKER = "worker",
  CONTRACTOR = "contractor",
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  profileImage?: string;
  skills?: string[];
  experience?: number;
  isAvailable?: boolean;
  location: {
    type: string;
    coordinates: number[];
  };
  rating: number;
  totalReviews: number;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      rerquired: true,
      match: /^[0-9]{10}$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    profileImage: String,
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

UserSchema.index({ location: "2dsphere" });

// we export the model as a named constant rather than a default export
export const User = mongoose.model<IUser>("User", UserSchema);

// keep default export for compatibility if something else imports it
export default User;
