import { Schema, model, type Document, type Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IAdmin extends Document {
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [50, "Username must be at most 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false, // never return by default
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

adminSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

adminSchema.statics.hashPassword = async function (
  password: string,
): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export interface AdminModel extends Model<IAdmin> {
  hashPassword(password: string): Promise<string>;
}

export const Admin = model<IAdmin, AdminModel>("Admin", adminSchema);
