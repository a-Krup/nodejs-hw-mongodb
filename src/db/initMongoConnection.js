import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function initMongoConnection() {
  const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_URL, MONGODB_DB } =
    process.env;

  const uri = `mongodb+srv://${MONGODB_USER}:${encodeURIComponent(
    MONGODB_PASSWORD
  )}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Mongo connection successfully established!");
  } catch (error) {
    console.error("Mongo connection error:", error);
    process.exit(1);
  }
}
