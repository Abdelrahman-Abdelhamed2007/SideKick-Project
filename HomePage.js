/* ---
TABLE OF CONTENTS
1.  Initialization (DOMContentLoaded)
2.  DOM Element Caching
3.  State Variables
4.  Core App Logic
    - Audio (Beep & Unlock)
    - View Switching
    - Launch Sequence
    - Terminal Boot
5.  Application Logic: TIMER
    - Countdown Mode
    - Stopwatch Mode
    - Timer Controller
6.  Application Logic: TO-DO
    - Storage
    - DOM Manipulation
7.  Application Logic: MUSIC
    - Storage
    - Player Controls
    - Progress Bar
8.  Application Logic: TRIVIA
    - API Fetching
    - Answer Logic
9.  Global Event Listeners
--- */

// --- 1. Initialization (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 2. DOM Element Caching ---
    const terminalOutput = document.getElementById('terminal-output');
    const launchApp = document.getElementById('launch-app');
    const launchText = document.getElementById('launch-text');
    const appButtons = document.querySelectorAll('.app-btn');
    const appViews = document.querySelectorAll('.app-view');
    const monitor = document.querySelector('.monitor');

    // Timer Elements
    const timerApp = document.getElementById('timer-app');
    const timerDisplayElement = document.getElementById("timer-display-element");
    const timerMinutesInput = document.getElementById("timer-minutes-input");
    const timerAlarm = document.getElementById("timer-alarm-sound");
    const timerStartBtn = document.getElementById("timer-start-btn");
    const timerPauseBtn = document.getElementById("timer-pause-btn");
    const timerResetBtn = document.getElementById("timer-reset-btn");
    const timerLapBtn = document.getElementById("timer-lap-btn");
    const timerLapList = document.getElementById("timer-lap-list");
    const timerModeBtn = document.getElementById('timer-mode-btn');

    // To-Do Elements
    const todoApp = document.getElementById('todo-app');
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const todoListElement = document.getElementById('todo-list');

    // Music Elements
    const musicApp = document.getElementById('music-app');
    const musicPlayer = document.getElementById('music-player');
    const musicTitle = document.getElementById('music-title');
    const musicProgressContainer = document.querySelector('.music-progress-container');
    const musicProgressBar = document.getElementById('music-progress-bar');
    const musicPlayBtn = document.getElementById('music-play-btn');
    const musicPrevBtn = document.getElementById('music-prev-btn');
    const musicNextBtn = document.getElementById('music-next-btn');
    const musicLoopBtn = document.getElementById('music-loop-btn');
    const musicFileInput = document.getElementById('music-file-input');

    // Trivia Elements
    const triviaApp = document.getElementById('trivia-app');
    const triviaCategory = document.getElementById('trivia-category');
    const triviaQuestion = document.getElementById('trivia-question');
    const triviaInput = document.getElementById('trivia-input');
    const triviaSubmitBtn = document.getElementById('trivia-submit-btn');
    const triviaNextBtn = document.getElementById('trivia-next-btn');
    const triviaMessage = document.getElementById('trivia-message');

    // --- 3. State Variables ---
    let timerAppMode = 'COUNTDOWN';
    let permanentBootText = "";
    let audioCtx = null;
    let musicPlaylist = [];
    let currentTrackIndex = 0;
    let currentTriviaAnswer = "";

    // Timer State Variables
    let countdownTimerInterval, stopwatchInterval;
    let countdownTimeLeft, stopwatchElapsed = 0;
    let isCountdownPaused = false, isStopwatchRunning = false;
    let stopwatchLapCounter = 1;


    // --- 4. Core App Logic ---

    // Audio (Beep & Unlock)
    const createAudioContext = () => {
        if (audioCtx) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            return audioCtx;
        }
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            const buffer = audioCtx.createBuffer(1, 1, 22050);
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start(0);
            if (audioCtx.state === 'suspended') audioCtx.resume();
            return audioCtx;
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
            return null;
        }
    };

    const unlockAudio = () => { if (!audioCtx) createAudioContext(); };

    const beep = () => {
        if (!audioCtx) unlockAudio();
        if (!audioCtx) return;
        const context = audioCtx;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(300, context.currentTime);
        gainNode.gain.setValueAtTime(0.2, context.currentTime);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.1);
    };

    // View Switching
    const switchView = (appName) => {
        terminalOutput.classList.add('hidden');
        appViews.forEach(view => view.classList.add('hidden'));
        if (appName === 'timer') {
            timerApp.classList.remove('hidden');
            timerAppMode = 'COUNTDOWN';
            updateTimerModeUI();
            resetCountdownTimer();
        } else if (appName === 'todo') {
            todoApp.classList.remove('hidden');
            renderList();
        } else if (appName === 'music') {
            musicApp.classList.remove('hidden');
            loadMusicState();
        } else if (appName === 'trivia') {
            triviaApp.classList.remove('hidden');
            getNewQuestion();
        }
    };

    // Launch Sequence
    const launchAppSequence = (appName) => {
        const targetAppName = appName.toUpperCase();
        beep();
        terminalOutput.classList.add('hidden');
        appViews.forEach(view => view.classList.add('hidden'));
        launchApp.classList.remove('hidden');
        clearInterval(countdownTimerInterval);
        clearInterval(stopwatchInterval);
        const baseLog = `> LAUNCHING ${targetAppName}`;
        launchText.innerHTML = baseLog + '..._';
        const totalDuration = 2000;
        const intervalDuration = totalDuration / 6;
        let dotCount = 1;
        const animationInterval = setInterval(() => {
            let dots = '.'.repeat(dotCount);
            launchText.innerHTML = baseLog + dots + '_';
            dotCount++;
            if (dotCount > 3) dotCount = 1;
        }, intervalDuration);
        setTimeout(() => {
            clearInterval(animationInterval);
            switchView(appName);
        }, totalDuration);
    };

    // Terminal Boot
    const bootLines = ["SideKick OS v1.0.1", "", "READY."];
    const promptLine = "SELECT AN APPLICATION TO BEGIN.";
    let charIndex = 0;
    let lineIndex = 0;
    const typingSpeed = 50;
    const lineDelay = 500;
    function typeText() {
        if (lineIndex < bootLines.length) {
            const currentLine = bootLines[lineIndex];
            if (charIndex < currentLine.length) {
                let typingLine = currentLine.substring(0, charIndex + 1);
                terminalOutput.innerHTML = permanentBootText + typingLine + '_';
                charIndex++;
                setTimeout(typeText, typingSpeed);
            } else {
                permanentBootText += currentLine + '<br>';
                lineIndex++;
                charIndex = 0;
                setTimeout(typeText, lineDelay);
            }
        } else if (lineIndex === bootLines.length) {
            if (charIndex < promptLine.length) {
                let typingPrompt = promptLine.substring(0, charIndex + 1);
                terminalOutput.innerHTML = permanentBootText + typingPrompt + '_';
                charIndex++;
                setTimeout(typeText, typingSpeed);
            } else {
                terminalOutput.innerHTML = permanentBootText + promptLine + '_';
                lineIndex++;
            }
        }
    }
    typeText();


    // --- 5. Application Logic: TIMER ---

    // Countdown Mode Functions
    function startCountdownTimer() {
        unlockAudio();
        timerAlarm.play().catch(e => console.log("Audio blocked"));
        timerAlarm.pause();

        if (!isCountdownPaused) {
            let minutes = parseInt(timerMinutesInput.value);
            if (isNaN(minutes) || minutes < 1) minutes = 25;
            countdownTimeLeft = minutes * 60;
        }
        clearInterval(countdownTimerInterval);
        countdownTimerInterval = setInterval(updateCountdownTimer, 1000);
        isCountdownPaused = false;
    }

    function updateCountdownTimer() {
        if (countdownTimeLeft <= 0) {
            clearInterval(countdownTimerInterval);
            timerDisplayElement.textContent = "GAME OVER";
            timerAlarm.play();
            return;
        }
        countdownTimeLeft--;
        let mins = Math.floor(countdownTimeLeft / 60);
        let secs = countdownTimeLeft % 60;
        timerDisplayElement.textContent =
            `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function pauseCountdownTimer() {
        clearInterval(countdownTimerInterval);
        isCountdownPaused = true;
    }

    function resetCountdownTimer() {
        clearInterval(countdownTimerInterval);
        isCountdownPaused = false;
        let minutes = parseInt(timerMinutesInput.value);
        if (isNaN(minutes) || minutes < 1) minutes = 25;
        countdownTimeLeft = minutes * 60;
        timerDisplayElement.textContent =
            `${String(minutes).padStart(2, '0')}:00`;
        timerAlarm.pause();
        timerAlarm.currentTime = 0;
    }

    // Stopwatch Mode Functions
    function startStopwatch() {
        if (isStopwatchRunning) return;
        isStopwatchRunning = true;
        stopwatchStartTime = Date.now() - stopwatchElapsed;
        stopwatchInterval = setInterval(updateStopwatch, 10);
    }

    function pauseStopwatch() {
        isStopwatchRunning = false;
        clearInterval(stopwatchInterval);
    }

    function resetStopwatch() {
        isStopwatchRunning = false;
        clearInterval(stopwatchInterval);
        stopwatchElapsed = 0;
        stopwatchLapCounter = 1;
        timerDisplayElement.textContent = "00:00.00";
        timerLapList.innerHTML = "";
    }

    function updateStopwatch() {
        stopwatchElapsed = Date.now() - stopwatchStartTime;
        let totalSeconds = Math.floor(stopwatchElapsed / 1000);
        let milliseconds = Math.floor((stopwatchElapsed % 1000) / 10);
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        timerDisplayElement.textContent =
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}.` +
            `${String(milliseconds).padStart(2, "0")}`;
    }

    function recordStopwatchLap() {
        if (!isStopwatchRunning) return;
        let li = document.createElement("li");
        li.textContent = `Lap ${stopwatchLapCounter}: ${timerDisplayElement.textContent}`;
        timerLapList.appendChild(li);
        stopwatchLapCounter++;
    }

    // Timer Controller Logic
    function updateTimerModeUI() {
        if (timerAppMode === 'COUNTDOWN') {
            timerMinutesInput.classList.remove('hidden');
            timerLapBtn.classList.add('hidden');
            timerLapList.classList.add('hidden');

            timerStartBtn.classList.remove('hidden');
            timerPauseBtn.classList.remove('hidden');
            timerResetBtn.classList.remove('hidden');

            resetCountdownTimer();
            resetStopwatch();
        } else {
            timerMinutesInput.classList.add('hidden');
            timerLapBtn.classList.remove('hidden');
            timerLapList.classList.remove('hidden');

            timerStartBtn.classList.remove('hidden');
            timerPauseBtn.classList.remove('hidden');
            timerResetBtn.classList.remove('hidden');

            resetCountdownTimer();
            resetStopwatch();
        }
    }

    function toggleTimerMode() {
        timerAppMode = (timerAppMode === 'COUNTDOWN') ? 'STOPWATCH' : 'COUNTDOWN';
        updateTimerModeUI();
    }

    timerStartBtn.addEventListener("click", () => {
        if (timerAppMode === 'COUNTDOWN') startCountdownTimer();
        else startStopwatch();
    });

    timerPauseBtn.addEventListener("click", () => {
        if (timerAppMode === 'COUNTDOWN') pauseCountdownTimer();
        else pauseStopwatch();
    });

    timerResetBtn.addEventListener("click", () => {
        if (timerAppMode === 'COUNTDOWN') resetCountdownTimer();
        else resetStopwatch();
    });

    timerLapBtn.addEventListener("click", recordStopwatchLap);
    timerModeBtn.addEventListener("click", toggleTimerMode);


    // --- 6. Application Logic: TO-DO ---
    const getList = () => (JSON.parse(localStorage.getItem('sidekick-todo-list') || '[]')).filter(item => item && item.text);
    const saveList = (list) => localStorage.setItem('sidekick-todo-list', JSON.stringify(list));
    const renderList = () => {
        const list = getList();
        todoListElement.innerHTML = '';
        if (list.length === 0) {
            todoListElement.innerHTML = '<li class="todo-item" style="cursor: default;">No tasks! Add one above.</li>';
            return;
        }
        list.forEach(item => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.dataset.id = item.id;
            li.innerHTML = `<span class="task-text">${item.text}</span>`;
            todoListElement.appendChild(li);
        });
    };
    const addItem = () => {
        const text = todoInput.value.trim();
        if (text) {
            const list = getList();
            list.push({ id: Date.now(), text: text });
            saveList(list);
            renderList();
            todoInput.value = '';
            todoInput.focus();
        }
    };
    const toggleAndDeleteItem = (e) => {
        const li = e.target.closest('.todo-item');
        if (!li || !li.dataset.id) return;
        li.classList.add('checked');
        setTimeout(() => {
            let list = getList();
            list = list.filter(item => item.id !== parseInt(li.dataset.id));
            saveList(list);
            renderList();
        }, 300);
    };
    const deleteAllItems = () => {
        if (confirm("DELETE ALL tasks? This cannot be undone.")) {
            saveList([]);
            renderList();
        }
    };
    addTodoBtn.addEventListener('click', addItem);
    deleteAllBtn.addEventListener('click', deleteAllItems);
    todoListElement.addEventListener('click', toggleAndDeleteItem);
    todoInput.addEventListener('keypress', (e) => e.key === 'Enter' && addItem());

    // --- 7. Application Logic: MUSIC ---
    const loadMusicState = () => {
        const state = JSON.parse(localStorage.getItem('sidekick-music-state') || '{}');
        currentTrackIndex = state.trackIndex || 0;
        musicPlayer.currentTime = state.trackTime || 0;
        musicPlayer.loop = state.loop || false;
        musicLoopBtn.style.color = musicPlayer.loop ? 'var(--screen-text)' : 'var(--button-text)';
        if (musicPlaylist.length > 0) {
            loadTrack(currentTrackIndex);
        } else if (state.trackNames) {
            musicTitle.textContent = `Reload files to restore playlist (Was: ${state.trackNames[currentTrackIndex]})`;
        }
    };
    const saveMusicState = () => {
        const state = {
            trackIndex: currentTrackIndex,
            trackTime: musicPlayer.currentTime,
            loop: musicPlayer.loop,
            trackNames: musicPlaylist.map(file => file.name)
        };
        localStorage.setItem('sidekick-music-state', JSON.stringify(state));
    };
    const loadTrack = (index) => {
        if (musicPlaylist.length === 0) return;
        currentTrackIndex = index;
        musicTitle.textContent = musicPlaylist[currentTrackIndex].name;
        musicPlayer.src = URL.createObjectURL(musicPlaylist[currentTrackIndex]);
        musicPlayer.load();
        if (musicPlayBtn.textContent === 'PAUSE') musicPlayer.play();
    };
    const togglePlayPause = () => {
        unlockAudio();
        if (musicPlayer.paused) {
            musicPlayer.play();
            musicPlayBtn.textContent = 'PAUSE';
        } else {
            musicPlayer.pause();
            musicPlayBtn.textContent = 'PLAY';
        }
        saveMusicState();
    };
    const nextTrack = () => {
        currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length;
        loadTrack(currentTrackIndex);
    };
    const prevTrack = () => {
        currentTrackIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
        loadTrack(currentTrackIndex);
    };
    const toggleLoop = () => {
        musicPlayer.loop = !musicPlayer.loop;
        musicLoopBtn.style.color = musicPlayer.loop ? 'var(--screen-text)' : 'var(--button-text)';
        saveMusicState();
    };
    musicFileInput.addEventListener('change', (e) => {
        musicPlaylist = Array.from(e.target.files);
        if (musicPlaylist.length > 0) {
            loadTrack(0);
            musicPlayBtn.textContent = 'PLAY';
        }
    });
    const updateMusicProgress = () => {
        if (musicPlayer.duration) {
            const progressPercent = (musicPlayer.currentTime / musicPlayer.duration) * 100;
            musicProgressBar.style.width = `${progressPercent}%`;
        }
        saveMusicState();
    };
    const setMusicProgress = (e) => {
        const width = musicProgressContainer.clientWidth;
        const clickX = e.offsetX;
        musicPlayer.currentTime = (clickX / width) * musicPlayer.duration;
    };
    musicPlayBtn.addEventListener('click', togglePlayPause);
    musicNextBtn.addEventListener('click', nextTrack);
    musicPrevBtn.addEventListener('click', prevTrack);
    musicLoopBtn.addEventListener('click', toggleLoop);
    musicPlayer.addEventListener('timeupdate', updateMusicProgress);
    musicPlayer.addEventListener('ended', () => !musicPlayer.loop && nextTrack());
    musicProgressContainer.addEventListener('click', setMusicProgress);

    // --- 8. Application Logic: TRIVIA ---
    const decodeHTML = (html) => {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    };
    const getNewQuestion = async () => {
        triviaCategory.textContent = "LOADING...";
        triviaQuestion.textContent = "...";
        triviaMessage.textContent = "";
        triviaInput.value = "";
        triviaSubmitBtn.disabled = true;
        currentTriviaAnswer = "";
        try {
            const response = await fetch('https://opentdb.com/api.php?amount=1');
            const data = await response.json();
            if (data.response_code !== 0) {
                throw new Error('API returned an error.');
            }
            const questionData = data.results[0];
            triviaCategory.textContent = `CATEGORY: ${decodeHTML(questionData.category)}`;
            triviaQuestion.textContent = decodeHTML(questionData.question);
            currentTriviaAnswer = decodeHTML(questionData.correct_answer);
            triviaSubmitBtn.disabled = false;
        } catch (error) {
            triviaCategory.textContent = "ERROR";
            triviaQuestion.textContent = "Failed to load question. Check connection.";
        }
    };
    const checkAnswer = () => {
        const userAnswer = triviaInput.value.trim().toLowerCase();
        const correctAnswer = currentTriviaAnswer.trim().toLowerCase();
        if (userAnswer === correctAnswer) {
            triviaMessage.textContent = "CORRECT!";
            triviaMessage.style.color = 'var(--screen-text)';
        } else {
            triviaMessage.textContent = `INCORRECT. Answer: ${currentTriviaAnswer}`;
            triviaMessage.style.color = '#ff4141';
        }
        triviaSubmitBtn.disabled = true;
    };
    triviaSubmitBtn.addEventListener('click', checkAnswer);
    triviaNextBtn.addEventListener('click', getNewQuestion);
    triviaInput.addEventListener('keypress', (e) => e.key === 'Enter' && checkAnswer());

    // --- 9. Global Event Listeners ---
    appButtons.forEach(button => {
        button.addEventListener('click', () => {
            const appName = button.getAttribute('data-app');
            launchAppSequence(appName);
        });
    });

}); // End of DOMContentLoaded