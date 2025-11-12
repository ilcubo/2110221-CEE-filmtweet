import { getMovieReviews } from "./api.js";

// Display movie reviews
export function renderReviews(reviews, container, titleFallback) {
  if (!reviews || reviews.length === 0) {
    container.innerHTML = '<div class="message">No reviews found</div>';
    return;
  }

  container.innerHTML = reviews.map(r => `
    <div class="review-card">
      <h3>${r.title || titleFallback}</h3>
      ${r.rating ? `<div class="rating">Rating: ${r.rating}/10</div>` : ''}
      ${r.text ? `<p>${r.text}</p>` : ''}
    </div>
  `).join('');
}

// Fetch and display search results
export async function handleSearch(searchInput, categorySelect, selectedTagsSet, resultsContainer) {
  const title = searchInput?.value?.trim();
  const category = categorySelect?.value || 'all';
  const tags = Array.from(selectedTagsSet);

  const searchInfo = [];
  if (title) searchInfo.push(`"${title}"`);
  if (category !== 'all') searchInfo.push(`in ${category}`);
  if (tags.length) searchInfo.push(`with tags: ${tags.join(', ')}`);

  resultsContainer.innerHTML = `<div class="message">Searching ${searchInfo.join(' ')}...</div>`;

  try {
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
  const rating = reviewRating ? parseFloat(reviewRating.value) : NaN;
  const reviewContent = reviewText?.value?.trim();

  if (!movieTitle || !reviewContent || !Number.isFinite(rating) || rating <= 0) {
    alert("Please fill in all fields and provide a valid rating");
    return;
  }

  const originalButtonText = submitButton?.textContent || 'Post';
  submitButton.disabled = true;
  submitButton.textContent = 'Posting...';

  // Ensure button resets even if fetch hangs
  const resetButton = () => {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch('http://localhost:8000/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieTitle, rating, review: reviewContent }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 409) {
      const info = document.createElement('div');
      info.textContent = 'You already submitted this review.';
      info.className = 'review-info';
      submitButton?.parentElement?.appendChild(info);
      setTimeout(() => info.remove(), 3000);
      return;
    }

    if (response.ok) {
      const successMessage = document.createElement('div');
      successMessage.textContent = 'Review submitted successfully!';
      successMessage.className = 'review-success';
      submitButton?.parentElement?.appendChild(successMessage);

      reviewMovieTitle.value = '';
      reviewRating.value = '';
      reviewText.value = '';

      setTimeout(() => successMessage.remove(), 3000);
      if (searchCallback) searchCallback();
    } else {
      const data = await response.json();
      throw new Error(data?.error || 'Failed to submit review');
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    alert(error.message || 'Failed to submit review. Please try again.');
  } finally {
    // Always reset button after 1 second (or immediately if request completes)
    setTimeout(resetButton, 1000);
  }
}

