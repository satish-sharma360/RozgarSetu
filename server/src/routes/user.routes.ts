import { Router } from "express";
import UserControllers from "../controllers/user.controllers.js";
import { CheckAuth } from "../middleware/auth.middleware.js";

export const userRoute = Router();

userRoute.post('/register',UserControllers.registerUser);
userRoute.post('/login',UserControllers.loginUser);
userRoute.post('/logout',CheckAuth.authMiddleware ,UserControllers.logOut);
userRoute.patch('/update',CheckAuth.authMiddleware ,UserControllers.updateProfile);
userRoute.patch('/update-status',CheckAuth.authMiddleware ,UserControllers.updateStatus);
userRoute.get('/get-user/:id',CheckAuth.authMiddleware ,UserControllers.getuserById);

export default userRoute;