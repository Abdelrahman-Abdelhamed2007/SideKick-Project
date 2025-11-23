/* =========================================
   SECTION: DECLARATIONS / GLOBAL IMPORTS
   ========================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- YOUR ACTUAL FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyDYM_ObQQ1U0nV_upLm1hB9Z0zqu2r4-hE",
    authDomain: "sidekick-os-a8ebf.firebaseapp.com",
    projectId: "sidekick-os-a8ebf",
    storageBucket: "sidekick-os-a8ebf.firebasestorage.app",
    messagingSenderId: "5370275950",
    appId: "1:5370275950:web:441e5501e09bd60c509e7f",
    measurementId: "G-YWNFVYM13Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

/* =========================================
   END OF SECTION: DECLARATIONS / GLOBAL
   ========================================= */


/* =========================================
   SECTION: LOGIN / SIGNUP LOGIC
   ========================================= */

// Cache DOM Elements
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupBtn = document.getElementById('show-signup-btn');
const showLoginBtn = document.getElementById('show-login-btn');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');
const googleBtn = document.getElementById('google-login-btn');
const githubBtn = document.getElementById('github-login-btn');

// 1. The Gatekeeper (Redirect if logged in)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Store user info for personalization (optional)
        localStorage.setItem('currentUser', JSON.stringify({
            email: user.email,
            uid: user.uid
        }));
        window.location.replace('HomePage.html');
    }
});

// Helper: Toggle Button State
const toggleButtonState = (btn, isLoading, loadingText, originalText) => {
    if (!btn) return;
    btn.disabled = isLoading;
    btn.textContent = isLoading ? loadingText : originalText;
};

// 2. Social Login Handler
async function handleSocialLogin(provider) {
    try {
        loginError.style.color = '#00ff41';
        loginError.textContent = 'CONNECTING...';
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error(error);
        loginError.style.color = '#ff0000';
        loginError.textContent = 'LOGIN FAILED: ' + error.message;
    }
}

// 3. Email Sign Up Handler
async function handleSignup(e) {
    e.preventDefault();
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        signupError.textContent = 'PASSWORDS DO NOT MATCH';
        return;
    }

    try {
        // OPTIMIZATION: Disable button to prevent double-submit
        toggleButtonState(submitBtn, true, "CREATING...", originalBtnText);
        signupError.style.color = '#00ff41';
        signupError.textContent = 'CREATING ACCOUNT...';

        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        signupError.style.color = '#ff0000';
        const errorMap = {
            'auth/email-already-in-use': 'EMAIL ALREADY REGISTERED',
            'auth/weak-password': 'PASSWORD TOO WEAK (6+ CHARS)',
            'auth/invalid-email': 'INVALID EMAIL ADDRESS'
        };
        signupError.textContent = errorMap[error.code] || ('ERROR: ' + error.message);

        // OPTIMIZATION: Re-enable button on error
        toggleButtonState(submitBtn, false, "", originalBtnText);
    }
}

// 4. Email Login Handler
async function handleLogin(e) {
    e.preventDefault();
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    const email = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        // OPTIMIZATION: Disable button to prevent double-submit
        toggleButtonState(submitBtn, true, "VERIFYING...", originalBtnText);
        loginError.style.color = '#00ff41';
        loginError.textContent = 'AUTHENTICATING...';

        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error);
        loginError.style.color = '#ff0000';
        loginError.textContent = 'INVALID EMAIL OR PASSWORD';

        // OPTIMIZATION: Re-enable button on error
        toggleButtonState(submitBtn, false, "", originalBtnText);
    }
}

// Event Listeners
if (loginForm) loginForm.addEventListener('submit', handleLogin);
if (signupForm) signupForm.addEventListener('submit', handleSignup);

if (showSignupBtn) {
    showSignupBtn.addEventListener('click', () => {
        signupModal.classList.remove('hidden');
        loginModal.classList.add('hidden');
        signupForm.reset();
        signupError.textContent = '';
        // OPTIMIZATION: Auto-focus the email field
        document.getElementById('signup-email').focus();
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
        signupModal.classList.add('hidden');
        loginForm.reset();
        loginError.textContent = '';
        // OPTIMIZATION: Auto-focus the email field
        document.getElementById('login-username').focus();
    });
}

if (googleBtn) googleBtn.addEventListener('click', () => handleSocialLogin(googleProvider));
if (githubBtn) githubBtn.addEventListener('click', () => handleSocialLogin(githubProvider));

/* =========================================
   END OF SECTION: LOGIN / SIGNUP LOGIC
   ========================================= */