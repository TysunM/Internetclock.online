document.addEventListener('DOMContentLoaded', () => {
    // --- Global State & Elements ---
    const state = {
        activeMode: 'big-clock-mode',
        bigClock: {
            intervalId: null,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            is24Hour: false,
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
        body: document.body,
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
            state.bigClock.intervalId = null;
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

    // --- BIG CLOCK LOGIC ---
    function updateBigClock() {
        try {
            const now = new Date();
            const timeOptions = { 
                timeZone: state.bigClock.timeZone, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit', 
                hour12: !state.bigClock.is24Hour 
            };
            const dateOptions = { timeZone: state.bigClock.timeZone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

            elements.bigClockDisplay.textContent = now.toLocaleTimeString('en-US', timeOptions);
            elements.dateDisplay.textContent = now.toLocaleDateString('en-US', dateOptions);
        } catch (err) {
            console.error("Error updating big clock:", err);
            elements.bigClockDisplay.textContent = "Error";
            if (state.bigClock.intervalId) clearInterval(state.bigClock.intervalId);
        }
    }
    
    function handleTimeFormatToggle() {
        state.bigClock.is24Hour = elements.timeFormatToggle.checked;
        elements.body.dataset.timeFormat = state.bigClock.is24Hour ? '24h' : '12h';
        updateBigClock(); // Update immediately on toggle
    }

    function populateTimezones() {
        try {
            const timezones = Intl.supportedValuesOf('timeZone');
            timezones.forEach(tz => {
                const option = document.createElement('option');
                option.value = tz;
                option.textContent = tz.replace(/_/g, ' ');
                elements.timezoneSelector.appendChild(option);
            });
            elements.timezoneSelector.value = state.bigClock.timeZone;
        } catch (e) {
            console.error("Timezone population failed:", e);
            elements.timezoneSelector.style.display = 'none';
        }
    }

    function initBigClock() {
        if (state.bigClock.intervalId) clearInterval(state.bigClock.intervalId);
        updateBigClock();
        state.bigClock.intervalId = setInterval(updateBigClock, 1000);
    }

    // --- STOPWATCH LOGIC ---
    function formatStopwatchTime(ms) {
        let totalSeconds = Math.floor(ms / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        let milliseconds = ms % 1000;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}<span class="milliseconds">.${String(milliseconds).padStart(3, '0')}</span>`;
    }

    function updateStopwatchDisplay() {
        const currentTime = state.stopwatch.isRunning 
            ? Date.now() - state.stopwatch.startTime + state.stopwatch.elapsedTime 
            : state.stopwatch.elapsedTime;
        elements.stopwatchDisplay.innerHTML = formatStopwatchTime(currentTime);
    }

    function stopwatchLoop() {
        if (!state.stopwatch.isRunning) return;
        updateStopwatchDisplay();
        state.stopwatch.animationFrameId = requestAnimationFrame(stopwatchLoop);
    }

    function startStopwatch() {
        if (state.stopwatch.isRunning) { // Logic to STOP
            state.stopwatch.isRunning = false;
            state.stopwatch.elapsedTime += Date.now() - state.stopwatch.startTime;
            cancelAnimationFrame(state.stopwatch.animationFrameId);
            updateStopwatchDisplay(); 
            elements.startStopBtn.textContent = "START";
            elements.lapResetBtn.textContent = "RESET";
        } else { // Logic to START
            state.stopwatch.isRunning = true;
            state.stopwatch.startTime = Date.now();
            elements.startStopBtn.textContent = "STOP";
            elements.lapResetBtn.textContent = "LAP";
            requestAnimationFrame(stopwatchLoop);
        }
    }

    function lapResetStopwatch() {
        if (state.stopwatch.isRunning) { // Lap
            const lapTime = Date.now() - state.stopwatch.startTime + state.stopwatch.elapsedTime;
            state.stopwatch.laps.push(lapTime);
            const lapElement = document.createElement('div');
            lapElement.innerHTML = `Lap ${state.stopwatch.laps.length}: ${formatStopwatchTime(lapTime)}`;
            elements.lapsContainer.prepend(lapElement);
        } else { // Reset
            state.stopwatch.elapsedTime = 0;
            state.stopwatch.laps = [];
            elements.lapsContainer.innerHTML = '';
            updateStopwatchDisplay();
        }
    }

    // --- FULLSCREEN LOGIC ---
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    // --- INITIALIZATION ---
    function init() {
        // Event Listeners
        elements.navTabs.forEach(tab => tab.addEventListener('click', () => switchMode(tab.dataset.mode)));
        elements.timezoneSelector.addEventListener('change', (e) => {
            state.bigClock.timeZone = e.target.value;
            initBigClock();
        });
        elements.timeFormatToggle.addEventListener('change', handleTimeFormatToggle);
        elements.startStopBtn.addEventListener('click', startStopwatch);
        elements.lapResetBtn.addEventListener('click', lapResetStopwatch);
        elements.fullscreenBtn.addEventListener('click', toggleFullscreen);

        // Initial Setup
        populateTimezones();
        initBigClock();
    }

    init();
});
