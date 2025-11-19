import { getMovieReviews, getMovieInfo, deleteReview } from "./api.js"; // <-- FIX: Added deleteReview
import { BACKEND_URL } from "./config.js";
import { getAuthToken, getUsername } from "./auth.js";
// Load all reviews on page load

export async function getAllReviews(resultsContainer) {
    try {
        const reviews = await getMovieReviews({});
        // Assuming renderReviews is correctly defined to display the results:
        renderReviews(reviews, resultsContainer, "All Reviews");
    } catch (error) {
        console.error('Failed to load all reviews:', error);
        resultsContainer.innerHTML = '<div class="message error">Failed to load initial reviews.</div>';
    }
}

function ratingToStars(rating, maxStars = 5) {
  if (rating == null || rating <= 0) return '-';
  const scaledRating = Math.round(rating / (10 / maxStars));
  return scaledRating > 0 ? '⭐'.repeat(scaledRating) : '-';
}

// Display movie info
export function renderMovieInfos(movie, container) {
  if (!movie) {
    container.innerHTML = '';
    return;
  }

  const tagsHTML = movie.tags && movie.tags.length
    ? `<div class="movie-tags">${movie.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
    : '';

  const ratingValue = movie.rating != null ? movie.rating : 0;
  const stars = ratingToStars(ratingValue); // 0–5

  container.innerHTML = `
    <div class="movie-card">
      <h2>${movie.title}</h2>
      <div class="movie-category">${movie.category}</div>
      ${tagsHTML}
      <div class="movie-rating">Rating: ${stars}</div>
    </div>
  `;
}

// Display movie reviews
export function renderReviews(reviews, container, titleFallback) {
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<div class="message">No reviews found</div>';
        return;
    }

    const currentUsername = getUsername(); // logged-in username

    container.innerHTML = reviews.map(r => {
        const isOwner = currentUsername && r.username === currentUsername;
        const deleteButton = isOwner 
            ? `<button class="delete-review-btn" data-review-id="${r.id}" data-movie-title="${r.title}">Delete</button>` 
            : '';

        return `
            <div class="review-card" id="review-${r.id}">
                <h3>${r.title || titleFallback}</h3>
                ${r.username ? `<div class="review-username">By: ${r.username}</div>` : ''}
                <div class="rating">Rating: ${ratingToStars(r.rating)}</div>
                ${r.review ? `<p>${r.review}</p>` : ''}
                <div class="review-actions">${deleteButton}</div>
            </div>
        `;
    }).join('');

    // Attach event listeners to delete buttons
    container.querySelectorAll('.delete-review-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const reviewId = e.target.getAttribute('data-review-id');
            const movieTitle = e.target.getAttribute('data-movie-title');
            handleDeleteReview(reviewId, movieTitle, e.target);
        });
    });
}


// Filter MOVIE_DATASET by priority: name → type → tags
export function filterMovies(title, category, selectedTagsSet, movieDataset) {
  if (title) {
    const matchedByName = movieDataset.filter(movie =>
      movie.title.toLowerCase().includes(title.toLowerCase())
    );
    if (matchedByName.length) return matchedByName;
  }

  return movieDataset.filter(movie => {
    const matchesCategory = category && category !== 'all' ? movie.category.toLowerCase() === category.toLowerCase() : true;
    const matchesTags = selectedTagsSet.size
      ? Array.from(selectedTagsSet).every(tag => movie.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()))
      : true;
    return matchesCategory && matchesTags;
  });
}

// Fetch and display search results
export async function handleSearch(searchInput, categorySelect, selectedTagsSet, resultsContainer, movieDataset, infoContainer) {
  const title = searchInput?.value?.trim() || '';
  const category = categorySelect?.value || 'all';
  const tags = Array.from(selectedTagsSet);

  const searchInfo = [];
  if (title) searchInfo.push(`"${title}"`);
  if (category !== 'all') searchInfo.push(`in ${category}`);
  if (tags.length) searchInfo.push(`with tags: ${tags.join(', ')}`);
  resultsContainer.innerHTML = `<div class="message">Searching ${searchInfo.join(' ')}...</div>`;

  try {
    // Fetch movie info (for title-specific search)
    let movie = null;
    if (title) movie = await getMovieInfo(title);
    if (infoContainer) renderMovieInfos(movie, infoContainer);

    // Fetch reviews
    const reviews = await getMovieReviews({ title, category, tags });
    renderReviews(reviews, resultsContainer, title);
  } catch (error) {
    console.error('Search failed:', error);
    resultsContainer.innerHTML = '<div class="message error">Failed to fetch reviews</div>';
  }
}

// Submit user review
export async function submitReview(reviewMovieTitle, reviewRating, reviewText, submitButton, searchCallback) {
  const movieTitle = reviewMovieTitle?.value?.trim();
  const ratingValue = parseFloat(reviewRating?.value);
  const reviewContent = reviewText?.value || '';

  // --- 1. Frontend Validation ---
  // NOTE: Replaced alert() with console.error and simple UI feedback as per instructions.
  if (!movieTitle || !reviewContent || 
      !Number.isFinite(ratingValue) || 
      ratingValue < 0 || ratingValue > 5) 
  {
    console.error("Validation failed: Please fill in all fields (Movie, Review, Rating) and provide a rating between 0 and 5.");
    // Provide visual feedback instead of alert()
    const errorDiv = document.createElement('div');
    errorDiv.textContent = "Please fill in all fields and provide a rating between 0 and 5.";
    errorDiv.className = 'review-error-message';
    submitButton?.parentElement?.insertBefore(errorDiv, submitButton.nextSibling);
    setTimeout(() => errorDiv.remove(), 4000);
    return;
  }
  const rating = ratingValue; // Use the validated number

  const originalButtonText = submitButton?.textContent || 'Post';
  submitButton.disabled = true;
  submitButton.textContent = 'Posting...';

  // Ensure button resets even if fetch hangs
  const resetButton = () => {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
};

  try {
        const token = getAuthToken(); // 1. Get the token

        if (!token) {
            console.error("Authentication required to submit review.");
            // Use the local resetButton function
            resetButton(); 
            return; 
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // 2. Send Request
        const response = await fetch(`${BACKEND_URL}/reviews`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                title: movieTitle, 
                review: reviewContent, 
                rating: rating 
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // --- 3. Server Response Handling (RESTORED LOGIC) ---
        if (response.status === 409) {
            // Handle Duplicate Review (409 Conflict)
            const info = document.createElement('div');
            info.textContent = 'You have already reviewed this movie.';
            info.className = 'review-info';
            submitButton?.parentElement?.appendChild(info);
            setTimeout(() => info.remove(), 3000);
            return;
        }

        if (response.ok) {
            // Handle SUCCESS (200/201)
            const successMessage = document.createElement('div');
            successMessage.textContent = 'Review submitted successfully!';
            successMessage.className = 'review-success';
            submitButton?.parentElement?.appendChild(successMessage);

            // Clear form fields
            reviewMovieTitle.value = '';
            reviewRating.value = '';
            reviewText.value = '';

            setTimeout(() => successMessage.remove(), 3000);
            if (searchCallback) searchCallback();
        } else {
            // Handle Server Errors (400, 500)
            resetButton();
            const data = await response.json();
            // Throw the error so the outer catch block can handle the alert
            throw new Error(data?.error || `Failed to submit review. Server returned status ${response.status}`);
        }
        } catch (error) {
    console.error('Error submitting review:', error);
    // Provide visual feedback instead of alert()
    const errorDiv = document.createElement('div');
    errorDiv.textContent = error.message || 'Failed to submit review. Please try again.';
    errorDiv.className = 'review-error-message';
    submitButton?.parentElement?.insertBefore(errorDiv, submitButton.nextSibling);
    setTimeout(() => errorDiv.remove(), 4000);
  } finally {
    // Always reset button after 1 second (or immediately if request completes)
    setTimeout(resetButton, 1000);
  }
}

export function attachAutocomplete(inputEl, listEl, movieDataset) {
  inputEl.addEventListener('input', () => {
    const value = inputEl.value.trim().toLowerCase();
    listEl.innerHTML = '';
    if (!value) return;
    
    const matches = movieDataset.filter(m => m.title.toLowerCase().includes(value));
    matches.slice(0, 5).forEach(m => {
      const item = document.createElement('div');
      item.textContent = m.title;
      item.className = 'autocomplete-item';
      item.onclick = () => { inputEl.value = m.title; listEl.innerHTML = ''; };
      listEl.appendChild(item);
    });
  });
}

async function handleDeleteReview(reviewId, title, deleteButtonElement) { 
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
        await deleteReview(reviewId);

        // 🎯 FIX: Remove the review card from the DOM immediately upon success
        // Find the ancestor with the class 'review-card' and remove it
        const reviewCard = document.getElementById(`review-${reviewId}`);
        if (reviewCard) {
            reviewCard.remove();
        }

        // Display success message
        document.querySelector('.review-success-message')?.remove(); 
        const successMessage = document.createElement('div');
        successMessage.textContent = 'Review deleted successfully!';
        successMessage.className = 'review-success-message';
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);

    } catch (error) {
        console.error('Failed to delete review:', error);
        alert(`Failed to delete review: ${error.message}`);
    }
}