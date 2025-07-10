import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Roles } from "../config/roles";

export interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  __v?: number;
  email: string;
  name: string;
  password: string;
  isVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    UserDocument,
    "_id" | "email" | "isVerified" | "createdAt" | "updatedAt" | "__v"
  >;
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false, required: true },
    role: {
      type: String,
      enum: Object.values(Roles),
      default: Roles.ANALYST,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare method
userSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

// Omit password from output
userSchema.methods.omitPassword = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
