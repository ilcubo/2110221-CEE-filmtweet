// ===== Mock Data (based on backend schema) =====
const mockMovies = [
  {
    id: "1",
    title: "Interstellar",
    category: "Sci-Fi",
    tags: ["space", "adventure", "drama"],
    rating: 4.8,
    reviews: [
      {
        id: "r1",
        username: "john_doe",
        movie: "Interstellar",
        comment: "An absolute masterpiece! The cinematography and soundtrack are breathtaking.",
        rating: 5,
      },
      {
        id: "r2",
        username: "jane_smith",
        movie: "Interstellar",
        comment: "Thought-provoking and emotionally powerful. Christopher Nolan at his best.",
        rating: 5,
      },
      {
        id: "r3",
        username: "movie_buff",
        movie: "Interstellar",
        comment: "Long but worth every minute. Best sci-fi film in recent years.",
        rating: 4.5,
      },
    ],
  },
  {
    id: "2",
    title: "The Shawshank Redemption",
    category: "Drama",
    tags: ["drama", "prison", "friendship"],
    rating: 4.9,
    reviews: [
      {
        id: "r4",
        username: "cinema_lover",
        movie: "The Shawshank Redemption",
        comment: "The greatest film ever made. A perfect story of hope and redemption.",
        rating: 5,
      },
      {
        id: "r5",
        username: "timothee",
        movie: "The Shawshank Redemption",
        comment: "Amazing performances by the cast. Highly recommended!",
        rating: 4.8,
      },
    ],
  },
  {
    id: "3",
    title: "Inception",
    category: "Sci-Fi",
    tags: ["dreams", "action", "mystery"],
    rating: 4.7,
    reviews: [
      {
        id: "r6",
        username: "nolan_fan",
        movie: "Inception",
        comment: "Mind-bending and visually stunning. A complex narrative executed perfectly.",
        rating: 5,
      },
      {
        id: "r7",
        username: "casual_viewer",
        movie: "Inception",
        comment: "Great action sequences but a bit confusing at times.",
        rating: 4,
      },
      {
        id: "r8",
        username: "film_critic",
        movie: "Inception",
        comment: "An innovative film that redefines what cinema can achieve.",
        rating: 4.9,
      },
    ],
  },
];

// ===== Accordion Functions =====
export function createAccordion(mainContainer) {
  const accordionContainer = document.createElement("div");
  accordionContainer.className = "accordion-container";

  mockMovies.forEach((movie, index) => {
    const accordionItem = createAccordionItem(movie, index);
    accordionContainer.appendChild(accordionItem);
  });

  mainContainer.appendChild(accordionContainer);
}

function createAccordionItem(movie, index) {
  const item = document.createElement("div");
  item.className = "accordion-item";

  // Accordion header
  const header = document.createElement("button");
  header.className = "accordion-header";

  const headerContent = document.createElement("div");
  headerContent.className = "accordion-header-content";

  const titleRatingDiv = document.createElement("div");
  titleRatingDiv.className = "accordion-title-rating";

  const title = document.createElement("h3");
  title.className = "accordion-title";
  title.textContent = movie.title;

  const rating = document.createElement("span");
  rating.className = "accordion-rating";
  rating.textContent = `★ ${movie.rating}`;

  titleRatingDiv.appendChild(title);
  titleRatingDiv.appendChild(rating);

  const tagsDiv = document.createElement("div");
  tagsDiv.className = "accordion-tags";

  movie.tags.forEach((tag) => {
    const tagSpan = document.createElement("span");
    tagSpan.className = "accordion-tag";
    tagSpan.textContent = tag;
    tagsDiv.appendChild(tagSpan);
  });

  headerContent.appendChild(titleRatingDiv);
  headerContent.appendChild(tagsDiv);

  const chevron = document.createElement("span");
  chevron.className = "accordion-chevron";
  chevron.textContent = "▼";

  header.appendChild(headerContent);
  header.appendChild(chevron);

  // Accordion body
  const body = document.createElement("div");
  body.className = "accordion-body";

  const reviewsList = document.createElement("div");
  reviewsList.className = "accordion-reviews";

  movie.reviews.forEach((review) => {
    const reviewItem = createReviewItem(review);
    reviewsList.appendChild(reviewItem);
  });

  body.appendChild(reviewsList);

  // Toggle functionality
  header.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    // Close all other items
    document
      .querySelectorAll(".accordion-item.active")
      .forEach((activeItem) => {
        if (activeItem !== item) {
          activeItem.classList.remove("active");
        }
      });

    // Toggle current item
    if (isActive) {
      item.classList.remove("active");
    } else {
      item.classList.add("active");
    }
  });

  item.appendChild(header);
  item.appendChild(body);

  return item;
}
export function openAddReviewDialog(movie) {
  const dialog = document.createElement("div");
  dialog.className = "review-dialog";
  
  const overlay = document.createElement("div");
  overlay.className = "review-dialog-overlay";
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      dialog.remove();
    }
  });
  
  const content = document.createElement("div");
  content.className = "review-dialog-content";
  
  // Header
  const header = document.createElement("div");
  header.className = "review-dialog-header";
  const title = document.createElement("h2");
  title.textContent = `Add Review for ${movie.title}`;
  const closeBtn = document.createElement("button");
  closeBtn.className = "review-dialog-close";
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", () => dialog.remove());
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Body
  const body = document.createElement("div");
  body.className = "review-dialog-body";
  
  // Rating field
  const ratingGroup = document.createElement("div");
  ratingGroup.className = "review-form-group";
  const ratingLabel = document.createElement("label");
  ratingLabel.textContent = "Rating:";
  const ratingInput = document.createElement("input");
  ratingInput.type = "number";
  ratingInput.id = "review-rating";
  ratingInput.min = "0";
  ratingInput.max = "5";
  ratingInput.step = "0.5";
  ratingInput.placeholder = "0-5";
  ratingGroup.appendChild(ratingLabel);
  ratingGroup.appendChild(ratingInput);
  
  // Comment field
  const commentGroup = document.createElement("div");
  commentGroup.className = "review-form-group";
  const commentLabel = document.createElement("label");
  commentLabel.textContent = "Comment:";
  const commentInput = document.createElement("textarea");
  commentInput.id = "review-comment";
  commentInput.placeholder = "Share your thoughts about this movie...";
  commentInput.rows = "4";
  commentGroup.appendChild(commentLabel);
  commentGroup.appendChild(commentInput);
  
  body.appendChild(ratingGroup);
  body.appendChild(commentGroup);
  
  // Footer with buttons
  const footer = document.createElement("div");
  footer.className = "review-dialog-footer";
  
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "review-btn review-btn-cancel";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => dialog.remove());
  
  const submitBtn = document.createElement("button");
  submitBtn.className = "review-btn review-btn-submit";
  submitBtn.textContent = "Submit Review";
  submitBtn.addEventListener("click", () => {
    // TODO: Implement backend interaction
    const reviewData = {
      rating: parseFloat(ratingInput.value),
      comment: commentInput.value,
      movie: movie.title,
    };
    console.log("Review submitted (backend not implemented yet):", reviewData);
    dialog.remove();
  });
  
  footer.appendChild(cancelBtn);
  footer.appendChild(submitBtn);
  
  content.appendChild(header);
  content.appendChild(body);
  content.appendChild(footer);
  
  dialog.appendChild(overlay);
  dialog.appendChild(content);
  document.body.appendChild(dialog);
}

function createReviewItem(review) {
  const reviewDiv = document.createElement("div");
  reviewDiv.className = "review-item";

  const reviewHeader = document.createElement("div");
  reviewHeader.className = "review-header";

  const userRating = document.createElement("div");
  userRating.className = "review-user-rating";

  const username = document.createElement("span");
  username.className = "review-username";
  username.textContent = review.username;

  const rating = document.createElement("span");
  rating.className = "review-rating";
  rating.textContent = `★ ${review.rating}`;

  userRating.appendChild(username);
  userRating.appendChild(rating);

  const comment = document.createElement("p");
  comment.className = "review-comment";
  comment.textContent = review.comment;

  reviewHeader.appendChild(userRating);
  reviewDiv.appendChild(reviewHeader);
  reviewDiv.appendChild(comment);

  return reviewDiv;
}
