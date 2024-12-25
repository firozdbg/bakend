import mongoose from "mongoose";
import { DB_NAME } from '../constant.js';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Mongodb connected");
    console.log(connectionInstance.connection.host)
  }
  catch (err) {
    console.log("MongoDB connection failure", err);
    process.exit(1)
  }
}

export default connectDB;