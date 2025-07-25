document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navButtons = document.querySelectorAll('.nav-btn');

    // Store interval IDs to clear them when switching modes
    let activeInterval = null;

    // --- HTML TEMPLATES FOR EACH CLOCK MODE ---

    const templates = {
        'big-clock-btn': () => `
            <div class="ad-placeholder-side">Ad 200x200</div>
            <div class="clock-face">
                <div class="date-display" id="big-clock-date"></div>
                <div class="time-display" id="big-clock-time">12:00:00 AM</div>
                <div class="timezone-display">LOCATION (TIME ZONE)</div>
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
                    <button class="control-btn start-btn" id="set-alarm-btn">SET ALARM TIME</button>
                </div>
            </div>
            <div class="ad-placeholder-side">Ad 200x200</div>
        `,
        'timer-btn': () => `
            <div class="ad-placeholder-side">Ad 200x200</div>
            <div class="clock-face">
                 <div class="feature-title">Timer</div>
                 <div class="time-display" id="timer-display">00:00:00</div>
                 <div class="controls">
                    <button class="control-btn start-btn" id="timer-start">START</button>
                    <button class="control-btn stop-btn" id="timer-stop">STOP</button>
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
            activeInterval = setInterval(() => {
                const now = new Date();
                timeEl.textContent = now.toLocaleTimeString();
                dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            }, 1000);
        },
        'stopwatch-btn': () => {
            // Placeholder logic
            console.log("Stopwatch loaded");
        },
        'alarm-clock-btn': () => {
             const timeEl = document.getElementById('alarm-time-display');
             activeInterval = setInterval(() => {
                const now = new Date();
                timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }, 1000);
            document.getElementById('set-alarm-btn').addEventListener('click', () => {
                const alarmTime = prompt("Set alarm time (e.g., 07:30)");
                if(alarmTime) alert(`Alarm set for ${alarmTime}! (Feature in development)`);
            });
        },
        'timer-btn': () => {
            // Placeholder logic
            console.log("Timer loaded");
        }
    };

    // --- EVENT HANDLING ---

    function switchMode(event) {
        // Clear any running intervals from the previous mode
        if (activeInterval) {
            clearInterval(activeInterval);
            activeInterval = null;
        }

        const buttonId = event.target.id;

        // Set active class on button
        navButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        // Load the new mode's HTML
        if (templates[buttonId]) {
            mainContent.innerHTML = templates[buttonId]();
        }

        // Run the new mode's logic
        if (logic[buttonId]) {
            logic[buttonId]();
        }
    }

    navButtons.forEach(button => button.addEventListener('click', switchMode));

    // Load the default mode on page load
    document.getElementById('alarm-clock-btn').click();
});
