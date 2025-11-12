import { selectedTags, initTagSelect } from "./categories.js";
import { handleSearch, submitReview } from "./movieReviews.js";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("movie-search-input");
  const searchButton = document.getElementById("movie-search-button");
  const resultsContainer = document.getElementById("movie-reviews");
  const categorySelect = document.getElementById("movie-category");
  const tagSelect = document.getElementById("movie-tags");
  const selectedTagsContainer = document.getElementById("selected-tags");

  const reviewMovieTitle = document.getElementById("review-movie-title");
  const reviewRating = document.getElementById("review-rating");
  const reviewText = document.getElementById("review-text");
  const submitReviewButton = document.getElementById("submit-review");

  // Initialize tag selection
  initTagSelect(tagSelect, selectedTagsContainer, () => {
    handleSearch(searchInput, categorySelect, selectedTags, resultsContainer);
  });

  // Search events
  searchButton?.addEventListener("click", () => {
    handleSearch(searchInput, categorySelect, selectedTags, resultsContainer);
  });
  searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch(searchInput, categorySelect, selectedTags, resultsContainer);
  });

  // Review submission
  submitReviewButton?.addEventListener("click", () => {
    submitReview(reviewMovieTitle, reviewRating, reviewText, submitReviewButton, () => {
      handleSearch(searchInput, categorySelect, selectedTags, resultsContainer);
    });
  });

  // Load default reviews on page load
  handleSearch(searchInput, categorySelect, selectedTags, resultsContainer);
});
