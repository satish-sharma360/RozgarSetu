import mongoose from "mongoose";
import jobModel, { IJob } from "../models/job.model.js";

class JobService{
    public static async CreateJob(jobData:Partial<IJob>,contractorId:string):Promise<IJob>{
        try {
            const Job = await jobModel.create({
                ...jobData,
                contractor:new mongoose.Types.ObjectId(contractorId),
                status:"pending"
            })
            return Job;
        } catch (error:any) {
            throw error;
        }
    }
}
export default JobService