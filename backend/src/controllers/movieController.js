import Movie from "../models/movieModel.js";

/** * Retrieves all movies from the database.
 * @type {import("express").RequestHandler} 
 */
export const getMovies = async (req, res) => {
    console.log("getMovies() was ran");
    try {
        const movies = await Movie.find();
        res.status(200).json(movies);
    } catch (error) {
        console.error("Error retrieving all movies:", error);
        res.status(500).json({ error: "Failed to retrieve movies." });
    }
};

/** * Retrieves a single movie by its title from the URL parameter.
 * @type {import("express").RequestHandler} 
 */
export const getMovieByTitle = async (req, res) => {
    try {
        const { title } = req.params; 
        
        // --- FIX: Change from strict exact match to a robust search ---
        // Searches for the title anywhere in the database entry, case-insensitive.
        const movie = await Movie.findOne({ 
            title: { $regex: new RegExp(title, 'i') } 
        });
        // --- END FIX ---

        if (!movie) {
            // Returns the specific 404 error if the movie is not found in the DB
            return res.status(404).json({ error: "Movie not found in database." });
        }

        return res.status(200).json(movie);
    } catch (error) {
        console.error("Error fetching movie by title:", error);
        return res.status(500).json({ error: "Failed to fetch movie details." });
    }
};


/** * Filters movies based on category and tags provided in the URL parameters.
 * @type {import("express").RequestHandler} 
 */
export const filterMovies = async (req, res) => {
  try {
    const { category, tags } = req.params;

    // Parse tags: split by comma and trim whitespace
    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // Build query: match movies with the exact category OR any of the given tags
    const query = {
      $and: [
        category !== "*" ? { category } : null,
        tagArray.length > 0 ? { tags: { $in: tagArray } } : null,
      ].filter(Boolean), // remove null values
    };

    // If query.$and is empty (e.g., /movies/*/*), return all movies
    if (query.$and.length === 0) {
      const movies = await Movie.find();
      return res.status(200).json(movies);
    }

    const movies = await Movie.find(query);
    res.status(200).json(movies);
  } catch (error) {
    console.error("Error filtering movies:", error);
    res.status(500).json({ error: error.message });
  }
};