import { BACKEND_URL } from "./config.js";

export async function getItems() {
  const items = await fetch(`${BACKEND_URL}/items`).then((r) => r.json());
  return items;
}

// mock dataset for movie reviews
export async function getMovieReviews(options = {}) {
  const { title = '', category = 'all', tags = [] } = options;

  try {
    // ---- MOCK DATA START ----
    const response = await fetch("./mock_reviews.json"); // fetch from mock file
    if (!response.ok) throw new Error(`Failed to load mock data`);
    const mockData = await response.json();

    let filtered = mockData;
    if (title) {
      const lowerTitle = title.toLowerCase();
      const matchedByTitle = filtered.filter(m => m.title.toLowerCase().includes(lowerTitle));
      if (matchedByTitle.length) return matchedByTitle; // <-- title priority
    }
    if (category && category !== 'all') {
      const lowerCategory = category.toLowerCase();
      filtered = filtered.filter(m => m.category.toLowerCase() === lowerCategory);
    }
    if (tags.length > 0) {
      const lowerTags = tags.map(t => t.toLowerCase());
      filtered = filtered.filter(m => 
        lowerTags.every(t => m.tags.map(mt => mt.toLowerCase()).includes(t))
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    // ---- MOCK DATA END ----

    /* ---- REAL BACKEND START ----
    const urlParams = new URLSearchParams();
    if (title) urlParams.set('title', title.trim().toLowerCase()); // lowercase for consistency
    if (category && category !== 'all') urlParams.set('category', category.trim().toLowerCase());
    if (tags.length > 0) urlParams.set('tags', tags.map(t => t.toLowerCase()).join(','));

    try {
      const response = await fetch(`${BACKEND_URL}/reviews?${urlParams.toString()}`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const data = await response.json();
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    ---- REAL BACKEND END ---- */

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