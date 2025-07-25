document.addEventListener('DOMContentLoaded', () => {

    // 1. STATE MANAGEMENT
    const state = {
        currentMode: 'big-clock-mode',
        intervals: {},
        alarms: [], // {id, time, label, sound, enabled, snoozeUntil}
        timer: {
            running: false,
            timeLeft: 0,
            initialDuration: 0,
        },
        // ... (all other states from previous sections)
    };

    // 2. DOM ELEMENT SELECTORS (Final)
    const DOMElements = {
        // ... (all existing selectors from Section 2)
        alarmForm: document.getElementById('alarm-form'),
        alarmTimeInput: document.getElementById('alarm-time-input'),
        alarmLabelInput: document.getElementById('alarm-label-input'),
        alarmsList: document.getElementById('alarms-list'),
        timerDisplay: document.getElementById('timer-display'),
        timerMinutesInput: document.getElementById('timer-minutes-input'),
        timerSecondsInput: document.getElementById('timer-seconds-input'),
        timerPresetBtns: document.querySelectorAll('.preset-btn'),
        timerStartPauseBtn: document.getElementById('timer-start-pause-btn'),
        timerResetBtn: document.getElementById('timer-reset-btn'),
        alarmRingingModal: document.getElementById('alarm-ringing-modal'),
        ringingAlarmLabel: document.getElementById('ringing-alarm-label'),
        ringingAlarmTime: document.getElementById('ringing-alarm-time'),
        snoozeBtn: document.getElementById('snooze-btn'),
        dismissAlarmBtn: document.getElementById('dismiss-alarm-btn'),
    };
    
    // 3. WEB WORKER FOR BACKGROUND PROCESSING
    let backgroundWorker;

    function createWorker() {
        const workerCode = `
            let alarms = [];
            let timers = [];
            
            function checkAlarms() {
                const now = new Date();
                const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                
                alarms.forEach(alarm => {
                    if (alarm.enabled && !alarm.isSnoozed && alarm.time === currentTime) {
                        postMessage({ type: 'ALARM_TRIGGER', payload: alarm });
                    }
                });
            }

            function checkTimers() {
                 timers.forEach(timer => {
                    if (timer.running && Date.now() >= timer.endTime) {
                        postMessage({ type: 'TIMER_FINISHED', payload: timer });
                        // Remove timer after it finishes
                        timers = timers.filter(t => t.id !== timer.id);
                    }
                });
            }

            setInterval(() => {
                checkAlarms();
                checkTimers();
            }, 1000); // Check every second

            self.onmessage = function(e) {
                const { type, payload } = e.data;
                if (type === 'UPDATE_ALARMS') {
                    alarms = payload;
                }
                if (type === 'UPDATE_TIMERS') {
                    timers = payload;
                }
            };
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        return new Worker(URL.createObjectURL(blob));
    }

    // 4. CORE MODULES - FINAL ADDITIONS & UPDATES

    const NotificationModule = {
        permission: 'default',
        request: function() {
            if ('Notification' in window && this.permission === 'default') {
                Notification.requestPermission().then(perm => {
                    this.permission = perm;
                });
            }
        },
        show: function(title, options) {
            if ('Notification' in window && this.permission === 'granted') {
                new Notification(title, options);
            }
        }
    };

    const AlarmModule = {
        init: () => {
            DOMElements.alarmForm.addEventListener('submit', e => {
                e.preventDefault();
                AlarmModule.add();
            });
            DOMElements.alarmsList.addEventListener('click', e => {
                if (e.target.matches('.alarm-delete-btn')) {
                    AlarmModule.remove(e.target.closest('.alarm-item').dataset.id);
                } else if (e.target.matches('.toggle-input')) {
                     AlarmModule.toggle(e.target.closest('.alarm-item').dataset.id);
                }
            });
            DOMElements.dismissAlarmBtn.addEventListener('click', AlarmModule.dismiss);
            DOMElements.snoozeBtn.addEventListener('click', AlarmModule.snooze);
            AlarmModule.render();
        },
        add: () => {
            const time = DOMElements.alarmTimeInput.value;
            const label = DOMElements.alarmLabelInput.value || 'Alarm';
            if (!time) return;
            const newAlarm = {
                id: Date.now(),
                time,
                label,
                sound: state.sound.alarmSound,
                enabled: true,
                isSnoozed: false,
            };
            state.alarms.push(newAlarm);
            DOMElements.alarmForm.reset();
            AlarmModule.render();
            StorageModule.save();
            NotificationModule.request();
        },
        remove: (id) => {
            state.alarms = state.alarms.filter(a => a.id != id);
            AlarmModule.render();
            StorageModule.save();
        },
        toggle: (id) => {
             const alarm = state.alarms.find(a => a.id == id);
             if(alarm) alarm.enabled = !alarm.enabled;
             AlarmModule.render();
             StorageModule.save();
        },
        render: () => {
            DOMElements.alarmsList.innerHTML = state.alarms.map(alarm => `
                <div class="alarm-item ${!alarm.enabled ? 'disabled' : ''}" data-id="${alarm.id}">
                    <label class="toggle-switch">
                        <input type="checkbox" class="toggle-input" ${alarm.enabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <div class="alarm-item-details">
                        <div class="time">${new Date('1970-01-01T' + alarm.time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</div>
                        <div class="label">${alarm.label}</div>
                    </div>
                    <button class="alarm-delete-btn">&times;</button>
                </div>
            `).join('');
            if(backgroundWorker) backgroundWorker.postMessage({ type: 'UPDATE_ALARMS', payload: state.alarms });
        },
        trigger: (alarm) => {
             const ringingAlarm = state.alarms.find(a => a.id === alarm.id);
             if (!ringingAlarm || !ringingAlarm.enabled) return;
             
             ringingAlarm.isSnoozed = true; // Prevent re-triggering immediately
             AlarmModule.render();

             SoundModule.playAlarm(ringingAlarm.sound);
             NotificationModule.show(ringingAlarm.label, { body: `It's ${new Date('1970-01-01T' + ringingAlarm.time).toLocaleTimeString('en-US')}` });
             
             DOMElements.ringingAlarmLabel.textContent = ringingAlarm.label;
             DOMElements.ringingAlarmTime.textContent = new Date('1970-01-01T' + ringingAlarm.time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
             DOMElements.alarmRingingModal.dataset.ringingId = ringingAlarm.id;
             UIModule.toggleModal(DOMElements.alarmRingingModal, true);
        },
        dismiss: () => {
             const id = DOMElements.alarmRingingModal.dataset.ringingId;
             const alarm = state.alarms.find(a => a.id == id);
             if (alarm) alarm.isSnoozed = false; // Reset snooze status
             AlarmModule.render();
             StorageModule.save();
             UIModule.toggleModal(DOMElements.alarmRingingModal, false);
        },
        snooze: () => {
            const id = DOMElements.alarmRingingModal.dataset.ringingId;
            const alarm = state.alarms.find(a => a.id == id);
            if (!alarm) return;
            
            const now = new Date();
            now.setMinutes(now.getMinutes() + 5);
            alarm.time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            alarm.isSnoozed = false; // Re-enable for the new time
            
            AlarmModule.render();
            StorageModule.save();
            UIModule.toggleModal(DOMElements.alarmRingingModal, false);
        }
    };

    const TimerModule = {
        init: () => {
             DOMElements.timerStartPauseBtn.addEventListener('click', TimerModule.startPause);
             DOMElements.timerResetBtn.addEventListener('click', TimerModule.reset);
             DOMElements.timerPresetBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const minutes = parseInt(btn.dataset.minutes);
                    DOMElements.timerMinutesInput.value = minutes;
                    DOMElements.timerSecondsInput.value = 0;
                    TimerModule.reset();
                });
             });
             DOMElements.timerMinutesInput.addEventListener('input', TimerModule.updateDisplay);
             DOMElements.timerSecondsInput.addEventListener('input', TimerModule.updateDisplay);
        },
        updateDisplay: () => {
            let minutes, seconds;
            if(state.timer.running || state.timer.timeLeft > 0){
                minutes = Math.floor(state.timer.timeLeft / 60);
                seconds = state.timer.timeLeft % 60;
            } else {
                minutes = parseInt(DOMElements.timerMinutesInput.value) || 0;
                seconds = parseInt(DOMElements.timerSecondsInput.value) || 0;
            }
            DOMElements.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        },
        startPause: () => {
            if(state.timer.running){ // PAUSE
                state.timer.running = false;
                DOMElements.timerStartPauseBtn.textContent = 'START';
                // Worker will handle stopping
                backgroundWorker.postMessage({ type: 'UPDATE_TIMERS', payload: [] });
            } else { // START
                if(state.timer.timeLeft === 0){
                    const minutes = parseInt(DOMElements.timerMinutesInput.value) || 0;
                    const seconds = parseInt(DOMElements.timerSecondsInput.value) || 0;
                    state.timer.timeLeft = (minutes * 60) + seconds;
                }
                if(state.timer.timeLeft <= 0) return;

                state.timer.running = true;
                DOMElements.timerStartPauseBtn.textContent = 'PAUSE';
                const endTime = Date.now() + state.timer.timeLeft * 1000;
                backgroundWorker.postMessage({ type: 'UPDATE_TIMERS', payload: [{id: 'mainTimer', running: true, endTime}] });
                state.intervals.timerDisplay = setInterval(TimerModule.tick, 1000);
            }
        },
        tick: () => {
            if(state.timer.timeLeft > 0) {
                state.timer.timeLeft--;
                TimerModule.updateDisplay();
            }
        },
        reset: () => {
            state.timer.running = false;
            clearInterval(state.intervals.timerDisplay);
            backgroundWorker.postMessage({ type: 'UPDATE_TIMERS', payload: [] });
            const minutes = parseInt(DOMElements.timerMinutesInput.value) || 0;
            const seconds = parseInt(DOMElements.timerSecondsInput.value) || 0;
            state.timer.timeLeft = (minutes * 60) + seconds;
            TimerModule.updateDisplay();
            DOMElements.timerStartPauseBtn.textContent = 'START';
        },
        finish: () => {
            state.timer.running = false;
            clearInterval(state.intervals.timerDisplay);
            state.timer.timeLeft = 0;
            TimerModule.updateDisplay();
            DOMElements.timerStartPauseBtn.textContent = 'START';
            SoundModule.playAlarm(state.sound.alarmSound);
            NotificationModule.show('Timer Finished!', { body: 'Your countdown is complete.' });
        }
    };
    

    // ... (All other modules from Section 2) ...

    // 5. INITIALIZATION (Final)
    function finalInit() {
        // ... Load from storage
        // ... Init UI modules (Themes, Sounds, etc.)
        // ... Init clock modules (Big, World, Focus)
        
        AlarmModule.init();
        TimerModule.init();
        TimerModule.updateDisplay();

        // Start the background worker
        backgroundWorker = createWorker();
        backgroundWorker.onmessage = (e) => {
            const { type, payload } = e.data;
            if(type === 'ALARM_TRIGGER') {
                AlarmModule.trigger(payload);
            }
            if(type === 'TIMER_FINISHED') {
                TimerModule.finish();
            }
        };

        // Initial sync with worker
        if (backgroundWorker) {
            backgroundWorker.postMessage({ type: 'UPDATE_ALARMS', payload: state.alarms });
        }

        // Set initial active mode from storage or default
        UIModule.switchMode(state.settings.lastMode || 'big-clock-mode');
        
        console.log("Internet Clock (Final Version) Initialized. Ready for market domination.");
    }
    
    // Call the final, comprehensive init function.
    // NOTE: This is a representation. You would merge this new logic with the
    // existing `app.js` code from Section 2 to create the final file.
    // finalInit();
});