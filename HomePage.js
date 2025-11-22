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
8.  Application Logic: TRIVIA (UPDATED to Multiple Choice)
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
    const timerInputsRow = document.getElementById("timer-inputs-row");
    const timerHoursInput = document.getElementById("timer-hours-input");
    const timerMinutesInput = document.getElementById("timer-minutes-input");
    const timerSecondsInput = document.getElementById("timer-seconds-input");
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
    const triviaChoicesContainer = document.getElementById('trivia-choices-container');
    const triviaChoiceButtons = document.querySelectorAll('.trivia-choice-btn');
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
            const hours = parseInt(timerHoursInput.value) || 0;
            const minutes = parseInt(timerMinutesInput.value) || 0;
            const seconds = parseInt(timerSecondsInput.value) || 0;

            // Calculate total seconds
            countdownTimeLeft = (hours * 3600) + (minutes * 60) + seconds;

            // Default to 25 mins if 0 is entered
            if (countdownTimeLeft <= 0) {
                countdownTimeLeft = 25 * 60;
                timerMinutesInput.value = 25;
            }
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

        // Format HH:MM:SS
        let h = Math.floor(countdownTimeLeft / 3600);
        let m = Math.floor((countdownTimeLeft % 3600) / 60);
        let s = countdownTimeLeft % 60;

        timerDisplayElement.textContent =
            `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function pauseCountdownTimer() {
        clearInterval(countdownTimerInterval);
        isCountdownPaused = true;
    }

    function resetCountdownTimer() {
        clearInterval(countdownTimerInterval);
        isCountdownPaused = false;

        // Read values to reset display to "Ready" state
        const h = parseInt(timerHoursInput.value) || 0;
        const m = parseInt(timerMinutesInput.value) || 0;
        const s = parseInt(timerSecondsInput.value) || 0;

        // Use 25m default if inputs are empty/zero
        if (h === 0 && m === 0 && s === 0) {
            timerDisplayElement.textContent = "00:25:00";
        } else {
            timerDisplayElement.textContent =
                `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

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
            timerInputsRow.classList.remove('hidden');
            timerLapBtn.classList.add('hidden');
            timerLapList.classList.add('hidden');

            timerStartBtn.classList.remove('hidden');
            timerPauseBtn.classList.remove('hidden');
            timerResetBtn.classList.remove('hidden');

            resetCountdownTimer();
            resetStopwatch();
        } else {
            timerInputsRow.classList.add('hidden');
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
    const getList = () => {
        const stored = JSON.parse(localStorage.getItem('sidekick-todo-list') || '[]');
        return Array.isArray(stored) ? stored : [];
    };
    const saveList = (list) => localStorage.setItem('sidekick-todo-list', JSON.stringify(list));
    const addItem = () => {
        const text = todoInput.value.trim();
        if (text) {
            const list = getList();
            const now = new Date();
            const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
            const newItem = {
                id: Date.now(),
                text: text,
                date: dateStr,
                completed: false
            };
            list.push(newItem);
            saveList(list);
            renderList();
            todoInput.value = '';
            todoInput.focus();
        }
    };
    const deleteAllItems = () => {
        if (confirm("DELETE ALL tasks?")) {
            saveList([]);
            renderList();
        }
    };
    const renderList = () => {
        const list = getList();
        todoListElement.innerHTML = '';
        if (list.length === 0) {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.style.cursor = 'default';
            li.textContent = "No tasks. Add one!";
            todoListElement.appendChild(li);
            return;
        }
        list.forEach(item => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            if (item.completed) li.classList.add('completed');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = item.completed;
            checkbox.addEventListener('change', () => {
                item.completed = checkbox.checked;
                saveList(list);
                renderList();
            });
            const taskText = document.createElement('span');
            taskText.textContent = item.text;
            taskText.className = 'task-text';
            if (item.completed) taskText.classList.add('completed');
            const dateSpan = document.createElement('span');
            dateSpan.textContent = item.date;
            dateSpan.className = 'todo-date';
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'DEL';
            deleteBtn.className = 'delete-btn';
            deleteBtn.addEventListener('click', () => {
                const newList = list.filter(t => t.id !== item.id);
                saveList(newList);
                renderList();
            });
            li.appendChild(checkbox);
            li.appendChild(taskText);
            li.appendChild(dateSpan);
            li.appendChild(deleteBtn);
            todoListElement.appendChild(li);
        });
    };
    addTodoBtn.addEventListener('click', addItem);
    deleteAllBtn.addEventListener('click', deleteAllItems);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });


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

    // --- 8. Application Logic: TRIVIA (UPDATED MULTIPLE CHOICE) ---
    const getNewQuestion = async () => {
        triviaCategory.textContent = "LOADING...";
        triviaQuestion.textContent = "...";
        triviaMessage.textContent = "";
        triviaNextBtn.classList.add('hidden');

        // Reset buttons
        triviaChoiceButtons.forEach(btn => {
            btn.textContent = "";
            btn.disabled = true;
            btn.style.backgroundColor = "var(--screen-text)";
            btn.style.color = "#000";
        });

        try {
            // Using The Trivia API
            const response = await fetch('https://the-trivia-api.com/api/questions?limit=1&difficulty=easy');
            const data = await response.json();

            if (!data || data.length === 0) throw new Error('No question received');

            const questionData = data[0];
            triviaCategory.textContent = `CATEGORY: ${questionData.category.toUpperCase()}`;
            triviaQuestion.textContent = questionData.question;
            currentTriviaAnswer = questionData.correctAnswer;

            // Prepare choices
            const allChoices = [...questionData.incorrectAnswers];
            // Take only 2 incorrect choices to make 3 total
            while (allChoices.length > 2) allChoices.pop();

            allChoices.push(currentTriviaAnswer);

            // Shuffle choices
            allChoices.sort(() => Math.random() - 0.5);

            // Render to buttons
            triviaChoiceButtons.forEach((btn, index) => {
                if (allChoices[index]) {
                    btn.textContent = allChoices[index];
                    btn.disabled = false;
                    btn.onclick = () => checkAnswer(btn, allChoices[index]);
                } else {
                    btn.textContent = "";
                    btn.disabled = true;
                }
            });

        } catch (error) {
            console.error(error);
            triviaCategory.textContent = "ERROR";
            triviaQuestion.textContent = "Failed to load question. Check connection.";
        }
    };

    const checkAnswer = (btn, selectedAnswer) => {
        if (selectedAnswer === currentTriviaAnswer) {
            triviaMessage.textContent = "CORRECT!";
            triviaMessage.style.color = 'var(--screen-text)';
            btn.style.backgroundColor = "var(--screen-text)"; // Keep green
        } else {
            triviaMessage.textContent = `WRONG. Answer: ${currentTriviaAnswer}`;
            triviaMessage.style.color = '#ff4141';
            btn.style.backgroundColor = "#ff4141"; // Red
            btn.style.color = "#fff";
        }

        // Disable all buttons after answering
        triviaChoiceButtons.forEach(b => b.disabled = true);
        triviaNextBtn.classList.remove('hidden');
    };

    triviaNextBtn.addEventListener('click', getNewQuestion);

    // --- 9. Global Event Listeners ---
    appButtons.forEach(button => {
        button.addEventListener('click', () => {
            const appName = button.getAttribute('data-app');
            launchAppSequence(appName);
        });
    });

}); // End of DOMContentLoaded