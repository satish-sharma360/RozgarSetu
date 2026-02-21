import { Router } from "express";
import JobControllers from "../controllers/job.controllers.js";
import { CheckAuth } from "../middleware/auth.middleware.js";

const jobRouter = Router()

jobRouter.use(CheckAuth.authMiddleware)
jobRouter.post('/create', CheckAuth.checkContractor, JobControllers.createJob)
jobRouter.get('/my-jobs', CheckAuth.checkContractor, JobControllers.getAllJob)
jobRouter.patch('/assign/:jobId', CheckAuth.checkContractor, JobControllers.assignWorker)

// Worker Route
jobRouter.patch('/status/:jobId', CheckAuth.checkWorker, JobControllers.updateJobStatus)
jobRouter.get('/:jobId', JobControllers.getJobById) //No role middleware needed — only auth.
jobRouter.get('/:jobId/route', CheckAuth.checkWorker, JobControllers.getRoute)

export default jobRouter