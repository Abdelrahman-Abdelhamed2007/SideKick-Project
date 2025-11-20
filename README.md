# SideKick OS v1.0.1

A retro, 1980s-style virtual operating system built with vanilla HTML, CSS, and JavaScript. This project simulates a CRT monitor interface and includes four fully functional applications.

## 🧑‍💻 Contributors

This project was built by:

* **Abdelrahman** (ID: 202510542)
* **Majd** (ID: \_\_\_\_\_\_\_\_)
* **Qussai** (ID: \_\_\_\_\_\_\_\_)

---

## 🚀 Live Demo

This project is hosted live on GitHub Pages.

**You can run SideKick OS here:**
**[https://abdelrahman-abdelhamed2007.github.io/SideKick-OS/HomePage.html](https://abdelrahman-abdelhamed2007.github.io/SideKick-OS/HomePage.html)**

---

## ✨ Features

* **Retro CRT Interface:** A pixel-perfect design using the "Press Start 2P" font, scanline effects, and a responsive layout.
* **Animated Boot Sequence:** A dedicated, isolated "LAUNCHING..." screen with sound effects for a realistic app-loading experience.
* **App-Switching:** A clean dashboard for launching and switching between four core applications.
* **🎵 Music Player:** Load local audio files (`.mp3`, `.wav`, etc.), play/pause, skip tracks, loop, and view progress. The player saves your last-played track and playback time to `localStorage`.
* **⏱️ Dual-Mode Timer:**
    * **Countdown:** A full countdown timer (with a `25:00` default) that plays an audio alarm when finished.
    * **Stopwatch:** A precision stopwatch with a "Lap" recording feature.
* **📋 To-Do List:** An interactive task manager. Add tasks, check them off to delete, or delete all. Your task list is saved to `localStorage` and persists even after you close the browser.
* **💡 Trivia:** Fetches live, random trivia questions from the Open Trivia Database (a public API) and validates your answers.

---

## 🛠️ Technologies Used

* **HTML5:** For all content and structure.
* **CSS3:** For all styling, layout (Flexbox/Grid), and animations. This includes CSS Variables for easy theming.
* **Vanilla JavaScript (ES6+):** For all application logic. No frameworks or libraries were used.
* **Web APIs:**
    * `localStorage` (for To-Do & Music persistence)
    * `Web Audio API` (for launch beeps and timer alarms)
    * `Fetch API` (for loading Trivia questions)
    * `File API` & `URL.createObjectURL()` (for the Music Player)

---

## 🖥️ How to Run Locally

1.  Clone or download this repository.
2.  Ensure all files (`HomePage.html`, `HomePage.css`, `HomePage.js`, `dgc-lockup.png`) are in the same folder.
3.  **Important:** Due to browser security (CORS), the **Trivia** app will not work if you open `HomePage.html` directly from your local filesystem (e.g., `file:///...`). You must run it from a local server.
    * **VS Code:** The easiest way is to use the "Live Server" extension. Right-click `HomePage.html` and select "Open with Live Server".

---
