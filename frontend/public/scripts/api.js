import { BACKEND_URL } from "./config.js";
import { getAuthToken } from "./auth.js";

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
}

export async function deleteReview(reviewId) {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Authentication token not found.");
    }

    // 🎯 FIX: Declare 'response' with 'let' here so it's accessible outside the try block
    let response; 
    
    try {
        response = await fetch(`${BACKEND_URL}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
    } catch (error) {
        // Handle network errors (e.g., server offline, timeout)
        throw new Error(`Network error while deleting review: ${error.message}`);
    }
    
    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || `Failed to delete review. Status: ${response.status}`;
        
        if (errorMessage.includes("Token expired")) {
            console.warn("Token expired. User must re-authenticate.");
            throw new Error("Session expired. Please log in again to delete reviews.");
        }
        
        throw new Error(errorMessage);
    }

    return response.json();
}