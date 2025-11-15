document.addEventListener('DOMContentLoaded', () => {
    // --- Shared DOM Elements ---
    const terminalOutput = document.getElementById('terminal-output');
    const launchApp = document.getElementById('launch-app');
    const launchText = document.getElementById('launch-text');
    const appButtons = document.querySelectorAll('.app-btn');
    const appViews = document.querySelectorAll('.app-view');
    const monitor = document.querySelector('.monitor');

    // --- Timer Elements (Updated) ---
    const timerApp = document.getElementById('timer-app');
    const timerHours = document.getElementById('timer-hours');
    const timerMinutes = document.getElementById('timer-minutes');
    const timerSeconds = document.getElementById('timer-seconds');
    const timerInputGroup = document.querySelector('.timer-input-group'); // New
    const inputHours = document.getElementById('input-hours');
    const inputMinutes = document.getElementById('input-minutes');
    const inputSeconds = document.getElementById('input-seconds');
    const startPauseBtn = document.getElementById('start-pause-btn');
    const resetTimerBtn = document.getElementById('reset-timer-btn');
    const timerModeBtn = document.getElementById('timer-mode-btn'); // New
    const timerMessage = document.getElementById('timer-message');

    // --- To-Do Elements ---
    const todoApp = document.getElementById('todo-app');
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const todoListElement = document.getElementById('todo-list');

    // --- Music Elements ---
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

    // --- Trivia Elements ---
    const triviaApp = document.getElementById('trivia-app');
    const triviaCategory = document.getElementById('trivia-category');
    const triviaQuestion = document.getElementById('trivia-question');
    const triviaInput = document.getElementById('trivia-input');
    const triviaSubmitBtn = document.getElementById('trivia-submit-btn');
    const triviaNextBtn = document.getElementById('trivia-next-btn');
    const triviaMessage = document.getElementById('trivia-message');

    // --- State Variables ---
    let countdownInterval;
    let timeRemaining = 0;
    let timeElapsed = 0;
    let timerAppMode = 'COUNTDOWN'; // Replaces old 'timerMode'
    let chimeInterval;
    let musicPlaylist = [];
    let currentTrackIndex = 0;
    let currentTriviaAnswer = "";
    let permanentBootText = "";
    let audioCtx = null;

    // --- Audio Logic ---
    const createAudioContext = () => {
        if (audioCtx) {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
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
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            return audioCtx;
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
            return null;
        }
    };

    const unlockAudio = () => {
        if (!audioCtx) {
            createAudioContext();
        }
    };

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

    const playChimeBeep = () => {
        if (!audioCtx) return; 
        const context = audioCtx;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1200, context.currentTime);
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.1);
    };

    const startChimeSequence = () => {
        clearInterval(chimeInterval);
        let count = 0;
        chimeInterval = setInterval(() => {
            if (count % 4 === 0 || count % 4 === 1) {
                playChimeBeep();
            }
            count++;
            if (count > 20) {
                clearInterval(chimeInterval);
            }
        }, 250);
    };

    // --- Core View Switching Logic ---
    const switchView = (appName) => {
        terminalOutput.classList.add('hidden');
        appViews.forEach(view => view.classList.add('hidden'));
        if (appName === 'timer') {
            timerApp.classList.remove('hidden');
            timerAppMode = 'COUNTDOWN'; // Default to countdown
            updateTimerModeUI();
            resetTimer();
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

    // --- Launch Sequence ---
    const launchAppSequence = (appName) => {
        const targetAppName = appName.toUpperCase();
        beep();
        terminalOutput.classList.add('hidden');
        appViews.forEach(view => view.classList.add('hidden'));
        launchApp.classList.remove('hidden');
        clearInterval(countdownInterval);
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

    // --- Terminal Initial Typing ---
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

    // --- 1. Timer Logic (RECONCEPTUALIZED) ---
    const formatTime = (totalSeconds) => {
        if (totalSeconds < 0) totalSeconds = 0;
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');
        return { h, m, s };
    };

    const updateDisplay = () => {
        const totalSeconds = (timerAppMode === 'COUNTDOWN') ? timeRemaining : timeElapsed;
        const { h, m, s } = formatTime(totalSeconds);
        timerHours.textContent = h;
        timerMinutes.textContent = m;
        timerSeconds.textContent = s;
    };

    const updateTimerModeUI = () => {
        if (timerAppMode === 'COUNTDOWN') {
            timerInputGroup.classList.remove('hidden');
            timerMessage.textContent = "MODE: COUNTDOWN";
        } else { // STOPWATCH mode
            timerInputGroup.classList.add('hidden');
            timerMessage.textContent = "MODE: STOPWATCH";
        }
    };

    const toggleTimerMode = () => {
        timerAppMode = (timerAppMode === 'COUNTDOWN') ? 'STOPWATCH' : 'COUNTDOWN';
        updateTimerModeUI();
        resetTimer();
    };

    const startStopwatch = () => {
        startPauseBtn.textContent = 'PAUSE';
        timerMessage.textContent = "STOPWATCH RUNNING...";
        countdownInterval = setInterval(() => {
            timeElapsed++;
            updateDisplay();
        }, 1000);
    };

    const startCountdown = (totalSeconds) => {
        timeRemaining = totalSeconds;
        updateDisplay();
        startPauseBtn.textContent = 'PAUSE';
        timerMessage.textContent = "COUNTDOWN ACTIVE...";
        countdownInterval = setInterval(() => {
            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
                timeRemaining = 0;
                updateDisplay();
                startChimeSequence();
                resetTimer();
                timerMessage.textContent = "COUNTDOWN COMPLETE!";
                return;
            }
            timeRemaining--;
            updateDisplay();
        }, 1000);
    };

    const toggleTimer = () => {
        unlockAudio(); // Unlock audio on first timer click

        if (startPauseBtn.textContent === 'START') {
            if (timerAppMode === 'COUNTDOWN') {
                const h = parseInt(inputHours.value) || 0;
                const m = parseInt(inputMinutes.value) || 0;
                const s = parseInt(inputSeconds.value) || 0;
                const totalSeconds = (h * 3600) + (m * 60) + s;
                inputHours.value = ''; inputMinutes.value = ''; inputSeconds.value = '';
                
                if (totalSeconds > 0) {
                    startCountdown(totalSeconds);
                } else {
                    timerMessage.textContent = "ENTER TIME FOR COUNTDOWN";
                }
            } else { // STOPWATCH mode
                startStopwatch();
            }
        } else { // PAUSE logic
            clearInterval(countdownInterval);
            startPauseBtn.textContent = 'START';
            timerMessage.textContent = `${timerAppMode} PAUSED.`;
        }
    };

    const resetTimer = () => {
        clearInterval(countdownInterval);
        clearInterval(chimeInterval);
        timeRemaining = 0;
        timeElapsed = 0;
        updateDisplay();
        startPauseBtn.textContent = 'START';
        
        // Reset message based on the current mode
        updateTimerModeUI();
    };

    startPauseBtn.addEventListener('click', toggleTimer);
    resetTimerBtn.addEventListener('click', resetTimer);
    timerModeBtn.addEventListener('click', toggleTimerMode); // Add listener for new button

    // --- 2. To-Do Logic ---
    // ✅ OPTIMIZED: Added filter to prevent errors from corrupted localStorage
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

    // --- 3. Music Logic ---
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
        unlockAudio(); // Also unlock audio when playing music
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
    musicFileInput.addEventListener('change', (e) => {
        musicPlaylist = Array.from(e.target.files);
        if (musicPlaylist.length > 0) {
            loadTrack(0);
            musicPlayBtn.textContent = 'PLAY';
        }
    });
    musicPlayBtn.addEventListener('click', togglePlayPause);
    musicNextBtn.addEventListener('click', nextTrack);
    musicPrevBtn.addEventListener('click', prevTrack);
    musicLoopBtn.addEventListener('click', toggleLoop);
    musicPlayer.addEventListener('timeupdate', updateMusicProgress);
    musicPlayer.addEventListener('ended', () => !musicPlayer.loop && nextTrack());
    musicProgressContainer.addEventListener('click', setMusicProgress);

    // --- 4. Trivia Logic ---
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

    // --- Main App Button Handler ---
    appButtons.forEach(button => {
        button.addEventListener('click', () => {
            const appName = button.getAttribute('data-app');
            launchAppSequence(appName);
        });
    });
});