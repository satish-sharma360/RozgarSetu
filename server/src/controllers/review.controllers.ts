import { Request, Response } from "express";
import ReviewService from "../services/review.service.js";

class ReviewController {

  static async createReview(req: Request, res: Response) {
  try {
    const { jobId } = req.params;
    const { rating, comment } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ FIX: Narrow jobId type
    if (!jobId || Array.isArray(jobId)) {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1-5" });
    }
    const review = await ReviewService.createReview(
      jobId, // now guaranteed string
      req.user.id,
      rating,
      comment
    );

    res.status(201).json({
      message: "Review submitted successfully",
      review
    });

  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

  static async getUserReviews(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const data = await ReviewService.getUserReviews(
        String(userId),
        Number(page),
        Number(limit)
      );

      res.status(200).json(data);

    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getJobReview(req: Request, res: Response) {
  try {
    const { jobId } = req.params;

    if (!jobId || Array.isArray(jobId)) {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    const review = await ReviewService.getJobReview(jobId);

    res.status(200).json(review);

  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}
}

export default ReviewController;