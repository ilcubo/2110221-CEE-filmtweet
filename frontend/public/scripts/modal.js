// frontend/public/scripts/modal.js
const modal = document.getElementById('auth-modal');
const authButton = document.getElementById('auth-button');
const closeButton = document.querySelector('.close-button');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginContainer = document.getElementById('login-form-container');
const registerContainer = document.getElementById('register-form-container');

// ฟังก์ชันเปิด Modal
export function openModal(mode = 'login') {
    modal.style.display = 'flex';
    if (mode === 'register') {
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
    } else {
        loginContainer.style.display = 'block';
        registerContainer.style.display = 'none';
    }
}

// ฟังก์ชันปิด Modal
export function closeModal() {
    modal.style.display = 'none';
}

// Event Listeners สำหรับ Modal
document.addEventListener("DOMContentLoaded", () => {
    // 1. เปิด Modal เมื่อคลิกปุ่ม Login
    authButton.addEventListener('click', () => {
        // ตรวจสอบว่าปุ่มปัจจุบันคือ 'Login' หรือ 'Logout'
        if (authButton.textContent === 'Login') {
            openModal('login');
        } 
        // ถ้าเป็น 'Logout' จะถูกจัดการใน ui.js/auth.js
    });

    // 2. ปิด Modal เมื่อคลิก X
    closeButton.addEventListener('click', closeModal);

    // 3. ปิด Modal เมื่อคลิกนอกหน้าต่าง
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // 4. สลับไปหน้า Register
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('register');
    });

    // 5. สลับไปหน้า Login
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('login');
    });
});