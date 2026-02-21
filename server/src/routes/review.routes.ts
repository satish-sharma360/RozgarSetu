import { Router } from "express";
import { CheckAuth } from "../middleware/auth.middleware.js";
import ReviewController from "../controllers/review.controllers.js";

const reviewRouter = Router();

// Protected routes
reviewRouter.use(CheckAuth.authMiddleware);

// Create review
reviewRouter.post(
  "/:jobId",
  CheckAuth.checkContractor,
  ReviewController.createReview
);

// Get all reviews of a user
reviewRouter.get(
  "/review/user/:userId",
  ReviewController.getUserReviews
);

// Get review of a job
reviewRouter.get(
  "/review/job/:jobId",
  ReviewController.getJobReview
);

export default reviewRouter;