import { BACKEND_URL } from "./config.js";

// Simple SHA-256 hash for password hashing (client-side)
/*
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
  */

function showDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
  const overlay = document.getElementById("dialog-overlay");
  if (dialog) dialog.style.display = "block";
  if (overlay) overlay.style.display = "block";
}

function hideDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
  const overlay = document.getElementById("dialog-overlay");
  if (dialog) dialog.style.display = "none";
  if (overlay) overlay.style.display = "none";
}

function updateAuthUI() {
  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");
  const loginButton = document.getElementById("login-button");
  const registerButton = document.getElementById("register-button");
  const userInfo = document.getElementById("user-info");
  const usernameDisplay = document.getElementById("username-display");
  const logoutButton = document.getElementById("logout-button");

  if (token && username) {
    if (loginButton) loginButton.style.display = "none";
    if (registerButton) registerButton.style.display = "none";
    if (usernameDisplay) usernameDisplay.textContent = `Welcome, ${username}!`;
    if (userInfo) userInfo.style.display = "flex";

    // Attach logout handler when showing user info (ensure it's only added once if possible)
    if (logoutButton) {
        // Remove previous listener to prevent duplicates
        logoutButton.removeEventListener("click", handleLogout);
        logoutButton.addEventListener("click", handleLogout);
    }
  } else {
    if (loginButton) loginButton.style.display = "block";
    if (registerButton) registerButton.style.display = "block";
    if (userInfo) userInfo.style.display = "none";
    if (usernameDisplay) usernameDisplay.textContent = "";
  }
}

function handleLogout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("username");
  updateAuthUI();
}

export function initAuth() {
  const loginButton = document.getElementById("login-button");
  const registerButton = document.getElementById("register-button");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const closeButtons = document.querySelectorAll(".close-button");
  const overlay = document.getElementById("dialog-overlay");

  // Button click handlers
  loginButton?.addEventListener("click", () => showDialog("login-dialog"));
  registerButton?.addEventListener("click", () => showDialog("register-dialog"));

  // Close dialog handlers
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const dialogId = btn.getAttribute("data-dialog");
      if (dialogId) hideDialog(dialogId);
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
  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const errorDiv = document.getElementById("login-error");
  
  const username = usernameInput?.value;
  const password = passwordInput?.value;

  if (!username || !password || !errorDiv) return;

  try {
    errorDiv.style.display = "none";
  

    // Hash password before sending
    let hashedPassword;
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hashedPassword = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } else {
      // Fallback: simple JS hash (not secure, but better than nothing)
      hashedPassword = Array.from(password).reduce((hash, c) => {
        hash = ((hash << 5) - hash) + c.charCodeAt(0);
        return hash & hash;
      }, 0).toString();
    }

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
    document.getElementById("login-form")?.reset();
  } catch (error) {
    errorDiv.textContent = `Error: ${error.message}`;
    errorDiv.style.display = "block";
  }
}

async function handleRegister() {
  const usernameInput = document.getElementById("register-username");
  const passwordInput = document.getElementById("register-password");
  const confirmPasswordInput = document.getElementById("register-password-confirm");
  const errorDiv = document.getElementById("register-error");

  const username = usernameInput?.value;
  const password = passwordInput?.value;
  const confirmPassword = confirmPasswordInput?.value;

  if (!username || !password || !confirmPassword || !errorDiv) return;

  try {
    errorDiv.style.display = "none";
    errorDiv.style.color = "";
    errorDiv.style.background = "";

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


    // Hash password before sending
    let hashedPassword;
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hashedPassword = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } else {
      // Fallback: simple JS hash (not secure, but better than nothing)
      hashedPassword = Array.from(password).reduce((hash, c) => {
        hash = ((hash << 5) - hash) + c.charCodeAt(0);
        return hash & hash;
      }, 0).toString();
    }

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
    document.getElementById("register-form")?.reset();

    // Close after 2 seconds
    setTimeout(() => {
      hideDialog("register-dialog");
    }, 2000);
  } catch (error) {
    errorDiv.textContent = `Error: ${error.message}`;
    errorDiv.style.display = "block";
  }
}