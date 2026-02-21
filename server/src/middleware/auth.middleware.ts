import type { NextFunction, Request, Response } from "express";
import Token from "../services/token.service.js";

// Define the interface (Good job on this!)
export interface Authrequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

class CheckAuth {
    public static async authMiddleware(
        req: Authrequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            // 1. Extract Token
            const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

            if (!token) {
                return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
            }

            // 2. Verify Token
            // Ensure verifyToken returns the object { id, role }
            const decoded = await Token.verifyToken(token);

            if (!decoded) {
                return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
            }

            // 3. Attach to Request
            req.user = {
                id:decoded.id,
                role:decoded.role
            };

            // 4. Move to next middleware/controller
            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            // If verification fails, it's usually a 401 (Unauthorized), not a 500
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token expired or invalid",
            });
        }
    }

    public static async checkWorker( req: Authrequest,
        res: Response,
        next: NextFunction,){
            if (req.user?.role === 'worker') {
                next()
            }else{
                return res.status(400).json({message:"This is Protected route for Worker"})
            }

    }
    public static async checkContractor( req: Authrequest,
        res: Response,
        next: NextFunction,){
            if (req.user?.role === 'contractor') {
                next()
            }else{
                return res.status(400).json({message:"This is Protected route for Contractor"})
            }
    }
}

// Export the method directly for cleaner route files
export { CheckAuth };
