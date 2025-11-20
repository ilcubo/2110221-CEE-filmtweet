import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  // 🛠️ แก้จาก movie เป็น title
  title: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: false,
    default: ""
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
}, {
  timestamps: false, 
  versionKey: false
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;