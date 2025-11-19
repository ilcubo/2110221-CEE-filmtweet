// frontend/public/scripts/auth.js
import { loginUser, registerUser } from './api.js'; 
import { updateUI } from './ui.js';
import { closeModal } from './modal.js';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// ------------------------------------------
// 1. REGISTER (พร้อม Auto-Login)
// ------------------------------------------
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value; // ⭐️ ดึง email 
    const password = document.getElementById('register-password').value; // ⭐️ ดึง password
    
    try {
        const payload = { username, email, password }; 
        
        // 1. เรียก API ลงทะเบียน
        await registerUser(payload); 
        
        // 2. ⭐⭐ ทำการล็อกอินอัตโนมัติทันที ⭐⭐
        
        // เตรียม Payload สำหรับ Login (ใช้ email และ password ที่เพิ่งกรอก)
        const loginPayload = { email, password }; 
        
        // เรียก API Login (ใช้โค้ด Logic เดียวกับ Login Form Submit)
        const responseData = await loginUser(loginPayload);
        
        const token = responseData.token; 
        const loggedInUsername = responseData.data.user.username; // ดึงตามโครงสร้าง Postman
        
        if (token && loggedInUsername) { 
            localStorage.setItem('token', token);
            localStorage.setItem('username', loggedInUsername);
            
            alert(`Registration successful! Welcome, ${loggedInUsername}.`); // แจ้งเตือนต้อนรับ
            closeModal(); // ปิด Modal
            updateUI();   // อัปเดต UI (เปลี่ยนเป็น Logout/แสดงชื่อ)
        } else {
             // กรณี Backend ตอบกลับสำเร็จ แต่ไม่มี Token หรือ Username
            alert('Registration successful, but auto-login failed: missing user data.');
        }

    } catch (error) {
        alert(`Registration Failed: ${error.message}`);
    }
});

// ------------------------------------------
// 2. LOGIN
// ------------------------------------------
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-identifier').value; // สมมติว่า input ID ยังเป็น 'login-identifier'
    const password = document.getElementById('login-password').value;
    
    try {
        // data ที่นี่คือ Object ทั้งหมดที่คุณเห็นใน Postman
        // { "status": "success", "token": "...", "data": { "user": { "username": "..." } } }
        const responseData = await loginUser({ email, password }); 
        
        // ⭐⭐ 1. ดึง Token จาก Level 1
        const token = responseData.token; 
        
        // ⭐⭐ 2. ดึง Username จาก Level 3
        const username = responseData.data.user.username; 

        // ตรวจสอบว่าได้ค่ามาครบถ้วนตามโครงสร้าง
        if (token && username) { 
            // 3. เก็บ Token และ Username 
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            
            closeModal();
            updateUI();   
            
        } else {
            alert('Login successful, but user data (token/username) is missing from response structure.');
        }

    } catch (error) {
        alert(`Login Failed: ${error.message}`);
    }
});

// ------------------------------------------
// 3. LOGOUT
// ------------------------------------------
export function handleLogout() {
    // ลบ Token และข้อมูลผู้ใช้ออกจาก Local Storage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    
    alert('You have been logged out.');
    updateUI(); // อัปเดต Header UI ให้กลับเป็น 'Guest'
}