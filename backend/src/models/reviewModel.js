import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
	{
		username: { type: String, required: true },
		movie: { type: String, required: true },
		comment: { type: String, required: false },
		rating: { type: Number, min: 0, max: 5, default: 0 },
	},
	{
		timestamps: true,
		toJSON: {
			// transform output when converting to JSON (e.g. sending over API)
			transform(doc, ret) {
				ret.id = ret._id?.toString?.() ?? ret._id;
				delete ret._id;
				delete ret.__v;
				return ret;
			},
		},
		toObject: {
			transform(doc, ret) {
				ret.id = ret._id?.toString?.() ?? ret._id;
				delete ret._id;
				delete ret.__v;
				return ret;
			},
		},
	}
);

const Review = model("Review", reviewSchema);

export default Review;