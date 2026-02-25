import instance from "./axios";

export interface JobReview {
  _id: string;
  job: string;
  reviewer: { _id: string; name: string };
  reviewee: { _id: string; name: string };
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CreateReviewData {
  rating: number;
  comment: string;
}

const reviewApi = {
  getJobReview: async (jobId: string) => {
    const resp = await instance.get(`/review/review/job/${jobId}`);
    return resp.data;
  },
  createReview: async (jobId: string, data: CreateReviewData) => {
    const resp = await instance.post(`/review/${jobId}`, data);
    return resp.data;
  },
  getUserReviews: async (userId: string, page = 1, limit = 10) => {
    const resp = await instance.get(`/review/review/user/${userId}`, {
      params: { page, limit },
    });
    return resp.data;
  },
};

export default reviewApi;