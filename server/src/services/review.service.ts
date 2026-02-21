import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import Job from "../models/job.model.js";

class ReviewService {

  static async createReview(
  jobId: string,
  reviewerId: string,
  rating: number,
  comment: string
) {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status !== "completed") {
    throw new Error("Cannot review before job completion");
  }

  if (!job.worker) {
    throw new Error("No worker assigned to this job");
  }

  if (job.contractor.toString() !== reviewerId) {
    throw new Error("Only contractor can review worker");
  }

  const existingReview = await Review.findOne({
    job: jobId,
    reviewer: reviewerId
  });

  if (existingReview) {
    throw new Error("You already reviewed this job");
  }

  const review = await Review.create({
    job: jobId,
    reviewer: reviewerId,
    reviewee: job.worker, // safe now
    rating,
    comment
  });

  await this.updateUserRating(job.worker.toString(), rating);

  return review;
}

  private static async updateUserRating(
    userId: string,
    newRating: number
  ) {
    const user = await User.findById(userId);
    if (!user) return;

    const totalReviews = user.totalReviews;
    const currentRating = user.rating;

    const updatedTotal = totalReviews + 1;

    const updatedAverage =
      (currentRating * totalReviews + newRating) / updatedTotal;

    user.rating = Number(updatedAverage.toFixed(2));
    user.totalReviews = updatedTotal;

    await user.save();
  }

  static async getUserReviews(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ reviewee: userId });

    return {
      total,
      page,
      pages: Math.ceil(total / limit),
      reviews
    };
  }

  static async getJobReview(jobId: string) {
    return Review.findOne({ job: jobId })
      .populate("reviewer", "name")
      .populate("reviewee", "name");
  }
}

export default ReviewService;