import { AppError } from "../errors/AppError";
import UserModel from "../models/user.model";
import { CreateUserDTO } from "../types/auth.types";

export default class UserService {
  static async createUser(data: CreateUserDTO) {
    const user = await UserModel.create(data);
    return user;
  }

  static async findByEmail(email: string) {
    if (!email) throw new AppError("Email is required", 400);
    return await UserModel.findOne({ email });
  }

  static async findById(id: string) {
    if (!id) throw new AppError("User ID is required", 400);
    const user = await UserModel.findById(id).select("-password");
    // if (!user) throw new NotFoundError("User not found");
    return user;
  }
}
