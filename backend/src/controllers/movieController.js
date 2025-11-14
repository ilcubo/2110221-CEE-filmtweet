import Movie from "../models/movieModel.js";

const getMovies = async (req, res) => {
    const movie = await Movie.find();
    res.status(200).json(items);
};