function getUser() {
    const userStr = localStorage.getItem('lms_user');
    return userStr ? JSON.parse(userStr) : null;
}

function setUser(user) {
    localStorage.setItem('lms_user', JSON.stringify(user));
}

function removeUser() {
    localStorage.removeItem('lms_user');
}

function isLoggedIn() {
    return !!API.getToken();
}

function getUserRole() {
    const user = getUser();
    return user ? user.role : null;
}

function hasRole(role) {
    return getUserRole() === role;
}

function redirectToDashboard() {
    const role = getUserRole();

    if (!role) {
        window.location.href = '/login.html';
        return;
    }

    switch (role) {
        case 'learner':
            window.location.href = '/learner/dashboard.html';
            break;
        case 'instructor':
            window.location.href = '/instructor/dashboard.html';
            break;
        default:
            window.location.href = '/';
    }
}

function logout() {
    API.removeToken();
    removeUser();
    window.location.href = '/login.html';
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/login.html';
    }
}

function requireRole(role) {
    requireAuth();
    if (!hasRole(role)) {
        alert('Access denied. You do not have permission to view this page.');
        redirectToDashboard();
    }
}

function updateUIBasedOnAuth() {
    const isAuth = isLoggedIn();
    const user = getUser();

    const loginBtns = document.querySelectorAll('.show-when-logged-out');
    const logoutBtns = document.querySelectorAll('.show-when-logged-in');

    loginBtns.forEach(btn => btn.style.display = isAuth ? 'none' : 'inline-block');
    logoutBtns.forEach(btn => btn.style.display = isAuth ? 'inline-block' : 'none');

    if (user) {
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => el.textContent = user.full_name || user.username);
    }
}

function showLoading(message = 'Loading...') {
    const div = document.createElement('div');
    div.id = 'loading-overlay';
    div.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255,255,255,0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;
    div.innerHTML = `
    <div class="spinner"></div>
    <p style="margin-top: 1rem; color: var(--gray);">${message}</p>
  `;
    document.body.appendChild(div);
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fade-in`;
    alertDiv.textContent = message;
    alertDiv.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; min-width: 300px;';

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}

function handleAPIError(error) {
    hideLoading();
    const message = error.message || 'An error occurred';
    showAlert(message, 'error');
    console.error('API Error:', error);
}
