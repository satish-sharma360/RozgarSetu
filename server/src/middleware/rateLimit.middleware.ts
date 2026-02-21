import rateLimit from "express-rate-limit";

export const ApiRateLimit = rateLimit({
    windowMs:15 * 60 * 1000, // 15 mints
    max:100,
    message:{
        message:"Too many request , Please try again"
    }
})

export default ApiRateLimit;