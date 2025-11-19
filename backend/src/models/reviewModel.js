import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
    {
        username: { 
            type: String, 
            required: true,
            // 💡 INDEX: Add an index for faster lookups based on username
            index: true 
        },
        title: { 
            type: String, 
            required: true,
            // 💡 INDEX: Add an index for faster lookups when fetching reviews for a movie
            index: true
        },
        review: { 
            type: String, 
            required: false,
            // Setting a default value for 'review' ensures it's always a string, handling `review || ""` cleaner.
            default: ""
        },
        rating: { 
            type: Number, 
            min: 0, 
            max: 5, 
            default: 0 
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                // Correctly handle the transformation for _id
                ret.id = ret._id?.toString() ?? ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
        toObject: {
            transform(doc, ret) {
                ret.id = ret._id?.toString() ?? ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);


reviewSchema.index({ username: 1, title: 1 }, { unique: true });

const Review = model("Review", reviewSchema);

export default Review;