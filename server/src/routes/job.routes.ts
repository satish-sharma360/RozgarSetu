import { Router } from "express";
import JobControllers from "../controllers/job.controllers.js";
import { CheckAuth } from "../middleware/auth.middleware.js";

const jobRouter = Router();

jobRouter.use(CheckAuth.authMiddleware);

// ── Contractor routes ──
jobRouter.post("/create", CheckAuth.checkContractor, JobControllers.createJob);
jobRouter.get("/my-jobs", CheckAuth.checkContractor, JobControllers.getAllJob);
jobRouter.patch("/assign/:jobId", CheckAuth.checkContractor, JobControllers.assignWorker);
jobRouter.get("/:jobId/requests", CheckAuth.checkContractor, JobControllers.getJobRequests);

// ── Worker routes ──
jobRouter.get("/available", CheckAuth.checkWorker, JobControllers.getAvailableJobs);
jobRouter.get("/assigned", CheckAuth.checkWorker, JobControllers.getAssignedJobs);
jobRouter.post("/:jobId/request", CheckAuth.checkWorker, JobControllers.requestJob);
jobRouter.delete("/:jobId/request", CheckAuth.checkWorker, JobControllers.cancelRequest);
jobRouter.patch("/status/:jobId", CheckAuth.checkWorker, JobControllers.updateJobStatus);

// ── Shared (any authenticated user) ──
jobRouter.get("/:jobId/route", CheckAuth.checkWorker, JobControllers.getRoute);
jobRouter.get("/:jobId", JobControllers.getJobById);

export default jobRouter;