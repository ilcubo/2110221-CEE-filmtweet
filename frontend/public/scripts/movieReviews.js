import { getMovieReviews, getMovieInfo, deleteReviewAPI, updateReview } from "./api.js";
import { getAuthToken, getUsername } from "./auth.js";
import { BACKEND_URL } from "./config.js";

// ตัวแปรเก็บสถานะว่ากำลังแก้ไขรีวิวไหนอยู่ (null = โหมดสร้างใหม่)
let editingReviewId = null;

// Load all reviews
export async function getAllReviews(resultsContainer) {
    try {
        const reviews = await getMovieReviews({});
        renderReviews(reviews, resultsContainer, "All Reviews");
    } catch (error) {
        console.error('Failed to load reviews:', error);
        resultsContainer.innerHTML = '<div class="message error">Failed to load reviews.</div>';
    }
}

// Render Movie Info
export function renderMovieInfos(movie, container) {
  if (!movie) { container.innerHTML = ''; return; }
  const tagsHTML = movie.tags?.length ? `<div class="movie-tags">${movie.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';
  container.innerHTML = `
    <div class="movie-card">
      <h2>${movie.title}</h2>
      <div class="movie-category">${movie.category}</div>
      ${tagsHTML}
      <div class="movie-rating">Rating: ${movie.rating !== undefined && movie.rating !== null ? movie.rating.toFixed(1) : 'N/A'}/5</div>
    </div>`;
}

// Render Reviews (เพิ่มปุ่ม Edit/Delete)
export function renderReviews(reviews, container, titleFallback) {
  if (!reviews || reviews.length === 0) {
    container.innerHTML = '<div class="message">No reviews found</div>';
    return;
  }

  const currentUsername = getUsername();

  container.innerHTML = '';

  reviews.forEach(r => {
    const isOwner = currentUsername && r.username === currentUsername;
    
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-header">
        <h3>${r.title || r.movie || titleFallback} <span style="font-size:0.8em; color:#666;">by ${r.username}</span></h3>
        ${r.rating ? `<div class="rating">⭐ ${r.rating}/5</div>` : ''}
      </div>
      ${r.review ? `<p>${r.review}</p>` : ''}
      
      ${isOwner ? `
        <div class="review-actions" style="margin-top: 10px; text-align: right;">
            <button class="btn-edit" style="margin-right:5px; cursor:pointer;">Edit</button>
            <button class="btn-delete" style="cursor:pointer; color:red;">Delete</button>
        </div>
      ` : ''}
    `;

    if (isOwner) {
        const btnDelete = card.querySelector('.btn-delete');
        const btnEdit = card.querySelector('.btn-edit');

        btnDelete.addEventListener('click', async () => {
            if (confirm("Are you sure you want to delete this review?")) {
                try {
                    await deleteReviewAPI(r._id);
                    card.remove();
                    alert("Deleted successfully");
                } catch (e) {
                    alert(e.message);
                }
            }
        });

        btnEdit.addEventListener('click', () => {
            startEditing(r);
        });
    }

    container.appendChild(card);
  });
}

// ---------------------------------------------------------
// 🛠️ จุดที่ต้องแก้ 1: ฟังก์ชัน startEditing
// ---------------------------------------------------------
function startEditing(review) {
    const titleInput = document.getElementById("review-movie-title");
    const ratingInput = document.getElementById("review-rating");
    const textInput = document.getElementById("review-text");
    const submitBtn = document.getElementById("submit-review");

    // 1. ใส่ข้อมูลเดิม
    if(titleInput) {
        titleInput.value = review.title; 
        titleInput.disabled = true;
    }
    if(ratingInput) ratingInput.value = review.rating;
    if(textInput) textInput.value = review.review;

    // 2. เปลี่ยนปุ่มเป็นโหมด Update (แค่เปลี่ยนหน้าตา ไม่ต้องแก้ onclick)
    if(submitBtn) {
        submitBtn.textContent = "Update Review";
        submitBtn.style.backgroundColor = "#4CAF50"; // เปลี่ยนสีให้รู้ว่ากำลังแก้
    }

    // 3. จำ ID ที่กำลังแก้
    editingReviewId = review._id;
    
    // เลื่อนหน้าจอไปหาฟอร์ม
    document.querySelector('.review-container')?.scrollIntoView({ behavior: 'smooth' });
}

// ---------------------------------------------------------
// 🛠️ ฟังก์ชันใหม่: resetFormState (สำหรับยกเลิกโหมดแก้ไข)
// ---------------------------------------------------------
function resetFormState(submitButton, titleInput) {
    editingReviewId = null; // กลับสู่โหมดสร้างใหม่
    
    if(submitButton) {
        submitButton.textContent = "Post";
        submitButton.disabled = false;
        submitButton.style.backgroundColor = ""; // คืนสีเดิม
    }
    if(titleInput) {
        titleInput.value = "";
        titleInput.disabled = false; // ปลดล็อกชื่อหนัง
    }
    document.getElementById("review-rating").value = "";
    document.getElementById("review-text").value = "";
}

// ---------------------------------------------------------
// 🛠️ จุดที่ต้องแก้ 2: submitReview (รวม Logic Create + Update)
// ---------------------------------------------------------
export async function submitReview(reviewMovieTitle, reviewRating, reviewText, submitButton, searchCallback) {
    const movieTitle = reviewMovieTitle?.value?.trim();
    const ratingValue = parseFloat(reviewRating?.value);
    const reviewContent = reviewText?.value || '';

    if (!movieTitle || !Number.isFinite(ratingValue)) {
        alert("Please fill movie title and rating.");
        return;
    }

    submitButton.disabled = true;
    
    try {
        const token = getAuthToken();
        if (!token) {
            alert("Please login first.");
            resetFormState(submitButton, reviewMovieTitle);
            return;
        }

        // เช็คตัวแปรนี้เพื่อตัดสินใจว่าจะ สร้าง หรือ แก้ไข
        if (editingReviewId) {
            // --- UPDATE MODE ---
            await updateReview(editingReviewId, {
                comment: reviewContent,
                rating: ratingValue
            });
            alert("Review updated successfully!");
        } else {
            // --- CREATE MODE ---
            const response = await fetch(`${BACKEND_URL}/reviews`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    movie: movieTitle, 
                    comment: reviewContent, 
                    rating: ratingValue 
                })
            });

            if (response.status === 401) {  // 👈 เช็คว่า Token หมดอายุไหม
                localStorage.removeItem("authToken"); // ลบ Token
                localStorage.removeItem("username");  // ลบชื่อ
                
                alert("Session expired. Please login again."); // แจ้งเตือน
                
                window.location.reload(); // รีเฟรชหน้าจอ
                return; // จบการทำงานทันที ไม่ทำบรรทัดล่างต่อไป
            }

            if(response.status === 409) throw new Error("You already reviewed this movie.");
            
            if(!response.ok) {
                // อ่านข้อความ Error จริงๆ จาก Server
                const errorData = await response.json(); 
                throw new Error(errorData.error || "Failed to post review.");
            }
            
            alert("Review posted successfully!");
        }

        // รีเซ็ตฟอร์มกลับเป็นค่าเริ่มต้น
        resetFormState(submitButton, reviewMovieTitle);
        
        // โหลดข้อมูลใหม่
        if (searchCallback) searchCallback();

    } catch (error) {
        alert(error.message);
        submitButton.disabled = false;
    }
}

export async function loadMyReviews(resultsContainer) {
  const username = getUsername();
  if (!username) return;

  try {
    // 1. ดึงรีวิวของฉัน
    const reviews = await getMovieReviews({ username }); 
    
    // 2. แสดงผลรีวิว
    renderReviews(reviews, resultsContainer, "My Reviews");
    
    // 3. สร้างข้อความแจ้งเตือน + ปุ่ม "Show All" แบบ Dynamic
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.style.color = '#4CAF50';
    messageDiv.style.marginBottom = '10px';
    messageDiv.innerHTML = `Showing reviews by <strong>${username}</strong> `;

    // สร้างปุ่ม (Show All)
    const showAllBtn = document.createElement('button');
    showAllBtn.textContent = '(Show All Reviews)';
    showAllBtn.style.marginLeft = '10px';
    showAllBtn.style.cursor = 'pointer';
    showAllBtn.style.textDecoration = 'underline';
    showAllBtn.style.border = 'none';
    showAllBtn.style.background = 'none';
    showAllBtn.style.color = '#666';
    showAllBtn.style.fontSize = '0.9em';

    // ⭐ ใส่ Event Listener: เมื่อกดแล้วให้โหลดรีวิวทั้งหมดกลับมา
    showAllBtn.addEventListener('click', () => {
        getAllReviews(resultsContainer); // เรียกฟังก์ชันเดิมเพื่อกลับสู่หน้าปกติ
    });

    // แปะปุ่มลงในข้อความ และแปะข้อความลงบนสุดของ Container
    messageDiv.appendChild(showAllBtn);
    resultsContainer.insertBefore(messageDiv, resultsContainer.firstChild);

  } catch (error) {
    console.error('Failed to load my reviews:', error);
    resultsContainer.innerHTML = '<div class="message error">Failed to load your reviews.</div>';
  }
}


// ฟังก์ชันอื่นๆ คงเดิม
export async function handleSearch(searchInput, categorySelect, selectedTagsSet, resultsContainer, movieDataset, infoContainer) {
  const title = searchInput?.value?.trim() || '';
  const category = categorySelect?.value || 'all';
  const tags = Array.from(selectedTagsSet);

  try {
    let movie = null;
    if (title) movie = await getMovieInfo(title);
    if (infoContainer) renderMovieInfos(movie, infoContainer);

    const reviews = await getMovieReviews({ title, category, tags });
    renderReviews(reviews, resultsContainer, title);
  } catch (error) {
    console.error('Search failed:', error);
    resultsContainer.innerHTML = '<div class="message error">Failed to fetch reviews</div>';
  }
}

export function filterMovies(title, category, selectedTagsSet, movieDataset) { return []; }
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