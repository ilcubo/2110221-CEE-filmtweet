export const selectedTags = new Set();

export function createTagElement(tag, onDelete) {
  const span = document.createElement("span");
  span.className = "tag";
  span.textContent = tag;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "×";
  deleteBtn.className = "tag-delete-btn";

  deleteBtn.onclick = () => {
    selectedTags.delete(tag);
    span.remove();
    if (onDelete) onDelete();
  };

  span.appendChild(deleteBtn);
  return span;
}

// Initialize tag selection
export function initTagSelect(tagSelect, selectedTagsContainer, onChangeCallback) {
  if (!tagSelect || !selectedTagsContainer) return;

  tagSelect.addEventListener("change", () => {
    const selectedTag = tagSelect.value;
    const selectedText = tagSelect.options[tagSelect.selectedIndex].text;

    if (selectedTag && !selectedTags.has(selectedText)) {
      selectedTags.add(selectedText);
      selectedTagsContainer.appendChild(createTagElement(selectedText, onChangeCallback));
      tagSelect.value = "";
      if (onChangeCallback) onChangeCallback();
    }
  });
}
