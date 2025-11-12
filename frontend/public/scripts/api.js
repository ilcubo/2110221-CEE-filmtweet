import { BACKEND_URL } from "./config.js";

export async function getItems() {
  const items = await fetch(`${BACKEND_URL}/items`).then((r) => r.json());
  return items;
}

export async function getMovieReviews({ title = '', category = 'all', tags = [] }) {
  const params = new URLSearchParams();
  if (title) params.set('title', title.trim());
  if (category && category !== 'all') params.set('category', category);
  if (tags && tags.length > 0) params.set('tags', tags.join(','));

  try {
    const response = await fetch(`${BACKEND_URL}/reviews?${params.toString()}`);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const data = await response.json();

    // sort by most recent if your review object has `createdAt`
    return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
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