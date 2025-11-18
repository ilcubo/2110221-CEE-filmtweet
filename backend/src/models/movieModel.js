import mongoose from "mongoose";

// Movie schema matching stored documents like:
// {
//   "_id": { "$oid": "6916c969d40501aac898670a" },
//   "title": "Interstellar",
//   "categories": ["movies","sci-fi","action"],
//   "rating": 4.2
// }

const { Schema, model } = mongoose;

const movieSchema = new Schema(
	{
		title: { type: String, required: true, trim: true },
		category: {type: String, required: true},
		tags: { type: [String], default: [] },
		// rating expected to be a numeric value (e.g. 4.2). Constrain to 0-5.
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

// Optional: index title for faster lookups
movieSchema.index({ title: 1 });

const Movie = model("Movie", movieSchema);

export default Movie;

