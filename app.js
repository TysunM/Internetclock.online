
document.addEventListener('DOMContentLoaded', () => {
    // --- Global State & Elements ---
    const state = {
        activeMode: 'big-clock-mode',
        bigClock: {
            intervalId: null,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            hourFormat24: false,
        },
        stopwatch: {
            startTime: 0,
            elapsedTime: 0,
            animationFrameId: null,
            isRunning: false,
            laps: [],
        }
    };

    const elements = {
        navTabs: document.querySelectorAll('.nav-tab:not(.disabled)'),
        clockModes: document.querySelectorAll('.clock-mode'),
        bigClockDisplay: document.querySelector('#big-clock-mode .time-display'),
        dateDisplay: document.querySelector('#big-clock-mode .date-display'),
        timezoneSelector: document.getElementById('timezone-selector'),
        timeFormatToggle: document.getElementById('time-format-toggle'),
        stopwatchDisplay: document.querySelector('#stopwatch-mode .time-display'),
        startStopBtn: document.getElementById('start-stop-btn'),
        lapResetBtn: document.getElementById('lap-reset-btn'),
        lapsContainer: document.getElementById('laps-container'),
        fullscreenBtn: document.getElementById('fullscreen-btn'),
    };

    // --- Mode Switching ---
    function switchMode(modeId) {
        if (state.activeMode === modeId) return;
        if (state.activeMode === 'big-clock-mode') {
            clearInterval(state.bigClock.intervalId);
        }
        state.activeMode = modeId;

        elements.navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === modeId);
        });

        elements.clockModes.forEach(mode => {
            mode.classList.toggle('active', mode.id === modeId);
        });

        if (modeId === 'big-clock-mode') initBigClock();
        if (modeId === 'stopwatch-mode') updateStopwatchDisplay();
    }

    // --- BIG CLOCK ---
    function updateBigClock() {
        try {
            const now = new Date();
            const timeOptions = {
                timeZone: state.bigClock.timeZone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: !state.bigClock.hourFormat24
            };
            const dateOptions = {
                timeZone: state.bigClock.timeZone,
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            elements.bigClockDisplay.textContent = now.toLocaleTimeString('en-US', timeOptions);
            elements.dateDisplay.textContent = now.toLocaleDateString('en-US', dateOptions);
        } catch (err) {
            console.error("Big clock update failed:", err);
            elements.bigClockDisplay.textContent = "Error";
        }
    }

    function initBigClock() {
        clearInterval(state.bigClock.intervalId);
        updateBigClock();
        state.bigClock.intervalId = setInterval(updateBigClock, 1000);
    }

    function populateTimezones() {
        try {
            const zones = Intl.supportedValuesOf('timeZone');
            zones.forEach(tz => {
                const option = document.createElement('option');
                option.value = tz;
                option.textContent = tz.replace(/_/g, ' ');
                elements.timezoneSelector.appendChild(option);
            });
            elements.timezoneSelector.value = state.bigClock.timeZone;
        } catch (err) {
            console.error("Timezones failed to load:", err);
            elements.timezoneSelector.style.display = 'none';
        }
    }

    // --- STOPWATCH ---
    function formatStopwatchTime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSec % 60).padStart(2, '0');
        const milliseconds = String(ms % 1000).padStart(3, '0');
        return \`\${hours}:\${minutes}:\${seconds}<span class="milliseconds">.\${milliseconds}</span>\`;
    }

    function updateStopwatchDisplay() {
        const elapsed = state.stopwatch.isRunning
            ? Date.now() - state.stopwatch.startTime + state.stopwatch.elapsedTime
            : state.stopwatch.elapsedTime;
        elements.stopwatchDisplay.innerHTML = formatStopwatchTime(elapsed);
    }

    function stopwatchLoop() {
        if (!state.stopwatch.isRunning) return;
        updateStopwatchDisplay();
        state.stopwatch.animationFrameId = requestAnimationFrame(stopwatchLoop);
    }

    function startStopwatch() {
        if (state.stopwatch.isRunning) {
            state.stopwatch.isRunning = false;
            state.stopwatch.elapsedTime += Date.now() - state.stopwatch.startTime;
            cancelAnimationFrame(state.stopwatch.animationFrameId);
            elements.startStopBtn.textContent = "START";
            elements.lapResetBtn.textContent = "RESET";
        } else {
            state.stopwatch.isRunning = true;
            state.stopwatch.startTime = Date.now();
            elements.startStopBtn.textContent = "STOP";
            elements.lapResetBtn.textContent = "LAP";
            requestAnimationFrame(stopwatchLoop);
        }
    }

    function lapResetStopwatch() {
        if (state.stopwatch.isRunning) {
            const lapTime = Date.now() - state.stopwatch.startTime + state.stopwatch.elapsedTime;
            state.stopwatch.laps.push(lapTime);
            const div = document.createElement('div');
            div.innerHTML = \`Lap \${state.stopwatch.laps.length}: \${formatStopwatchTime(lapTime)}\`;
            elements.lapsContainer.prepend(div);
        } else {
            state.stopwatch.elapsedTime = 0;
            state.stopwatch.laps = [];
            elements.lapsContainer.innerHTML = '';
            updateStopwatchDisplay();
        }
    }

    // --- FULLSCREEN ---
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }

    // --- INIT ---
    function init() {
        elements.navTabs.forEach(tab => tab.addEventListener('click', () => switchMode(tab.dataset.mode)));
        elements.timezoneSelector.addEventListener('change', e => {
            state.bigClock.timeZone = e.target.value;
            updateBigClock();
        });
        elements.timeFormatToggle.addEventListener('change', e => {
            state.bigClock.hourFormat24 = e.target.checked;
            updateBigClock();
        });
        elements.startStopBtn.addEventListener('click', startStopwatch);
        elements.lapResetBtn.addEventListener('click', lapResetStopwatch);
        elements.fullscreenBtn.addEventListener('click', toggleFullscreen);

        populateTimezones();
        initBigClock();
    }

    init();
});
