import { selectedTags, initTagSelect } from "./categories.js";
import { handleSearch, submitReview, getAllReviews, attachAutocomplete} from "./movieReviews.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadMovieDataset();
  
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

  attachAutocomplete(searchInput, document.getElementById("search-autocomplete"), MOVIE_DATASET);
  attachAutocomplete(reviewMovieTitle, document.getElementById("review-autocomplete"), MOVIE_DATASET);
  
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
  getAllReviews(resultsContainer); 
});

export let MOVIE_DATASET = [];
async function loadMovieDataset() {
  try {
    const res = await fetch("./movie.json");   // path ไปหาไฟล์ JSON ของเธอ
    MOVIE_DATASET = await res.json();
  } catch (e) {
    console.error("Unable to load dataset:", e);
    MOVIE_DATASET = [];
  }
}