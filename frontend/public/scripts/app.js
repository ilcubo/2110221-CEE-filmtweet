const navbarToggle = document.getElementById("navbar-toggle");
const navbarMobile = document.getElementById("navbar-mobile-menu");
const searchButton = document.getElementById("floating-search-btn");
const searchDialog = document.getElementById("search-dialog");

var searchDialogVisible = false;
var navbarMobileVisible = false;

searchButton.addEventListener("click", () => {
  if (searchDialogVisible) {
    searchDialog.style = "display: none; position: static;";
    searchDialogVisible = false;
  } else {
    searchDialog.style = "display: block; position: static;";
    searchDialogVisible = true;
  }
});

navbarToggle.addEventListener("click", () => {
  if (navbarMobileVisible) {
    navbarMobile.className = "navbar-mobile-menu";
    navbarMobileVisible = false;
  } else {
    navbarMobile.className = "navbar-mobile-menu.active";
    navbarMobileVisible = true;
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 480) {
    navbarMobile.className = "navbar-mobile-menu";
    navbarMobileVisible = false;
  }
});
