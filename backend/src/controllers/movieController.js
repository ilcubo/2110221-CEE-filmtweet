import Movie from "../models/movieModel.js";

/** @type {import("express").RequestHandler} */
export const getMovies = async (req, res) => {
    console.log("getMovies() was ran");
    const movie = await Movie.find();
    res.status(200).json(movie);
};