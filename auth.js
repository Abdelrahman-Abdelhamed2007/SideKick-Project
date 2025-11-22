document.addEventListener('DOMContentLoaded', () => {

    // DOM Element Caching
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupBtn = document.getElementById('show-signup-btn');
    const showLoginBtn = document.getElementById('show-login-btn');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');

    // Check if user is already logged in
    function checkAuthStatus() {
        const loggedInUser = localStorage.getItem('currentUser');
        if (loggedInUser) {
            // User is already logged in, redirect to home page
            window.location.href = 'HomePage.html';
        }
    }

    function showSignupModal() {
        signupModal.classList.remove('hidden');
        loginModal.classList.add('hidden');
    }

    function showLoginModal() {
        loginModal.classList.remove('hidden');
        signupModal.classList.add('hidden');
    }

    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            const currentUser = { username: user.username, email: user.email };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            loginError.textContent = '';
            loginError.style.color = '#00ff41';
            loginError.textContent = 'LOGIN SUCCESSFUL! LOADING...';
            
            // Redirect to home page after short delay
            setTimeout(() => {
                window.location.href = 'HomePage.html';
            }, 1000);
        } else {
            loginError.textContent = 'INVALID USERNAME OR PASSWORD';
            loginError.style.color = '#ff0000';
        }
    }

    function handleSignup(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        // Validation
        if (password !== confirmPassword) {
            signupError.textContent = 'PASSWORDS DO NOT MATCH';
            signupError.style.color = '#ff0000';
            return;
        }

        if (password.length < 6) {
            signupError.textContent = 'PASSWORD MUST BE AT LEAST 6 CHARACTERS';
            signupError.style.color = '#ff0000';
            return;
        }

        // Get existing users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if username already exists
        if (users.find(u => u.username === username)) {
            signupError.textContent = 'USERNAME ALREADY EXISTS';
            signupError.style.color = '#ff0000';
            return;
        }

        // Check if email already exists
        if (users.find(u => u.email === email)) {
            signupError.textContent = 'EMAIL ALREADY REGISTERED';
            signupError.style.color = '#ff0000';
            return;
        }

        // Create new user
        const newUser = { username, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        signupError.textContent = '';
        signupError.style.color = '#00ff41';
        signupError.textContent = 'ACCOUNT CREATED! REDIRECTING...';
        
        setTimeout(() => {
            signupForm.reset();
            signupError.style.color = '#ff0000';
            signupError.textContent = '';
            showLoginModal();
        }, 1500);
    }

    // Event Listeners
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    showSignupBtn.addEventListener('click', showSignupModal);
    showLoginBtn.addEventListener('click', showLoginModal);

    // Check if user is already logged in on page load
    checkAuthStatus();

});
