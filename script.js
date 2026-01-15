// نظام إدارة رفع المستوى - JavaScript

// البيانات الأساسية
const systemData = {
    admin: {
        username: "ADMIIN",
        password: "ADMIIN"
    },
    users: [],
    upgradeRequests: []
};

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    checkLoginStatus();
    setupEventListeners();
});

// تحميل البيانات من localStorage
function loadData() {
    const savedData = localStorage.getItem('levelupSystemData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        Object.assign(systemData, parsedData);
    } else {
        // بيانات أولية للمستخدمين
        systemData.users = [
            {
                id: 1,
                username: "user1",
                password: "pass123",
                upgrades_left: 1,
                is_admin: false,
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                username: "user2",
                password: "pass456",
                upgrades_left: 1,
                is_admin: false,
                created_at: new Date().toISOString()
            }
        ];
        
        // بيانات أولية للطلبات
        systemData.upgradeRequests = [
            {
                id: 1,
                user_id: 1,
                game_uid: "PLAYER12345",
                game_password: "gamepass123",
                allikk: "allikk_data_here",
                request_name: "Level Up #1",
                status: "offline",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
        
        saveData();
    }
}

// حفظ البيانات في localStorage
function saveData() {
    localStorage.setItem('levelupSystemData', JSON.stringify(systemData));
}

// التحقق من حالة تسجيل الدخول
function checkLoginStatus() {
    const currentPath = window.location.pathname;
    const isLoggedIn = localStorage.getItem('currentUser');
    const userRole = localStorage.getItem('userRole');
    
    // صفحات تحتاج تسجيل دخول
    const protectedPages = ['/admin.html', '/user.html'];
    const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    if (protectedPages.includes(currentPage) || currentPage === '') {
        if (!isLoggedIn) {
            window.location.href = 'login.html';
            return;
        }
        
        // التحقق من الصلاحيات
        if (currentPage === 'admin.html' && userRole !== 'admin') {
            window.location.href = 'user.html';
        } else if (currentPage === 'user.html' && userRole === 'admin') {
            window.location.href = 'admin.html';
        }
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // مستمعي نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // مستمعي نموذج إضافة مستخدم (الأدمن)
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }
    
    // مستمعي نموذج رفع المستوى
    const upgradeForm = document.getElementById('upgradeForm');
    if (upgradeForm) {
        upgradeForm.addEventListener('submit', handleUpgradeRequest);
    }
    
    // مستمعي زر تسجيل الخروج
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', handleLogout);
    });
}

// معالجة تسجيل الدخول
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // التحقق من بيانات الأدمن
    if (username === systemData.admin.username && password === systemData.admin.password) {
        localStorage.setItem('currentUser', username);
        localStorage.setItem('userRole', 'admin');
        showNotification('تم تسجيل الدخول كأدمن بنجاح!', 'success');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
        return;
    }
    
    // التحقق من بيانات المستخدمين
    const user = systemData.users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', username);
        localStorage.setItem('userRole', 'user');
        localStorage.setItem('userId', user.id);
        showNotification(`مرحباً ${username}!`, 'success');
        setTimeout(() => {
            window.location.href = 'user.html';
        }, 1500);
        return;
    }
    
    showNotification('اسم المستخدم أو كلمة المرور غير صحيحة!', 'error');
}

// معالجة إضافة مستخدم جديد (بواسطة الأدمن)
function handleAddUser(event) {
    event.preventDefault();
    
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    
    // التحقق من عدم تكرار اسم المستخدم
    const userExists = systemData.users.some(u => u.username === username);
    if (userExists) {
        showNotification('اسم المستخدم موجود مسبقاً!', 'error');
        return;
    }
    
    // إنشاء مستخدم جديد
    const newUser = {
        id: systemData.users.length + 1,
        username: username,
        password: password,
        upgrades_left: 1,
        is_admin: false,
        created_at: new Date().toISOString()
    };
    
    systemData.users.push(newUser);
    saveData();
    
    showNotification(`تم إضافة المستخدم ${username} بنجاح!`, 'success');
    document.getElementById('addUserForm').reset();
    
    // تحديث قائمة المستخدمين إذا كانت موجودة
    if (typeof updateUsersTable === 'function') {
        updateUsersTable();
    }
}

// معالجة طلب رفع المستوى
function handleUpgradeRequest(event) {
    event.preventDefault();
    
    const currentUserId = localStorage.getItem('userId');
    const user = systemData.users.find(u => u.id == currentUserId);
    
    // التحقق من وجود محاولات متبقية
    if (!user || user.upgrades_left <= 0) {
        showNotification('لا توجد محاولات متبقية لرفع المستوى!', 'error');
        return;
    }
    
    // جمع البيانات من النموذج
    const gameUid = document.getElementById('gameUid').value;
    const gamePassword = document.getElementById('gamePassword').value;
    const allikk = document.getElementById('allikk').value;
    const requestName = `Level Up #${systemData.upgradeRequests.filter(r => r.user_id == currentUserId).length + 1}`;
    
    // إنشاء طلب جديد
    const newRequest = {
        id: systemData.upgradeRequests.length + 1,
        user_id: parseInt(currentUserId),
        game_uid: gameUid,
        game_password: gamePassword,
        allikk: allikk,
        request_name: requestName,
        status: "offline",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    systemData.upgradeRequests.push(newRequest);
    
    // خفض عدد المحاولات المتبقية للمستخدم
    user.upgrades_left -= 1;
    
    saveData();
    
    showNotification(`تم إنشاء طلب رفع المستوى "${requestName}" بنجاح!`, 'success');
    document.getElementById('upgradeForm').reset();
    
    // تحديث قائمة الطلبات إذا كانت موجودة
    if (typeof updateRequestsTable === 'function') {
        updateRequestsTable();
    }
}

// تبديل حالة الطلب (Online/Offline)
function toggleRequestStatus(requestId) {
    const request = systemData.upgradeRequests.find(r => r.id == requestId);
    if (request) {
        request.status = request.status === 'online' ? 'offline' : 'online';
        request.updated_at = new Date().toISOString();
        saveData();
        
        showNotification(`تم تغيير حالة الطلب إلى ${request.status === 'online' ? 'متصل' : 'غير متصل'}`, 'success');
        
        // تحديث العرض
        if (typeof updateRequestsTable === 'function') {
            updateRequestsTable();
        }
    }
}

// تسجيل الخروج
function handleLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    showNotification('تم تسجيل الخروج بنجاح', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// عرض الإشعارات
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // إضافة أنماط الإشعار
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // تلوين حسب النوع
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // زر الإغلاق
    notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 15px;
    `;
    
    // إضافة الأنيميشن
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // إضافة الإشعار للصفحة
    document.body.appendChild(notification);
    
    // إزالة الإشعار تلقائياً بعد 5 ثواني
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// دالة لتحديث جدول المستخدمين (في صفحة الأدمن)
function updateUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    systemData.users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.upgrades_left}</td>
            <td>${new Date(user.created_at).toLocaleDateString('ar-SA')}</td>
            <td>
                <button onclick="editUser(${user.id})" class="action-btn btn-edit">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button onclick="deleteUser(${user.id})" class="action-btn btn-delete">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// دالة لتحديث جدول الطلبات
function updateRequestsTable() {
    const tableBody = document.getElementById('requestsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const currentUserId = localStorage.getItem('userId');
    const currentUserRole = localStorage.getItem('userRole');
    
    // فلترة الطلبات بناءً على الصلاحيات
    let requestsToShow = systemData.upgradeRequests;
    if (currentUserRole === 'user') {
        requestsToShow = requestsToShow.filter(r => r.user_id == currentUserId);
    }
    
    requestsToShow.forEach(request => {
        const user = systemData.users.find(u => u.id === request.user_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.id}</td>
            <td>${user ? user.username : 'غير معروف'}</td>
            <td>${request.request_name}</td>
            <td>${request.game_uid}</td>
            <td>
                <span class="status-badge status-${request.status}">
                    ${request.status === 'online' ? 'متصل' : 'غير متصل'}
                </span>
            </td>
            <td>${new Date(request.created_at).toLocaleDateString('ar-SA')}</td>
            <td>
                <button onclick="toggleRequestStatus(${request.id})" 
                        class="action-btn btn-toggle">
                    <i class="fas fa-power-off"></i> 
                    ${request.status === 'online' ? 'إيقاف' : 'تشغيل'}
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// دالة لتعديل المستخدم
function editUser(userId) {
    const user = systemData.users.find(u => u.id === userId);
    if (user) {
        const newUpgrades = prompt(`أدخل عدد محاولات رفع المستوى الجديدة لـ ${user.username}:`, user.upgrades_left);
        if (newUpgrades !== null && !isNaN(newUpgrades)) {
            user.upgrades_left = parseInt(newUpgrades);
            saveData();
            updateUsersTable();
            showNotification(`تم تحديث محاولات ${user.username} إلى ${newUpgrades}`, 'success');
        }
    }
}

// دالة لحذف المستخدم
function deleteUser(userId) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع طلباته أيضاً.')) {
        const userIndex = systemData.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            const username = systemData.users[userIndex].username;
            systemData.users.splice(userIndex, 1);
            
            // حذف طلبات المستخدم أيضاً
            systemData.upgradeRequests = systemData.upgradeRequests.filter(r => r.user_id !== userId);
            
            saveData();
            updateUsersTable();
            updateRequestsTable();
            
            showNotification(`تم حذف المستخدم ${username}`, 'success');
        }
    }
}

// دالة لتصدير البيانات
function exportData() {
    const dataStr = JSON.stringify(systemData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `levelup-system-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('تم تصدير نسخة احتياطية من البيانات', 'success');
}

// دالة لاستيراد البيانات
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            Object.assign(systemData, importedData);
            saveData();
            showNotification('تم استيراد البيانات بنجاح', 'success');
            
            // تحديث الجداول
            if (typeof updateUsersTable === 'function') updateUsersTable();
            if (typeof updateRequestsTable === 'function') updateRequestsTable();
        } catch (error) {
            showNotification('خطأ في استيراد الملف', 'error');
        }
    };
    reader.readAsText(file);
}

// إضافة الأنماط للإشعارات
document.addEventListener('DOMContentLoaded', function() {
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-width: 300px;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        }
        
        .notification button {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin-left: 15px;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .notification-success { background: #4CAF50; }
        .notification-error { background: #f44336; }
        .notification-warning { background: #ff9800; }
        .notification-info { background: #2196F3; }
        
        .status-badge {
            padding: 5px 10px;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .status-online {
            background: #d4edda;
            color: #155724;
        }
        
        .status-offline {
            background: #f8d7da;
            color: #721c24;
        }
    `;
    document.head.appendChild(notificationStyle);
});

// جعل الدوال متاحة عالمياً
window.toggleRequestStatus = toggleRequestStatus;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.exportData = exportData;
window.importData = importData;
