import instance from "./axios";

export enum JobStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Location {
  type: "Point";
  coordinates: [number, number];
}

export interface Job {
  _id: string;
  contractor: string | { _id: string; name: string; profileImage?: string };
  worker: string | null | { _id: string; name: string; skills?: string[]; isAvailable?: boolean; location?: Location; rating?: number; profileImage?: string };
  requests?: Array<{ _id: string; name: string; skills?: string[]; rating?: number; totalReviews?: number; profileImage?: string }>;
  title: string;
  description: string;
  location: Location;
  budget: number;
  status: JobStatus;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CreateJobData {
  title: string;
  description: string;
  location: Location;
  budget: number;
}

const jobApi = {
  // Contractor
  create: async (data: CreateJobData) => {
    const resp = await instance.post("/job/create", data);
    return resp.data;
  },
  getMyJobs: async () => {
    const resp = await instance.get("/job/my-jobs");
    return resp.data;
  },
  getJobRequests: async (jobId: string) => {
    const resp = await instance.get(`/job/${jobId}/requests`);
    return resp.data;
  },
  assignWorker: async (jobId: string, workerId: string) => {
    const resp = await instance.patch(`/job/assign/${jobId}`, { workerId });
    return resp.data;
  },

  // Worker
  getAvailableJobs: async () => {
    const resp = await instance.get("/job/available");
    return resp.data;
  },
  getAssignedJobs: async () => {
    const resp = await instance.get("/job/assigned");
    return resp.data;
  },
  requestJob: async (jobId: string) => {
    const resp = await instance.post(`/job/${jobId}/request`);
    return resp.data;
  },
  cancelRequest: async (jobId: string) => {
    const resp = await instance.delete(`/job/${jobId}/request`);
    return resp.data;
  },
  updateStatus: async (jobId: string, status: JobStatus) => {
    const resp = await instance.patch(`/job/status/${jobId}`, { status });
    return resp.data;
  },

  // Shared
  getById: async (id: string) => {
    const resp = await instance.get(`/job/${id}`);
    return resp.data;
  },
  getRoute: async (jobId: string) => {
    const resp = await instance.get(`/job/${jobId}/route`);
    return resp.data;
  },
};

export default jobApi;