// frontend/public/scripts/ui.js
import { handleLogout } from './auth.js'; 
import { openModal } from './modal.js'; 

const usernameDisplay = document.getElementById('username-display');
const authButton = document.getElementById('auth-button');
const reviewContainer = document.querySelector('.review-container');

// ฟังก์ชันหลักในการอัปเดต UI
export function updateUI() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
        // ล็อกอินแล้ว: แสดงชื่อและปุ่ม Logout
        usernameDisplay.textContent = username;
        authButton.textContent = 'Logout';
        
        // ********************************************************
        // ผู้ใช้ล็อกอินแล้วสามารถโพสต์รีวิวได้
        reviewContainer.style.display = 'flex'; 
        // ********************************************************

        // เปลี่ยน Event Listener ของปุ่มให้เป็น Logout
        authButton.onclick = handleLogout; 
    } else {
        // Guest: แสดง Guest และปุ่ม Login
        usernameDisplay.textContent = 'Guest';
        authButton.textContent = 'Login';
        
        // ********************************************************
        // ซ่อนฟอร์มรีวิวหากยังไม่ได้ล็อกอิน
        reviewContainer.style.display = 'none';
        // ********************************************************

        // เปลี่ยน Event Listener ของปุ่มให้เป็นเปิด Modal
        authButton.onclick = () => openModal('login'); 
    }
}

// เรียกใช้เมื่อโหลดหน้าเว็บครั้งแรก
document.addEventListener("DOMContentLoaded", updateUI);