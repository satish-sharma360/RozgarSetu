import { User as userModel } from "../models/user.model.js";
import type { IUser } from "../models/user.model.js";

class UserService {

  public static async createUser(
    userData: Partial<IUser>
  ): Promise<IUser> {
    try {
      const user = new userModel(userData);
      await user.save();
      return user;
    } catch (error: unknown) {
      throw error;
    }
  }
}
export default UserService;
