let startTime = 0;
let elapsed = 0;
let running = false;
let interval;
let lapCounter = 1;

const timerDisplay = document.getElementById("timer");
const lapList = document.getElementById("lapList");

document.getElementById("startBtn").addEventListener("click", start);
document.getElementById("pauseBtn").addEventListener("click", pause);
document.getElementById("resetBtn").addEventListener("click", reset);
document.getElementById("lapBtn").addEventListener("click", recordLap);

function start() {
    if (running) return;
    running = true;
    startTime = Date.now() - elapsed;

    interval = setInterval(update, 1000); // update every second
}

function pause() {
    running = false;
    clearInterval(interval);
}

function reset() {
    running = false;
    clearInterval(interval);
    elapsed = 0;
    lapCounter = 1;
    timerDisplay.textContent = "00:00:00";
    lapList.innerHTML = "";
}

function update() {
    elapsed = Date.now() - startTime;

    let totalSeconds = Math.floor(elapsed / 1000);

    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    timerDisplay.textContent =
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;
}

function recordLap() {
    if (!running) return;

    let li = document.createElement("li");
    li.textContent = `Lap ${lapCounter}: ${timerDisplay.textContent}`;
    lapList.appendChild(li);
    lapCounter++;
}
