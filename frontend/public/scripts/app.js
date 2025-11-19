// ===== Imports =====
import { createAccordion } from "./accordion.js";

// ===== DOM Elements =====
const navbarToggle = document.getElementById("navbar-toggle");
const navbarMobile = document.getElementById("navbar-mobile-menu");
const searchDialogToggle = document.getElementById("floating-search-btn");
const searchDialog = document.getElementById("search-dialog");
const searchDialogClose = document.getElementById("search-dialog-close");
const searchSubmitButton = document.getElementById("search-submit-btn");
const mainContainer = document.querySelector("main.container");

var searchDialogVisible = false;
var navbarMobileVisible = false;

searchDialogToggle.addEventListener("click", () => {
  if (searchDialogVisible) {
    searchDialog.className = "search-dialog";
    searchDialogVisible = false;
  } else {
    searchDialog.className = "search-dialog.active";
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

searchDialogClose.addEventListener("click", () => {
  searchDialog.className = "search-dialog";
  searchDialogVisible = false;
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 480) {
    navbarMobile.className = "navbar-mobile-menu";
    navbarMobileVisible = false;
  }
});

searchSubmitButton.addEventListener("click", () => {
  searchDialog.className = "search-dialog";
  searchDialogVisible = false;
});

// ===== Initialize Accordion =====
document.addEventListener("DOMContentLoaded", () => {
  createAccordion(mainContainer);
});
