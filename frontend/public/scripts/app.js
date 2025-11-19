const searchButton = document.getElementById("floating-search-btn");
const searchDialog = document.getElementById("search-dialog");

var searchDialogVisible = false;

searchButton.addEventListener("click", () => {
  if (searchDialogVisible) {
    searchDialog.style = "display: none; position: static;";
    searchDialogVisible = false;
  } else {
    searchDialog.style = "display: block; position: static;";
    searchDialogVisible = true;
  }
});