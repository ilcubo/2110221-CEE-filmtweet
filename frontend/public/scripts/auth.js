import { BACKEND_URL } from "./config.js";

// Simple SHA-256 hash for password hashing (client-side)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

function showDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
  const overlay = document.getElementById("dialog-overlay");
  dialog.style.display = "block";
  overlay.style.display = "block";
}

function hideDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
  const overlay = document.getElementById("dialog-overlay");
  dialog.style.display = "none";
  overlay.style.display = "none";
}

function updateAuthUI() {
  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");
  const loginButton = document.getElementById("login-button");
  const registerButton = document.getElementById("register-button");
  const userInfo = document.getElementById("user-info");
  const usernameDisplay = document.getElementById("username-display");

  if (token && username) {
    loginButton.style.display = "none";
    registerButton.style.display = "none";
    usernameDisplay.textContent = `Welcome, ${username}!`;
    userInfo.style.display = "flex";
  } else {
    loginButton.style.display = "block";
    registerButton.style.display = "block";
    userInfo.style.display = "none";
  }
}

export function initAuth() {
  const loginButton = document.getElementById("login-button");
  const registerButton = document.getElementById("register-button");
  const logoutButton = document.getElementById("logout-button");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const closeButtons = document.querySelectorAll(".close-button");
  const overlay = document.getElementById("dialog-overlay");

  // Button click handlers
  loginButton?.addEventListener("click", () => showDialog("login-dialog"));
  registerButton?.addEventListener("click", () => showDialog("register-dialog"));
  logoutButton?.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    updateAuthUI();
  });

  // Close dialog handlers
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const dialogId = btn.getAttribute("data-dialog");
      hideDialog(dialogId);
    });
  });

  overlay?.addEventListener("click", () => {
    hideDialog("login-dialog");
    hideDialog("register-dialog");
  });

  // Form submission handlers
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleLogin();
  });

  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleRegister();
  });

  // Initialize UI based on stored auth state
  updateAuthUI();
}

export function getAuthToken() {
  return localStorage.getItem("authToken");
}

export function getUsername() {
  return localStorage.getItem("username");
}

async function handleLogin() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const errorDiv = document.getElementById("login-error");

  try {
    errorDiv.style.display = "none";
    const hashedPassword = await hashPassword(password);

    const response = await fetch(`${BACKEND_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, hashedPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorDiv.textContent = data.error || "Login failed";
      errorDiv.style.display = "block";
      return;
    }

    // Store token and username
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("username", username);

    // Update UI
    updateAuthUI();

    // Close dialog and reset form
    hideDialog("login-dialog");
    document.getElementById("login-form").reset();
  } catch (error) {
    errorDiv.textContent = `Error: ${error.message}`;
    errorDiv.style.display = "block";
  }
}

async function handleRegister() {
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("register-password-confirm").value;
  const errorDiv = document.getElementById("register-error");

  try {
    errorDiv.style.display = "none";

    if (password !== confirmPassword) {
      errorDiv.textContent = "Passwords do not match";
      errorDiv.style.display = "block";
      return;
    }

    if (password.length < 6) {
      errorDiv.textContent = "Password must be at least 6 characters";
      errorDiv.style.display = "block";
      return;
    }

    const hashedPassword = await hashPassword(password);

    const response = await fetch(`${BACKEND_URL}/login/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, hashedPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorDiv.textContent = data.error || "Registration failed";
      errorDiv.style.display = "block";
      return;
    }

    // Show success and close dialog
    errorDiv.textContent = "Registration successful! Please login.";
    errorDiv.style.color = "#2e7d32";
    errorDiv.style.background = "#e8f5e9";
    errorDiv.style.display = "block";

    // Reset form
    document.getElementById("register-form").reset();

    // Close after 2 seconds
    setTimeout(() => {
      hideDialog("register-dialog");
    }, 2000);
  } catch (error) {
    errorDiv.textContent = `Error: ${error.message}`;
    errorDiv.style.display = "block";
  }
}
