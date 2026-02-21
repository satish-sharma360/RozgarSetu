import dotenv from "dotenv";
import mongoose from "mongoose";
import Database from "./utils/database.js";
import { App } from "./app.js";

dotenv.config();

async function bootstrap(): Promise<void> {
    await Database.connect();

    const app = new App().app;
    const port = Number(process.env.PORT ?? 4000);

    const server = app.listen(port, () => {
        console.log(`Server listening on port ${port} 🚀`);
    });

    const shutdown = (signal?: string) => {
        console.log(`Received ${signal ?? "shutdown"}, closing server...`);
        server.close(async () => {
            try {
                await mongoose.disconnect();
                console.log("MongoDB disconnected");
            } catch (err) {
                console.error("Error during mongoose disconnect:", err);
            }
            process.exit(0);
        });

        // force exit if graceful shutdown takes too long
        setTimeout(() => {
            console.error("Forcing process exit");
            process.exit(1);
        }, 10000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
    console.error("Failed to start:", err);
    process.exit(1);
});