import Review from "../models/reviewModel.js";
import Movie from "../models/movieModel.js";

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

/** @type {import("express").RequestHandler} */
export const createReview = async (req, res) => {
    try {
        const { movie, comment, rating } = req.body;
        const username = req.user?.username;

        // Validate required fields
        if (!movie) {
            return res.status(400).json({ error: "movie is required" });
        }
        if (!username) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        if (rating === undefined || rating === null) {
            return res.status(400).json({ error: "rating is required" });
        }
        if (rating < 0 || rating > 5) {
            return res.status(400).json({ error: "rating must be between 0 and 5" });
        }

        // Verify the movie exists
        const movieExists = await Movie.findOne({ title: movie });
        if (!movieExists) {
            return res.status(400).json({ error: "Movie not found" });
        }

        // Create the review
        const review = await Review.create({
            username,
            movie,
            comment: comment || "",
            rating,
        });

        // Update movie rating: calculate average of all reviews for this movie
        const allReviews = await Review.find({ movie });
        const avgRating = allReviews.length > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            : 0;

        // Update the movie's rating
        const updatedMovie = await Movie.findOneAndUpdate(
            { title: movie },
            { rating: Math.round(avgRating * 10) / 10 }, // Round to 1 decimal place
            { new: true }
        );

        return res.status(201).json({
            review,
            movieRating: updatedMovie.rating,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};