import type { Request, Response } from "express";
import User, { IUser } from "../models/user.model.js";
import UserService from "../services/user.service.js";
import Password from "../services/password.service.js";
import Token from "../services/token.service.js";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

class UserControllers {
  public static async registerUser(req: Request, res: Response) {
    try {
      const { name, email, phone, password, role, location, profileImage } =
        req.body;

      // 1. Validation
      if (!name || !email || !password || !location) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // 2. Check existence (Keep this in the controller or move to Service)
      const isExisting = await User.findOne({ email });

      if (isExisting) {
        return res.status(400).json({ message: "User already register" });
      }

      // 3. Hash Password
      const hashPassword = await Password.hashPassword(password);

      const nameParts = name.trim().split(" ");
      const seed = `${nameParts[0]} ${nameParts[1] || ""}`;

      const avatarUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=00897b,00acc1,039be5,1e88e5&fontFamily=Arial&fontWeight=600`;
      // 4. Create User (UserService already handles the .save())
      const newUser = await UserService.createUser({
        name,
        email,
        password: hashPassword,
        role,
        location,
        profileImage: avatarUrl,
      });

      // 5. Generate Token
      const payload = { id: newUser._id.toString(), role: newUser.role };

      const token = await Token.generateToken(payload);

      res.cookie("token", token);
      res.status(201).json({
        success: true,
        data: newUser,
        token,
      });
    } catch (error) {
      console.error("Registration Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  public static async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const isUser = await User.findOne({ email });

      if (!isUser) {
        return res.status(400).json({ message: "Invalid Email or Password" });
      }

      const isMatch = await Password.comparePassword(password, isUser.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid Email or Password" });
      }
      const payload = { id: isUser._id.toString(), role: isUser.role };

      const token = await Token.generateToken(payload);

      res.cookie("token", token);

      res.status(200).json({
        success: true,
        message: "User login successfully",
        data: isUser,
        token,
      });
    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  public static async logOut(req: Request, res: Response) {
    try {
      res.clearCookie("token");
      res
        .status(200)
        .json({ success: true, messsage: "User logout successfully" });
    } catch (error) {
      console.error("LogOut Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  public static async updateProfile(req: Request, res: Response) {
    try {
      const user = req.user.id as any;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const {
        name,
        phone,
        skills,
        experience,
        isAvailable,
        location,
        profileImage,
      } = req.body;

      // ✅ Whitelist allowed fields only
      const updateData: any = {};

      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (skills) updateData.skills = skills;
      if (experience !== undefined) updateData.experience = experience;
      if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
      if (
        location &&
        location.type === "Point" &&
        Array.isArray(location.coordinates) &&
        location.coordinates.length === 2
      ) {
        updateData.location = location;
      }
      if (profileImage) updateData.profileImage = profileImage;

      const updatedUser = await User.findByIdAndUpdate(
        user,
        { $set: updateData },
        { returnDocument: "after", runValidators: true },
      ).select("-password");

      return res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      console.error("Update Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  public static async updateStatus(req: Request, res: Response) {
    try {
      const user = req.user.id as any;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const loggineduser = await User.findById(user).select("isAvailable");

      if (!loggineduser) {
        return res.status(401).json({ message: "User Not found" });
      }

      const updateStatus = await User.findByIdAndUpdate(
        user,
        { $set: { isAvailable: !loggineduser.isAvailable } },
        { returnDocument: "after" },
      ).select("-password");

      return res.status(200).json({
        success: true,
        updateStatus,
      });
    } catch (error) {
      console.error("Toggle Error:", error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  public static async getuserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(401).json({ message: "No user with this id" });
      }

      const user = await User.findById(id);
      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
        console.error("Getting User By Id Error:", error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
}

export default UserControllers;
