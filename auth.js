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
document.addEventListener('DOMContentLoaded', () => {

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
            window.location.replace('HomePage.html');
        }
    });

    // 2. Social Login Handler
    async function handleSocialLogin(provider) {
        try {
            loginError.style.color = '#00ff41';
            loginError.textContent = 'CONNECTING...';
            await signInWithPopup(auth, provider);
        } catch (error) {
            loginError.style.color = '#ff0000';
            loginError.textContent = 'LOGIN FAILED: ' + error.message;
        }
    }

    // 3. Email Sign Up Handler
    async function handleSignup(e) {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        if (password !== confirmPassword) {
            signupError.textContent = 'PASSWORDS DO NOT MATCH';
            return;
        }

        try {
            signupError.style.color = '#00ff41';
            signupError.textContent = 'CREATING ACCOUNT...';
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            signupError.style.color = '#ff0000';
            signupError.textContent = 'ERROR: ' + error.message;
        }
    }

    // 4. Email Login Handler
    async function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            loginError.style.color = '#00ff41';
            loginError.textContent = 'AUTHENTICATING...';
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            loginError.style.color = '#ff0000';
            loginError.textContent = 'INVALID EMAIL OR PASSWORD';
        }
    }

    // Event Listeners
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    showSignupBtn.addEventListener('click', () => {
        signupModal.classList.remove('hidden');
        loginModal.classList.add('hidden');
        signupForm.reset();
        signupError.textContent = '';
    });
    showLoginBtn.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
        signupModal.classList.add('hidden');
        loginForm.reset();
        loginError.textContent = '';
    });
    googleBtn.addEventListener('click', () => handleSocialLogin(googleProvider));
    githubBtn.addEventListener('click', () => handleSocialLogin(githubProvider));
});

/* =========================================
   END OF SECTION: LOGIN / SIGNUP LOGIC
   ========================================= */