document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const breadcrumbBtns = document.querySelectorAll('.breadcrumb-btn');
    const settingBtns = document.querySelectorAll('.setting-btn');
    const modeTitle = document.getElementById('mode-title');
    const mainClockDisplay = document.getElementById('main-clock-display');
    const timeDigits = document.getElementById('time-digits');
    const timePeriod = document.getElementById('time-period');
    const secondaryInfo = document.getElementById('secondary-info');
    const worldCities = document.getElementById('world-cities');
    const timerControls = document.getElementById('timer-controls');
    const timerInputs = document.getElementById('timer-inputs');
    const alarmControls = document.getElementById('alarm-controls');

    // Global variables
    let currentMode = 'timer';
    let activeInterval = null;
    let stopwatchTime = 0;
    let timerTime = 0;
    let isRunning = false;
    let stopwatchStartTime = 0;

    // Utility Functions
    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    function formatTimeWithColon(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    function setTheme(mode) {
        // Remove all mode classes
        document.body.className = '';
        // Add the new mode class
        document.body.classList.add(`${mode}-mode`);
    }

    function hideAllControls() {
        worldCities.style.display = 'none';
        timerControls.style.display = 'none';
        timerInputs.style.display = 'none';
        alarmControls.style.display = 'none';
        secondaryInfo.style.display = 'block';
    }

    function clearActiveInterval() {
        if (activeInterval) {
            clearInterval(activeInterval);
            activeInterval = null;
        }
        isRunning = false;
    }

    // Mode Functions
    const modes = {
        'timer': {
            title: 'TODAYS DATE',
            init: function() {
                setTheme('timer');
                hideAllControls();
                timerInputs.style.display = 'flex';
                timerControls.style.display = 'flex';
                
                // Get timer values
                const hours = parseInt(document.getElementById('hours-input').value) || 0;
                const minutes = parseInt(document.getElementById('minutes-input').value) || 25;
                const seconds = parseInt(document.getElementById('seconds-input').value) || 0;
                
                timerTime = hours * 3600 + minutes * 60 + seconds;
                timeDigits.textContent = formatTimeWithColon(timerTime);
                timePeriod.style.display = 'none';
                
                this.setupControls();
            },
            setupControls: function() {
                const startBtn = document.getElementById('start-btn');
                const stopBtn = document.getElementById('stop-btn');
                
                startBtn.textContent = 'START';
                stopBtn.textContent = 'STOP';
                
                startBtn.onclick = () => {
                    if (!isRunning && timerTime > 0) {
                        isRunning = true;
                        activeInterval = setInterval(() => {
                            timerTime--;
                            timeDigits.textContent = formatTimeWithColon(timerTime);
                            
                            if (timerTime <= 0) {
                                clearActiveInterval();
                                alert("Time's up!");
                            }
                        }, 1000);
                    }
                };
                
                stopBtn.onclick = () => {
                    clearActiveInterval();
                    // Reset to input values
                    const hours = parseInt(document.getElementById('hours-input').value) || 0;
                    const minutes = parseInt(document.getElementById('minutes-input').value) || 25;
                    const seconds = parseInt(document.getElementById('seconds-input').value) || 0;
                    timerTime = hours * 3600 + minutes * 60 + seconds;
                    timeDigits.textContent = formatTimeWithColon(timerTime);
                };

                // Update timer when inputs change
                const inputs = ['hours-input', 'minutes-input', 'seconds-input'];
                inputs.forEach(id => {
                    document.getElementById(id).addEventListener('input', () => {
                        if (!isRunning) {
                            const hours = parseInt(document.getElementById('hours-input').value) || 0;
                            const minutes = parseInt(document.getElementById('minutes-input').value) || 25;
                            const seconds = parseInt(document.getElementById('seconds-input').value) || 0;
                            timerTime = hours * 3600 + minutes * 60 + seconds;
                            timeDigits.textContent = formatTimeWithColon(timerTime);
                        }
                    });
                });
            }
        },

        'big-clock': {
            title: 'Big Clock Mode',
            init: function() {
                setTheme('big-clock');
                hideAllControls();
                timePeriod.style.display = 'block';
                
                this.updateClock();
                activeInterval = setInterval(() => this.updateClock(), 1000);
            },
            updateClock: function() {
                const now = new Date();
                let hours = now.getHours();
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const seconds = now.getSeconds().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'AM' : 'AM';
                
                // Convert to 12 hour format
                hours = hours % 12;
                hours = hours ? hours : 12;
                hours = hours.toString().padStart(2, '0');
                
                timeDigits.textContent = `${hours}:${minutes}:${seconds}`;
                timePeriod.textContent = ampm;
                
                // Update timezone info
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                document.querySelector('.location-zone').textContent = `LOCATION (${timezone.replace(/_/g, ' ')})`;
            }
        },

        'world-clock': {
            title: 'World Clock MODE PAGE',
            init: function() {
                setTheme('world-clock');
                hideAllControls();
                worldCities.style.display = 'flex';
                timePeriod.style.display = 'block';
                
                this.updateWorldClock();
                activeInterval = setInterval(() => this.updateWorldClock(), 1000);
            },
            updateWorldClock: function() {
                const now = new Date();
                
                // Local time
                let hours = now.getHours();
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const seconds = now.getSeconds().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'AM' : 'AM';
                
                hours = hours % 12;
                hours = hours ? hours : 12;
                hours = hours.toString().padStart(2, '0');
                
                timeDigits.textContent = `${hours}:${minutes}:${seconds}`;
                timePeriod.textContent = ampm;
                
                // Update city times (simplified - all showing same time for now)
                const cityClocks = document.querySelectorAll('.city-clock');
                cityClocks.forEach(clock => {
                    clock.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
                });
                
                document.querySelector('.location-zone').textContent = 'LOCAL TIME';
            }
        },

        'focus': {
            title: 'Focus Mode',
            init: function() {
                setTheme('focus');
                hideAllControls();
                timerControls.style.display = 'flex';
                timePeriod.style.display = 'none';
                
                // Default 25 minute focus session
                timerTime = 25 * 60;
                timeDigits.textContent = formatTimeWithColon(timerTime);
                
                modeTitle.textContent = 'TODAYS DATE';
                document.querySelector('.location-zone').textContent = 'LOCATION (TIME ZONE)';
                
                this.setupControls();
            },
            setupControls: function() {
                const startBtn = document.getElementById('start-btn');
                const stopBtn = document.getElementById('stop-btn');
                
                startBtn.textContent = 'START';
                stopBtn.textContent = 'STOP';
                
                startBtn.onclick = () => {
                    if (!isRunning && timerTime > 0) {
                        isRunning = true;
                        activeInterval = setInterval(() => {
                            timerTime--;
                            timeDigits.textContent = formatTimeWithColon(timerTime);
                            
                            if (timerTime <= 0) {
                                clearActiveInterval();
                                alert("Focus session complete!");
                                timerTime = 25 * 60; // Reset to 25 minutes
                                timeDigits.textContent = formatTimeWithColon(timerTime);
                            }
                        }, 1000);
                    }
                };
                
                stopBtn.onclick = () => {
                    clearActiveInterval();
                    timerTime = 25 * 60; // Reset to 25 minutes
                    timeDigits.textContent = formatTimeWithColon(timerTime);
                };
            }
        },

        'stopwatch': {
            title: 'STOP WATCH',
            init: function() {
                setTheme('stopwatch');
                hideAllControls();
                timerControls.style.display = 'flex';
                timePeriod.style.display = 'none';
                
                stopwatchTime = 0;
                timeDigits.textContent = formatTimeWithColon(stopwatchTime);
                
                document.querySelector('.location-zone').textContent = 'LOCATION (TIME ZONE)';
                
                this.setupControls();
            },
            setupControls: function() {
                const startBtn = document.getElementById('start-btn');
                const stopBtn = document.getElementById('stop-btn');
                
                startBtn.textContent = 'START';
                stopBtn.textContent = 'STOP';
                
                startBtn.onclick = () => {
                    if (!isRunning) {
                        isRunning = true;
                        stopwatchStartTime = Date.now() - (stopwatchTime * 1000);
                        activeInterval = setInterval(() => {
                            stopwatchTime = Math.floor((Date.now() - stopwatchStartTime) / 1000);
                            timeDigits.textContent = formatTimeWithColon(stopwatchTime);
                        }, 100);
                    }
                };
                
                stopBtn.onclick = () => {
                    clearActiveInterval();
                    stopwatchTime = 0;
                    timeDigits.textContent = formatTimeWithColon(stopwatchTime);
                };
            }
        },

        'alarm': {
            title: 'ALARM CLOCK',
            init: function() {
                setTheme('alarm');
                hideAllControls();
                alarmControls.style.display = 'block';
                timePeriod.style.display = 'none';
                
                this.updateClock();
                activeInterval = setInterval(() => this.updateClock(), 1000);
                
                this.setupControls();
            },
            updateClock: function() {
                const now = new Date();
                let hours = now.getHours();
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const seconds = now.getSeconds().toString().padStart(2, '0');
                
                hours = hours % 12;
                hours = hours ? hours : 12;
                hours = hours.toString().padStart(2, '0');
                
                timeDigits.textContent = `${hours}:${minutes}:${seconds}`;
                
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                document.querySelector('.location-zone').textContent = `LOCATION (${timezone.replace(/_/g, ' ')})`;
            },
            setupControls: function() {
                const setAlarmBtn = document.getElementById('set-alarm-btn');
                setAlarmBtn.onclick = () => {
                    const alarmTime = prompt("Set alarm time (HH:MM format, e.g., 07:30):");
                    if (alarmTime && alarmTime.match(/^\d{1,2}:\d{2}$/)) {
                        alert(`Alarm set for ${alarmTime}! You will be notified when the time arrives.`);
                        // In production, this would set an actual alarm
                    } else if (alarmTime) {
                        alert("Please enter time in HH:MM format (e.g., 07:30)");
                    }
                };
            }
        }
    };

    // Mode Switching Function
    function switchMode(modeName) {
        clearActiveInterval();
        currentMode = modeName;
        
        // Update active button
        breadcrumbBtns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-mode="${modeName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // Update title and initialize mode
        if (modes[modeName]) {
            modeTitle.textContent = modes[modeName].title;
            modes[modeName].init();
        }
    }

    // Event Listeners
    breadcrumbBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-mode');
            switchMode(mode);
        });
    });

    // Settings dropdown functionality
    const settingsBtn = document.getElementById('settings-btn');
    settingsBtn.addEventListener('click', () => {
        // Create dropdown if it doesn't exist
        let dropdown = document.getElementById('settings-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'settings-dropdown';
            dropdown.className = 'settings-dropdown';
            dropdown.innerHTML = `
                <div class="dropdown-content">
                    <h3>Contact Support</h3>
                    <p>For technical issues or feedback:</p>
                    <a href="mailto:tserver@internetclock.online">tserver@internetclock.online</a>
                    <hr>
                    <div class="dropdown-item" onclick="alert('Theme customization coming soon!')">Customize Themes</div>
                    <div class="dropdown-item" onclick="alert('Sound settings coming soon!')">Sound Settings</div>
                    <div class="dropdown-item" onclick="alert('Display preferences coming soon!')">Display Options</div>
                </div>
            `;
            document.body.appendChild(dropdown);
        }
        
        // Toggle dropdown visibility
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('settings-dropdown');
        if (dropdown && !settingsBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    // Other settings buttons
    document.getElementById('themes-btn').addEventListener('click', () => {
        let dropdown = document.getElementById('themes-dropdown');
        if (!dropdown) {
            dropdown = createThemesDropdown();
        }
        
        // Toggle dropdown visibility
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.getElementById('sounds-btn').addEventListener('click', () => {
        alert('Alarm sounds library coming soon! Professional quality audio.');
    });

    document.getElementById('music-btn').addEventListener('click', () => {
        alert('Background music feature coming soon! Focus-enhancing soundscapes.');
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        const settingsDropdown = document.getElementById('settings-dropdown');
        const themesDropdown = document.getElementById('themes-dropdown');
        const settingsBtn = document.getElementById('settings-btn');
        const themesBtn = document.getElementById('themes-btn');
        
        if (settingsDropdown && !settingsBtn.contains(e.target) && !settingsDropdown.contains(e.target)) {
            settingsDropdown.style.display = 'none';
        }
        
        if (themesDropdown && !themesBtn.contains(e.target) && !themesDropdown.contains(e.target)) {
            themesDropdown.style.display = 'none';
        }
    });

    // Initialize themes system
    loadSavedTheme();

    // Initialize with timer mode
    switchMode('timer');

    // Update page title based on current mode
    setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        document.title = `${timeStr} - Internet Clock Online`;
    }, 1000);
});

// Themes System Functions
const themesData = {
    'cool-gradient': {
        name: 'Cool Gradient Modern',
        backgrounds: [
            {
                name: 'Blue Wave Gradient',
                css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            {
                name: 'Purple Neon Gradient',
                css: 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)'
            },
            {
                name: 'Cosmic Blue Gradient',
                css: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
            }
        ]
    },
    'painting-style': {
        name: 'Painting Style',
        backgrounds: [
            {
                name: 'Canvas Texture',
                css: 'linear-gradient(45deg, #f4f1de 0%, #e07a5f 50%, #3d405b 100%)'
            },
            {
                name: 'Watercolor Blend',
                css: 'radial-gradient(circle at 30% 70%, #ffecd2 0%, #fcb69f 50%, #ff8a80 100%)'
            },
            {
                name: 'Oil Paint Strokes',
                css: 'linear-gradient(45deg, #ffd89b 0%, #19547b 100%)'
            }
        ]
    },
    'geometric-shapes': {
        name: 'Geometric Shapes',
        backgrounds: [
            {
                name: 'Polygon Network',
                css: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
            },
            {
                name: 'Hexagon Pattern',
                css: `radial-gradient(circle at 50% 50%, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)`
            },
            {
                name: 'Triangle Mosaic',
                css: `linear-gradient(60deg, #f093fb 0%, #f5576c 100%)`
            }
        ]
    },
    'imaginative': {
        name: 'Imaginative',
        backgrounds: [
            {
                name: 'Space Nebula',
                css: 'radial-gradient(ellipse at top, #1e3c72 0%, #2a5298 50%, #000428 100%)'
            },
            {
                name: 'Aurora Lights',
                css: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 50%, #8a2387 100%)'
            },
            {
                name: 'Dreamscape',
                css: 'linear-gradient(45deg, #fa709a 0%, #fee140 100%)'
            }
        ]
    },
    'cartoons': {
        name: 'Cartoons',
        backgrounds: [
            {
                name: 'Cartoon Sky',
                css: 'linear-gradient(180deg, #87ceeb 0%, #98fb98 100%)'
            },
            {
                name: 'Comic Book',
                css: 'linear-gradient(45deg, #ffd700 0%, #ff6347 50%, #ff1493 100%)'
            },
            {
                name: 'Bubble Pop',
                css: 'radial-gradient(circle, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)'
            }
        ]
    },
    'anime': {
        name: 'Anime',
        backgrounds: [
            {
                name: 'Sunset Anime',
                css: 'linear-gradient(180deg, #ff9472 0%, #f2709c 100%)'
            },
            {
                name: 'Cherry Blossom',
                css: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
            },
            {
                name: 'Anime Night',
                css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }
        ]
    }
};

function createThemesDropdown() {
    const dropdown = document.createElement('div');
    dropdown.id = 'themes-dropdown';
    dropdown.className = 'themes-dropdown';
    
    let content = `
        <div class="dropdown-content">
            <h3>Choose Background Theme</h3>
            <p>Select a background that matches your current mode's color scheme:</p>
    `;
    
    Object.keys(themesData).forEach(categoryKey => {
        const category = themesData[categoryKey];
        content += `
            <div class="theme-category">
                <h4>${category.name}</h4>
                <div class="theme-previews">
        `;
        
        category.backgrounds.forEach((bg, index) => {
            content += `
                <div class="theme-preview" 
                     data-category="${categoryKey}" 
                     data-index="${index}"
                     style="background: ${bg.css};"
                     title="${bg.name}">
                    <span class="theme-name">${bg.name}</span>
                </div>
            `;
        });
        
        content += `
                </div>
            </div>
        `;
    });
    
    content += `
            <div class="theme-actions">
                <button class="reset-theme-btn" onclick="resetToDefaultTheme()">Reset to Default</button>
            </div>
        </div>
    `;
    
    dropdown.innerHTML = content;
    document.body.appendChild(dropdown);
    
    dropdown.querySelectorAll('.theme-preview').forEach(preview => {
        preview.addEventListener('click', () => {
            const category = preview.dataset.category;
            const index = parseInt(preview.dataset.index);
            applyThemeBackground(category, index);
            dropdown.style.display = 'none';
        });
    });
    
    return dropdown;
}

function applyThemeBackground(categoryKey, backgroundIndex) {
    const background = themesData[categoryKey].backgrounds[backgroundIndex];
    document.body.style.background = background.css;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
    
    localStorage.setItem('selectedTheme', JSON.stringify({
        category: categoryKey,
        index: backgroundIndex
    }));
    
    showThemeConfirmation(background.name);
}

function resetToDefaultTheme() {
    document.body.style.background = '#2a2a2a';
    document.body.style.backgroundSize = 'auto';
    document.body.style.backgroundAttachment = 'scroll';
    localStorage.removeItem('selectedTheme');
    
    const dropdown = document.getElementById('themes-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    
    showThemeConfirmation('Default Theme');
}

function showThemeConfirmation(themeName) {
    const notification = document.createElement('div');
    notification.className = 'theme-notification';
    notification.textContent = `Applied: ${themeName}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        try {
            const theme = JSON.parse(savedTheme);
            applyThemeBackground(theme.category, theme.index);
        } catch (e) {
            console.log('Error loading saved theme:', e);
        }
    }
}
