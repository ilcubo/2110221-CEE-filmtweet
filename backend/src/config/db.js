import mongoose from "mongoose";

const uri = process.env.MONGO_URL;
if (!uri) {
	console.error("MONGO_URL is not defined. Set it in the project env file or environment variables.");
	// Do not exit here to allow the app to start in development if desired,
	// but subsequent DB operations will fail with helpful logs.
}

mongoose
	.connect(uri)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => {
		console.error("MongoDB connection error:", err.message || err);
		// Keep process running to allow graceful error handling in server.js
	});

export default mongoose;
