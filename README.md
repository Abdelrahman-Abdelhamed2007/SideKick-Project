# 💾 SideKick OS v1.0.1

**A retro-futuristic virtual operating system simulating a 1980s Cyberpunk terminal.**

Built with modern web standards (ES6 Modules) but designed to feel like a CRT monitor, SideKick OS combines nostalgic aesthetics with genuine productivity tools. It features cloud-synced data, real-time authentication, and a pixel-perfect "Neon Green" interface.

## 🧑‍💻 Engineering Team

This application was engineered by:

  * **Abdelrahman** (ID: 202510542) - *Lead Architect & System Administrator*

      * **Core System:** Project Leadership, System Integration, Deployment, and Global UI Architecture.
      * **Backend Operations:** Firebase Configuration, Authentication Logic, and User Data Management.
      * **Module Development:** Built the *Sonic Deck* (Music Player) and *Neuro-Test* (Trivia) applications (Full-Stack).

  * **Majd** (ID: 202512370) - *Module Engineer*

      * **Chrono-Unit:** Complete Full-Stack development of the Timer and Stopwatch systems, including alarm logic and lap recording.

  * **Qussai** (ID: 202510258) - *Frontend Specialist & Module Engineer*

      * **Cloud Tasks:** Developed the core structure and interface for the To-Do application.
      * **Authentication UI:** Proposed the original concept for the Login system and implemented the frontend authentication design.

-----

## 🚀 Live Demo

Access the running operating system via the link below:

**🔗 [Launch SideKick OS (GitHub Pages)](https://abdelrahman-abdelhamed2007.github.io/SideKick-Project/index.html)**

> **Note:** If you are not logged in, the system will automatically redirect you to the authentication gatekeeper.

-----

## ✨ System Features

### 🔐 Authentication (Gatekeeper)

  * **Secure Login:** Users must authenticate before accessing the OS.
  * **Multi-Method Access:** Supports **Email/Password** registration, as well as Social Login via **Google** and **GitHub**.
  * **State Persistence:** The system remembers your login session so you don't have to re-enter credentials on refresh.

### 🖥️ The Dashboard Interface

  * **CRT Aesthetics:** Features a scanline overlay, text-shadow glow, and the "Press Start 2P" font for a realistic 8-bit experience.
  * **Boot Sequence:** A typewriter-style animated boot log ("LAUNCHING...") with audio feedback when opening applications.
  * **Responsive Design:** Fully functional on desktop and mobile devices.

### 🛠️ Core Applications

**1. ⏱️ Chrono-Unit (Timer & Stopwatch)**

  * **Countdown Mode:** Set specific study/work intervals. Plays an audible alarm upon completion.
  * **Stopwatch Mode:** Precision timing with a **Lap Record** feature to track multiple splits.
  * **Visual State:** Custom input focus states and robust error handling.

**2. 📋 Cloud Tasks (To-Do List)**

  * **Cloud Sync:** Unlike basic local lists, this app uses **Google Cloud Firestore**. Your tasks are synced to your specific User ID in real-time.
  * **Persistence:** Tasks remain saved across different devices and browser sessions.
  * **Management:** Add tasks, toggle completion (strikethrough), or bulk delete all tasks with visual loading feedback.

**3. 🎵 Sonic Deck (Music Player)**

  * **Local Playback:** Uses the File API to load audio files (`.mp3`, `.wav`) directly from your device into the browser's memory.
  * **Full Control:** Play, pause, skip, and loop tracks.
  * **Interactive Progress:** Click anywhere on the progress bar to scrub through the song.
  * **State Memory:** Saves your current track index and loop settings to `localStorage`.

**4. 💡 Neuro-Test (Trivia)**

  * **Live API:** Fetches questions dynamically from `the-trivia-api.com`.
  * **Visual Feedback:** Instant validation logic—correct answers glow **Green**, while incorrect choices turn **Red**, providing immediate feedback on your performance.

-----

## 🏗️ Technical Stack

This project uses a modular architecture without third-party frontend frameworks (like React or Vue), relying instead on powerful native Web APIs and Firebase.

  * **Frontend:**
      * **HTML5** (Semantic structure)
      * **CSS3** (Variables, Flexbox/Grid, Animations, CRT Scanlines)
      * **JavaScript ES6+** (Modules, Async/Await, DOM Manipulation)
  * **Backend & Cloud (Firebase v10.7.1):**
      * **Firebase Authentication:** Manages user identity and route protection.
      * **Cloud Firestore:** NoSQL database for real-time task storage and retrieval.
  * **External APIs:**
      * **The Trivia API:** For dynamic question generation.
      * **Web Audio API:** For system beeps and alarms.

-----

## 💻 How to Run Locally

Since this project uses ES6 Modules (`type="module"`), it must be served over HTTP/HTTPS and **cannot** be run by simply opening the HTML file.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/abdelrahman-abdelhamed2007/SideKick-OS.git
    ```
2.  **Open in VS Code:**
    Navigate to the project folder.
3.  **Launch Server:**
      * Install the **Live Server** extension for VS Code.
      * Right-click `index.html` (for the login screen) or `HomePage.html`.
      * Select **"Open with Live Server"**.

-----

*© 2025 GDG Computer Systems, Inc. | SideKick OS*
