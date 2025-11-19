import Movie from "../models/movieModel.js";

/** @type {import("express").RequestHandler} */
export const getMovies = async (req, res) => {
    console.log("getMovies() was ran");
    try {
        const movie = await Movie.find();
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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

/** @type {import("express").RequestHandler} */
// ****************************************************
// 3. CREATE MOVIE (Protected Route)
// ****************************************************
export const createMovie = async (req, res) => {
    try {
        // req.user ได้มาจาก protect Middleware
        if (!req.user) {
            return res.status(401).json({ status: "fail", message: "Unauthorized access." });
        }
        
        // สร้าง Object หนังใหม่
        // ในการใช้งานจริง, req.body ควรมีข้อมูลหนังที่ต้องการสร้าง
        const newMovie = await Movie.create({
            ...req.body,
            createdBy: req.user._id, // บันทึก ID ผู้ใช้เป็นผู้สร้าง
        });

        res.status(201).json({
            status: "success",
            message: "Movie created successfully (Protected).",
            createdBy: req.user.username,
            data: { movie: newMovie },
        });

    } catch (error) {
        // จัดการ Error เช่น Mongoose Validation Error
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};