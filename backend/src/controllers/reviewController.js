import Review from "../models/reviewModel.js";

/** @type {import("express").RequestHandler} */
export const getReviews = async (req, res) => {
    try {
        const { movie } = req.params;

        if (!movie) {
            return res.status(400).json({ error: "movie parameter is required" });
        }

        // Find reviews that reference the given movie identifier/title
        const reviews = await Review.find({ movie }).sort({ createdAt: -1 });

        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};