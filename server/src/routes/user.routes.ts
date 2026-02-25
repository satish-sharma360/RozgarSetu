import { Router } from "express";
import UserControllers from "../controllers/user.controllers.js";
import { CheckAuth } from "../middleware/auth.middleware.js";

export const userRoute = Router();

userRoute.post("/register", UserControllers.registerUser);
userRoute.post("/login", UserControllers.loginUser);

userRoute.use(CheckAuth.authMiddleware);

userRoute.post("/logout", UserControllers.logOut);
userRoute.patch("/update", UserControllers.updateProfile);
userRoute.patch("/update-status", CheckAuth.checkWorker, UserControllers.updateStatus);
userRoute.get("/workers", UserControllers.getWorkers);   // ← NEW: get available workers
userRoute.get("/get-user/:id", UserControllers.getuserById);

export default userRoute;