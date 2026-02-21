import express from "express"
import cors from "cors"
import { userRoute } from "./routes/user.routes.js";
import cookieParser from "cookie-parser"
import { ApiRateLimit } from "./middleware/rateLimit.middleware.js";
import jobRouter from "./routes/job.routes.js";
import reviewRouter from "./routes/review.routes.js";

export class App{
    public app = express()

    constructor(){
        this.initilizeMiddleware();
        this.initilizeRoutes()
    }

    private initilizeMiddleware():void{
        this.app.use(express.json())
        this.app.use(cors())
        this.app.use(ApiRateLimit)
        this.app.use(cookieParser())
    }

    private initilizeRoutes():void{
        this.app.use("/api/auth/" , userRoute)
        this.app.use("/api/job/" , jobRouter)
        this.app.use("/api/review/" , reviewRouter)
    }
}
export default App;