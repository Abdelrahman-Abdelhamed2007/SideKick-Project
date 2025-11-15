

let timerInterval;
let timeLeft;
let isPaused = false;

const timerDisplay = document.getElementById("timer");
const minutesInput = document.getElementById("minutesInput");
const alarm = document.getElementById("alarmSound");

document.getElementById("startBtn").addEventListener("click", startTimer);
document.getElementById("pauseBtn").addEventListener("click", pauseTimer);
document.getElementById("resetBtn").addEventListener("click", resetTimer);

function startTimer() {
    if (!isPaused) {
        let minutes = parseInt(minutesInput.value);
        timeLeft = minutes * 60;
    }
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    isPaused = false;
}

function updateTimer() {
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerDisplay.textContent = "GAME OVER";
        alarm.play();
        return;
    }

     timeLeft--;
    let mins = Math.floor(timeLeft / 60);
    let secs = timeLeft % 60;

    timerDisplay.textContent =
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function pauseTimer() {
    clearInterval(timerInterval);
    isPaused = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    isPaused = false;

    let minutes = parseInt(minutesInput.value);
    timeLeft = minutes * 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2,'0')}:00`;
}

