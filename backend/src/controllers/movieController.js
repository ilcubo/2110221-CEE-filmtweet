import Movie from "../models/movieModel.js";

/** @type {import("express").RequestHandler} */
export const getMovies = async (req, res) => {
    console.log("getMovies() was ran");
    const movie = await Movie.find();
    res.status(200).json(movie);
};

/** @type {import("express").RequestHandler} */
export const filterMovies = async (req, res) => {
  try {
    const { category, tags } = req.params;

    // Parse tags: split by comma and trim whitespace
    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // Build query: match movies with the exact category OR any of the given tags
    // This allows filtering by:
    //   - any tags in a category: /movies/action/sci-fi,drama
    //   - any category with given tags: /movies/*/sci-fi,drama
    //   - a specific category: /movies/action/*
    const query = {
      $and: [
        category !== "*" ? { category } : null,
        tagArray.length > 0 ? { tags: { $in: tagArray } } : null,
      ].filter(Boolean), // remove null values
    };

    // If query.$or is empty, return all movies
    if (query.$and.length === 0) {
      const movies = await Movie.find();
      return res.status(200).json(movies);
    }

    const movies = await Movie.find(query);
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};