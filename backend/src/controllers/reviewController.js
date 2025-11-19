// reviewController.js (Cleaned version)

import Review from "../models/reviewModel.js";
import Movie from "../models/movieModel.js";

/** @type {import("express").RequestHandler} */
export const getReviews = async (req, res) => {
    try {
        const { movie } = req.params; 
        const { title } = req.query; 

        const movieTitleToFilter = movie || title; 
        
        const filter = {};
        
        if (movieTitleToFilter) {
            filter.title = movieTitleToFilter; 
        } 

        const reviews = await Review.find(filter).sort({ createdAt: -1 });
        return res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ error: "Failed to fetch reviews." });
    }
};

/** @type {import("express").RequestHandler} */
export const createReview = async (req, res) => {
    try {
        const { title, review, rating } = req.body; 
        const username = req.user?.username; 

        // 1. INPUT VALIDATION
        if (!title) { 
            return res.status(400).json({ error: "Movie title is required." });
        }
        if (!username) {
            return res.status(401).json({ error: "User not authenticated." });
        }
        if (rating === undefined || rating === null) {
            return res.status(400).json({ error: "Rating is required." });
        }
        if (typeof rating !== 'number' || rating < 0 || rating > 5) {
            return res.status(400).json({ error: "Rating must be a number between 0 and 5." });
        }

        // 2. CHECK IF MOVIE EXISTS
        const movieDoc = await Movie.findOne({ title: title });
        if (!movieDoc) {
            return res.status(400).json({ error: "Movie not found." });
        }

        // 3. PREVENT DUPLICATE REVIEWS (Concurrency check - also enforced by Mongoose index)
        const existingReview = await Review.findOne({ username, title }); 
        if (existingReview) {
            return res.status(409).json({ error: "You have already reviewed this movie." });
        }

        // 4. CREATE THE REVIEW
        const newReview = await Review.create({
            username,
            title,
            review: review, // review is now guaranteed to be a string or undefined, which defaults to "" in the Model
            rating,
        });

        // 5. ATOMICALLY UPDATE MOVIE RATING (The critical fix)
        const result = await Review.aggregate([
            { $match: { title: title } }, 
            { $group: { _id: null, avgRating: { $avg: "$rating" } } } 
        ]);

        const newAvgRating = result.length > 0 ? result[0].avgRating : 0;
        const finalRating = Math.round(newAvgRating * 10) / 10; // Round to 1 decimal place

        // Update the movie's rating atomically
        await Movie.updateOne(
            { title: title },
            { rating: finalRating }
        );

        return res.status(201).json({
            review: newReview,
            movieRating: finalRating,
        });
    } catch (error) {
        console.error("Error creating review:", error);
        // Handle Mongoose Duplicate Key Error (E11000) from the compound index
        if (error.code === 11000) {
            return res.status(409).json({ error: "You have already reviewed this movie." });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error." });
    }
};

/** @type {import("express").RequestHandler} */
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params; // Review ID from URL parameter
        const username = req.user?.username; // Username from verifyToken middleware

        if (!username) {
            return res.status(401).json({ error: "User not authenticated." });
        }
        
        // 1. Find and check ownership of the review
        const reviewToDelete = await Review.findById(id);

        if (!reviewToDelete) {
            return res.status(404).json({ error: "Review not found." });
        }

        // Check if the authenticated user is the one who wrote the review
        if (reviewToDelete.username !== username) {
            // Using 403 Forbidden status code
            return res.status(403).json({ error: "You are not authorized to delete this review." });
        }

        const movieTitle = reviewToDelete.title;

        // 2. Delete the review
        await Review.deleteOne({ _id: id });
        
        // 3. Recalculate and update the movie's average rating
        const result = await Review.aggregate([
            { $match: { title: movieTitle } }, // Filter reviews for this movie
            { $group: { _id: null, avgRating: { $avg: "$rating" } } } // Calculate average rating
        ]);

        const newAvgRating = result.length > 0 ? result[0].avgRating : 0;
        const finalRating = Math.round(newAvgRating * 10) / 10;

        // Update the movie's rating atomically
        await Movie.updateOne(
            { title: movieTitle },
            { rating: finalRating }
        );

        return res.status(200).json({ message: "Review deleted successfully.", movieRating: finalRating });
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};