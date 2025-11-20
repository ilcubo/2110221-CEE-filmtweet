import { BACKEND_URL } from "./config.js";

export async function getItems() {
  const items = await fetch(`${BACKEND_URL}/items`).then((r) => r.json());
  return items;
}

export async function getMovieReviews(filters = {}) {
    const params = new URLSearchParams(filters);
    const url = `${BACKEND_URL}/reviews?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok && response.status !== 304) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
            const data = await response.json();
            errorMsg = data.error || errorMsg;
        } catch (e) {
        }
        throw new Error(errorMsg);
    }
    
    if (response.status === 304) {
        return []; 
    }

    try {
        return response.json();
    } catch (e) {
        console.error("JSON parsing failed, response content might be empty or invalid:", e);
        throw new Error("Received invalid data from server.");
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
} // <--- ✅ เติม } ตรงนี้เพื่อปิดฟังก์ชัน createItem ครับ

// Helper เพื่อดึง Token
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return token ? { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
    } : { "Content-Type": "application/json" };
}

export async function updateReview(reviewId, payload) {
    const response = await fetch(`${BACKEND_URL}/reviews/${reviewId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload), // { comment: "...", rating: 5 }
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update review");
    }
    return await response.json();
}

export async function deleteReviewAPI(reviewId) { // ตั้งชื่อไม่ให้ซ้ำกับ controller
    const response = await fetch(`${BACKEND_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete review");
    }
    return await response.json();
}