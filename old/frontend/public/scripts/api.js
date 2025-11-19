import { BACKEND_URL } from "./config.js";

export async function getItems() {
  const items = await fetch(`${BACKEND_URL}/items`).then((r) => r.json());
  return items;
}

// mock dataset for movie reviews
export async function getMovieReviews(options = {}) {
  const { title = '', category = 'all', tags = [] } = options;

  try {
    //new real backend
    const urlParams = new URLSearchParams();
    if (title) urlParams.set('title', title.trim());
    if (category && category !== 'all') urlParams.set('category', category.trim());
    if (tags.length > 0) urlParams.set('tags', tags.join(','));
    
    const response = await fetch(`${BACKEND_URL}/reviews?${urlParams.toString()}`);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    return await response.json(); // backend handles sorting/rating
    
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
  }
}

export async function getMovieInfo(title = '') {
  if (!title) return null;
  try {
    const response = await fetch(`${BACKEND_URL}/movies/${encodeURIComponent(title)}`);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch movie info:', error);
    return null;
  }
}

// Create a new item/tag and send to backend
export async function createItem(payload) {
  try {
    const response = await fetch(`${BACKEND_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to create item");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating item:", error);
    throw error;
  }
}