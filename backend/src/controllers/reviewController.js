import Review from "../models/reviewModel.js";
import Movie from "../models/movieModel.js";

/** @type {import("express").RequestHandler} */
export const getReviews = async (req, res) => {
    try {
        // รับค่า title มาจาก Frontend (ซึ่ง user พิมพ์ชื่อหนัง)
        const { title, category, tags, username } = req.query;

        const pipeline = [];
        const matchStage = {};
        
        // 🛠️ แก้: กรองที่ field 'title' (ใน Review)
        if (title) {
            matchStage.title = { $regex: new RegExp(title, 'i') };
        }
        if (username) {
            matchStage.username = username;
        }

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // 🛠️ แก้: Join ด้วย field 'title'
        pipeline.push({
            $lookup: {
                from: "movies",
                localField: "title",     // ใน Review ชื่อ field title
                foreignField: "title",   // ใน Movie ชื่อ field title
                as: "movieDetails"
            }
        });

        pipeline.push({ 
            $unwind: { 
                path: "$movieDetails", 
                preserveNullAndEmptyArrays: true 
            } 
        });

        // กรอง Category
        if (category && category !== 'all' && category !== '*') {
            pipeline.push({ $match: { "movieDetails.category": category } });
        }

        // Logic Tags (เหมือนเดิม แต่ใช้ movieDetails)
        if (tags) {
            const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
            if (tagArray.length > 0) {
                pipeline.push({
                    $addFields: {
                        matchScore: { $size: { $setIntersection: [ { $ifNull: ["$movieDetails.tags", []] }, tagArray ] } }
                    }
                });
                pipeline.push({ $match: { matchScore: { $gt: 0 } } });
                // เรียงตามคะแนน -> แล้วเรียงตามชื่อหนัง (title)
                pipeline.push({ $sort: { matchScore: -1, title: 1 } });
            }
        } else {
            // เนื่องจากเราปิด createdAt แล้ว เราอาจจะเรียงตาม _id (ซึ่งบอกเวลาได้เหมือนกัน) แทน
            pipeline.push({ $sort: { _id: -1 } }); 
        }

        pipeline.push({
            $project: { movieDetails: 0, matchScore: 0 }
        });

        const reviews = await Review.aggregate(pipeline);
        return res.status(200).json(reviews);

    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ error: "Failed to fetch reviews." });
    }
};

/** @type {import("express").RequestHandler} */
export const createReview = async (req, res) => {
    
    try {
        const { movie, comment, rating } = req.body;
        const username = req.user?.username; 

        if (!movie) return res.status(400).json({ error: "Movie title is required." });
        if (!username) return res.status(401).json({ error: "User not authenticated." });
        if (rating === undefined || rating === null) return res.status(400).json({ error: "Rating is required." });
        if (typeof rating !== 'number' || rating < 0 || rating > 5) return res.status(400).json({ error: "Rating must be a number between 0 and 5." });

        //ตรวจสอบว่ามีหนังชื่อนี้ใน Movies Collection จริงไหม
        const movieDoc = await Movie.findOne({ title: movie });
        if (!movieDoc) return res.status(400).json({ error: "Movie not found in database." });

        //ตรวจสอบว่าเคยรีวิวหนัง "title" นี้ไปหรือยัง
        const existingReview = await Review.findOne({ username, title: movie });
        if (existingReview) return res.status(409).json({ error: "You have already reviewed this movie." });

        //สร้างรีวิว
        const review = await Review.create({
            username,
            title: movie, // ✅ บันทึกชื่อหนังลงใน field 'title'
            review: comment || "",
            rating,
        });

        await updateMovieRating(movie); 

        return res.status(201).json({ review });
    } catch (error) {
        // ... (Error handling เดิม)
        console.error("Error creating review:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

/** @type {import("express").RequestHandler} */
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, rating } = req.body;
        const username = req.user?.username;

        const reviewData = await Review.findById(id);
        if (!reviewData) return res.status(404).json({ error: "Review not found." });

        if (reviewData.username !== username) {
            return res.status(403).json({ error: "Not authorized." });
        }

        if (comment !== undefined) reviewData.review = comment;
        if (rating !== undefined) reviewData.rating = rating;
        
        await reviewData.save();

        // 🛠️ ส่ง title ไปคำนวณ
        await updateMovieRating(reviewData.title); 

        res.status(200).json({ message: "Updated", review: reviewData });

    } catch (error) {
        res.status(500).json({ error: "Failed to update." });
    }
};

/** @type {import("express").RequestHandler} */
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const username = req.user?.username;

        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ error: "Review not found." });

        if (review.username !== username) {
            return res.status(403).json({ error: "Not authorized." });
        }

        // 🛠️ เก็บชื่อหนังจาก field 'title'
        const movieTitle = review.title; 
        
        await Review.deleteOne({ _id: id });
        await updateMovieRating(movieTitle);

        res.status(200).json({ message: "Deleted successfully." });

    } catch (error) {
        res.status(500).json({ error: "Failed to delete." });
    }
};

/** @type {import("express").RequestHandler} */
export const recalculateAllRatings = async (req, res) => {
    try {
        console.log("--- Starting Batch Recalculation ---");
        
        // 1. หาชื่อหนังทั้งหมดที่มีรีวิว (ดูจากฟิลด์ title นะครับ)
        const uniqueTitles = await Review.distinct("title");
        console.log(`Found reviews for ${uniqueTitles.length} movies.`);

        // 2. วนลูปสั่งคำนวณใหม่ทีละเรื่อง
        let count = 0;
        for (const title of uniqueTitles) {
            await updateMovieRating(title); // เรียก Helper ตัวเก่งของเรา
            count++;
        }

        console.log("--- Recalculation Finished ---");
        res.status(200).json({ message: `Updated ratings for ${count} movies.` });

    } catch (error) {
        console.error("Recalculation error:", error);
        res.status(500).json({ error: "Failed to recalculate." });
    }
};

// --- Helper Function (วางไว้ล่างสุดของไฟล์) ---
async function updateMovieRating(movieTitle) {
    console.log("--- Debugging Rating Calculation ---");
    console.log("1. Calculating rating for movie:", movieTitle);

    const result = await Review.aggregate([
        // 👇 ต้องเป็น title นะครับ
        { $match: { title: movieTitle } }, 
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);

    console.log("2. Aggregation Result:", JSON.stringify(result));

    const newAvgRating = result.length > 0 ? result[0].avgRating : 0;
    console.log("3. New Average Rating:", newAvgRating);

    const updateResult = await Movie.updateOne(
        { title: movieTitle },
        { rating: Math.round(newAvgRating * 10) / 10 }
    );
    
    console.log("4. Update Result:", updateResult);
    console.log("------------------------------------");
}