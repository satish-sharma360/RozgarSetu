import { Request, Response } from "express";
import jobModel, { JobStatus } from "../models/job.model.js";
import User from "../models/user.model.js";
import JobService from "../services/job.service.js";
import mongoose from "mongoose";

class JobControllers {
  public static async createJob(req: Request, res: Response) {
    try {
      const contractorId = req.user?.id;
      console.log("User from token:", req.user);

      if (!contractorId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (req.user?.role !== "contractor") {
        return res
          .status(403)
          .json({ message: "Only contractor can create job" });
      }

      const { title, description, location, budget } = req.body;

      if (!title || !description || !location || !budget) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const job = await JobService.CreateJob(
        { title, description, location, budget },
        contractorId,
      );

      return res.status(201).json({
        success: true,
        data: job,
      });
    } catch (error) {
      console.error("Create Job Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  public static async getAllJob(req: Request, res: Response) {
    try {
      const contractorId = req.user?.id;

      if (!contractorId) {
        return res
          .status(400)
          .json({ success: false, message: "Unauthorized" });
      }

      if (req.user?.role !== "contractor") {
        return res
          .status(400)
          .json({ success: false, message: "Only contractor can create job" });
      }

      const allJobs = await jobModel
        .find({ contractor: contractorId })
        .populate("worker", "name skills isAvailable");

      return res
        .status(200)
        .json({ success: true, message: "Get all Job", allJobs });
    } catch (error) {
      console.error("Get All Job Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  public static async assignWorker(req: Request<{ jobId: string }>, res: Response) {
    try {
      const contractorId = req.user?.id;
      const { jobId } = req.params;
      const { workerId } = req.body;

      if (!contractorId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (req.user?.role !== "contractor") {
        return res.status(403).json({
          message: "Only contractor can assign worker",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: "Invalid Job ID" });
      }

      if (!mongoose.Types.ObjectId.isValid(workerId)) {
        return res.status(400).json({ message: "Invalid Worker ID" });
      }

      const job = await jobModel.findOne({
        _id: new mongoose.Types.ObjectId(jobId),
        contractor: new mongoose.Types.ObjectId(contractorId),
        status: JobStatus.PENDING,
      });

      if (!job) {
        return res
          .status(404)
          .json({ message: "Job not found or already assigned" });
      }

      job.worker = new mongoose.Types.ObjectId(workerId);
      job.status = JobStatus.ACCEPTED; // ✅ FIXED

      await job.save();
      return res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  public static async updateJobStatus(req: Request<{ jobId: string }>, res: Response) {
    try {
      const workerId = req.user?.id;
      const { jobId } = req.params;
      const { status } = req.body as { status: JobStatus };

      if (!workerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (req.user?.role !== "worker") {
        return res.status(403).json({
          message: "Only worker can update job",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: "Invalid Job ID" });
      }

      const job = await jobModel.findOne({
        _id: new mongoose.Types.ObjectId(jobId),
        worker: new mongoose.Types.ObjectId(workerId),
      });

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // ✅ Enum-safe transitions
      if (
        job.status === JobStatus.ACCEPTED &&
        status === JobStatus.IN_PROGRESS
      ) {
        job.status = JobStatus.IN_PROGRESS;
      } else if (
        job.status === JobStatus.IN_PROGRESS &&
        status === JobStatus.COMPLETED
      ) {
        job.status = JobStatus.COMPLETED;
      } else {
        return res.status(400).json({
          message: "Invalid status transition",
        });
      }

      await job.save();

      return res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  public static async getJobById(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      if (!jobId || Array.isArray(jobId)) {
        return res.status(400).json({ message: "Invalid Job ID" });
      }
      const jobIdStr = String(jobId);

      const job = await jobModel
        .findById(jobIdStr)
        .populate("contractor", "name")
        .populate("worker", "name skills location");

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      return res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Return routing directions (GeoJSON) from worker to job using OSRM public API
  public static async getRoute(req: Request, res: Response) {
    try {
      const workerId = req.user?.id;
      const { jobId } = req.params;

      if (!workerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (!jobId || Array.isArray(jobId)) {
        return res.status(400).json({ message: "Invalid Job ID" });
      }
      const jobIdStr = String(jobId);

      if (!mongoose.Types.ObjectId.isValid(jobIdStr)) {
        return res.status(400).json({ message: "Invalid Job ID" });
      }

      const job = await jobModel.findById(jobIdStr).populate("worker", "location");
      if (!job) return res.status(404).json({ message: "Job not found" });

      // ensure requester is the assigned worker
      if (!job.worker || (job.worker as any)._id?.toString() !== workerId && job.worker.toString() !== workerId) {
        return res.status(403).json({ message: "Only assigned worker can request route" });
      }

      // get worker location
      let workerLoc = (job.worker as any).location;
      if (!workerLoc) {
        const workerDoc = await User.findById(workerId).select("location");
        workerLoc = workerDoc?.location;
      }

      if (!workerLoc || !workerLoc.coordinates || !job.location || !job.location.coordinates) {
        return res.status(400).json({ message: "Missing coordinates for route calculation" });
      }

      const [jobLng, jobLat] = job.location.coordinates;
      const [workerLng, workerLat] = workerLoc.coordinates as [number, number];

      // Use OSRM public API (free). Format: /route/v1/driving/{lon1},{lat1};{lon2},{lat2}
      const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${workerLng},${workerLat};${jobLng},${jobLat}?overview=full&geometries=geojson`;

      const resp = await fetch(osrmUrl);
      if (!resp.ok) {
        return res.status(502).json({ message: "Routing service unavailable" });
      }
      const data: any = await resp.json();
      if (!data.routes || !data.routes.length) {
        return res.status(404).json({ message: "No route found" });
      }

      const route = data.routes[0];

      // Normalize geometry: if OSRM returns MultiLineString, merge into single LineString
      let geometry = route.geometry as any;
      if (geometry && geometry.type === "MultiLineString" && Array.isArray(geometry.coordinates)) {
        // flatten array of lines into single array of coords
        const flatCoords = geometry.coordinates.reduce((acc: any[], part: any[]) => acc.concat(part), []);
        geometry = { type: "LineString", coordinates: flatCoords };
      }

      return res.status(200).json({
        success: true,
        distance: route.distance, // meters
        duration: route.duration, // seconds
        geometry,
      });
    } catch (error) {
      console.error("GetRoute Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Note: driving directions and accurate distance are provided by the OSRM route endpoint.
}

export default JobControllers;
