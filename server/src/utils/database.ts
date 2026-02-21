import mongoose from "mongoose";

class Database {
  public static async connect(): Promise<void> {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.error("❌ MONGO_URI is not defined in environment variables.");
      process.exit(1);
    }

    try {
      await mongoose.connect(uri);
      console.log("Database connected ✅");
    } catch (error) {
      console.error("Database connection failed ❌");
      console.error(error);
      process.exit(1);
    }
  }
}
export default Database;
