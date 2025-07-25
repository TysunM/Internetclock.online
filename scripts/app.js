document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navButtons = document.querySelectorAll('.nav-btn');
    const settingsButtons = document.querySelectorAll('.settings-btn');

    // Store interval IDs to clear them when switching modes
    let activeInterval = null;

    // --- UTILITY FUNCTIONS ---
    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    // --- HTML TEMPLATES FOR EACH CLOCK MODE ---
    const templates = {
        'big-clock-btn': () => `
            <div class="ad-placeholder-side">Ad 200x200</div>
            <div class="clock-face">
                <div class="date-display" id="big-clock-date"></div>
                <div class="time-display" id="big-clock-time">12:00:00 AM</div>
                <div class="timezone-display" id="big-clock-timezone"></div>
            </div>
            <div class="ad-placeholder-side">Ad 200x200</div>
        `,
        'world-clock-btn': () => `
            <div class="ad-placeholder-side">Ad 200x200</div>
            <div class="clock-face">
                <div class="feature-title">World Clock</div>
                <div class="time-display">Feature Coming Soon!</div>
            </div>
            <div class="ad-placeholder-side">Ad 200x200</div>
        `,
        'stopwatch-btn': () => `
            <div class="ad-placeholder-side">Ad 200x200</div>
            <div class="clock-face">
                 <div class="feature-title">Stopwatch</div>
                 <div class="time-display" id="stopwatch-display">00:00:00</div>
                 <div class="controls">
                    <button class="control-btn start-btn" id="stopwatch-start">START</button>
                    <button class="control-btn stop-btn" id="stopwatch-stop">STOP</button>
                    <button class="control-btn reset-btn" id="stopwatch-reset">RESET</button>
                 </div>
            </div>
            <div class="ad-placeholder-side">Ad 200x200</div>
        `,
        'focus-mode-btn': () => `
            <div class="ad-placeholder-side">Ad 200x200</div>
            <div class="clock-face">
                <div class="feature-title">Focus (Pomodoro)</div>
                <div class="time-display">Feature Coming Soon!</div>
            </div>
            <div class="ad-placeholder-side">Ad 200x200</div>
        `,
        'alarm-clock-btn': () => `
            <div class="ad-placeholder-side">Ad 200x200</div>
            <div class="clock-face">
                <div class="feature-title">Alarm Clock</div>
                <div class="time-display" id="alarm-time-display">12:00:00</div>
                <div class="controls">
                    <button class="control-btn set-alarm-btn" id="set-alarm-btn">SET ALARM TIME</button>
                </div>
            </div>
            <div class="ad-placeholder-side">Ad 200x200</div>
        `,
        'timer-btn': () => `
            <div class="ad-placeholder-side">Ad 200x200</div>
            <div class="clock-face">
                 <div class="feature-title">Timer</div>
                 <div class="time-display" id="timer-display">00:00:00</div>
                 <div class="controls timer-inputs">
                    <input type="number" id="timer-hours" min="0" value="0"> H
                    <input type="number" id="timer-minutes" min="0" max="59" value="0"> M
                    <input type="number" id="timer-seconds" min="0" max="59" value="10"> S
                 </div>
                 <div class="controls">
                    <button class="control-btn start-btn" id="timer-start">START</button>
                    <button class="control-btn stop-btn" id="timer-stop">STOP</button>
                    <button class="control-btn reset-btn" id="timer-reset">RESET</button>
                 </div>
            </div>
            <div class="ad-placeholder-side">Ad 200x200</div>
        `
    };

    // --- LOGIC FOR EACH MODE ---
    const logic = {
        'big-clock-btn': () => {
            const timeEl = document.getElementById('big-clock-time');
            const dateEl = document.getElementById('big-clock-date');
            const timezoneEl = document.getElementById('big-clock-timezone');
            
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            timezoneEl.textContent = timezone.replace(/_/g, ' ');

            activeInterval = setInterval(() => {
                const now = new Date();
                timeEl.textContent = now.toLocaleTimeString();
                dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            }, 1000);
        },
        'stopwatch-btn': () => {
            const display = document.getElementById('stopwatch-display');
            let startTime = 0;
            let elapsedTime = 0;
            let running = false;

            document.getElementById('stopwatch-start').addEventListener('click', () => {
                if (running) return;
                running = true;
                startTime = Date.now() - elapsedTime;
                activeInterval = setInterval(() => {
                    elapsedTime = Date.now() - startTime;
                    display.textContent = formatTime(elapsedTime);
                }, 100); // Update every 100ms for smoother display
            });

            document.getElementById('stopwatch-stop').addEventListener('click', () => {
                if (!running) return;
                running = false;
                clearInterval(activeInterval);
            });

            document.getElementById('stopwatch-reset').addEventListener('click', () => {
                running = false;
                clearInterval(activeInterval);
                elapsedTime = 0;
                display.textContent = "00:00:00";
            });
        },
        'alarm-clock-btn': () => {
             const timeEl = document.getElementById('alarm-time-display');
             activeInterval = setInterval(() => {
                const now = new Date();
                timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }, 1000);
            document.getElementById('set-alarm-btn').addEventListener('click', () => {
                const alarmTime = prompt("Set alarm time (e.g., 07:30)");
                if(alarmTime) alert(`Alarm set for ${alarmTime}! (Full feature in development)`);
            });
        },
        'timer-btn': () => {
            const display = document.getElementById('timer-display');
            let timerTime = 0;
            let running = false;

            const updateDisplay = () => display.textContent = formatTime(timerTime);

            const startTimer = () => {
                if (running || timerTime <= 0) return;
                running = true;
                activeInterval = setInterval(() => {
                    timerTime -= 1000;
                    if (timerTime < 0) timerTime = 0;
                    updateDisplay();
                    if (timerTime === 0) {
                        clearInterval(activeInterval);
                        running = false;
                        alert("Time's up!");
                    }
                }, 1000);
            };

            const stopTimer = () => {
                running = false;
                clearInterval(activeInterval);
            };

            const resetTimer = () => {
                stopTimer();
                const hours = parseInt(document.getElementById('timer-hours').value) || 0;
                const minutes = parseInt(document.getElementById('timer-minutes').value) || 0;
                const seconds = parseInt(document.getElementById('timer-seconds').value) || 0;
                timerTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
                updateDisplay();
            };
            
            document.getElementById('timer-start').addEventListener('click', startTimer);
            document.getElementById('timer-stop').addEventListener('click', stopTimer);
            document.getElementById('timer-reset').addEventListener('click', resetTimer);

            // Set initial value
            resetTimer();
        }
    };

    // --- EVENT HANDLING ---
    function switchMode(event) {
        if (activeInterval) {
            clearInterval(activeInterval);
            activeInterval = null;
        }

        const buttonId = event.target.id;
        navButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        if (templates[buttonId]) {
            mainContent.innerHTML = templates[buttonId]();
        }
        if (logic[buttonId]) {
            logic[buttonId]();
        }
    }

    navButtons.forEach(button => button.addEventListener('click', switchMode));
    
    settingsButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert(`The "${button.textContent}" feature is coming soon!`);
        });
    });

    // Load a default mode on page load
    document.getElementById('big-clock-btn').click();
});
