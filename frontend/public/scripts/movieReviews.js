import { getMovieReviews } from "./api.js";

//Load all reviews on page load
export async function getAllReviews(resultsContainer) {
  resultsContainer.innerHTML = `<div class="message">Loading latest reviews...</div>`;
  try {
    const reviews = await getMovieReviews(); // backend returns all reviews
    if (!reviews || reviews.length === 0) {
      resultsContainer.innerHTML = '<div class="message">No reviews yet</div>';
      return;
    }

    renderReviews(reviews, resultsContainer);
  } catch (error) {
    console.error(error);
    resultsContainer.innerHTML = '<div class="message error">Failed to load reviews</div>';
  }
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

  container.innerHTML = `
    <div class="movie-card">
      <h2>${movie.title}</h2>
      <div class="movie-category">${movie.category}</div>
      ${tagsHTML}
      <div class="movie-rating">Rating: ${movie.rating.toFixed(1)}/5</div>
    </div>
  `;
}

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
  const rating = reviewRating ? parseFloat(reviewRating.value) : NaN;
  const reviewContent = reviewText?.value || '';

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



