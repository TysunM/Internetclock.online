import { useState, useEffect } from 'react';
import SimpleStopwatch from '@/components/SimpleStopwatch';
import WorldClockMode from '@/components/WorldClockMode';
import FocusMode from '@/components/FocusMode';
import AlarmClockMode from '@/components/AlarmClockMode';
import TimerMode from '@/components/TimerMode';
import { useClock } from '@/hooks/useClock';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Home() {
  const [currentMode, setCurrentMode] = useState<'bigClock' | 'stopwatch' | 'worldClock' | 'focus' | 'alarm' | 'timer'>('bigClock');
  const { clockState, toggleFormat, selectedTimezone, setSelectedTimezone } = useClock();

  // Load preferred mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('preferredClockMode');
    if (savedMode && ['bigClock', 'stopwatch', 'worldClock', 'focus', 'alarm', 'timer'].includes(savedMode)) {
      setCurrentMode(savedMode as any);
    }
  }, []);

  // Save mode preference when changed
  const handleModeChange = (mode: typeof currentMode) => {
    setCurrentMode(mode);
    localStorage.setItem('preferredClockMode', mode);
  };

  const timezoneOptions = [
    { value: 'auto', label: `Auto-detected: ${clockState.timezone}` },
    { value: 'UTC', label: 'UTC' },
    { value: 'EST', label: 'Eastern Time (EST)' },
    { value: 'CST', label: 'Central Time (CST)' },
    { value: 'MST', label: 'Mountain Time (MST)' },
    { value: 'PST', label: 'Pacific Time (PST)' },
    { value: 'GMT', label: 'Greenwich Mean Time (GMT)' },
  ];

  return (
    <div className="bg-[hsl(210,11%,15%)] font-sans text-white h-screen overflow-hidden flex flex-col">
      {/* Header Ad Banner - Empty Space */}
      <div className="w-full bg-[hsl(210,11%,18%)] border-b border-[hsl(210,11%,25%)] p-4">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="h-12"></div>
        </div>
      </div>

      <main className="flex-1 flex flex-col justify-center items-center px-4">
        {/* Mode Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 bg-[hsl(210,11%,18%)] rounded-full p-1 shadow-lg border border-[hsl(210,11%,25%)] max-w-4xl mx-auto">
            <button
              onClick={() => handleModeChange('bigClock')}
              className={`px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                currentMode === 'bigClock'
                  ? 'bg-[hsl(120,100%,50%)] text-black shadow-lg shadow-[hsl(120,100%,50%)]/50'
                  : 'text-gray-300 hover:text-white hover:bg-[hsl(210,11%,20%)]'
              }`}
            >
              BIG CLOCK
            </button>
            <button
              onClick={() => handleModeChange('stopwatch')}
              className={`px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                currentMode === 'stopwatch'
                  ? 'bg-[hsl(120,100%,50%)] text-black shadow-lg shadow-[hsl(120,100%,50%)]/50'
                  : 'text-gray-300 hover:text-white hover:bg-[hsl(210,11%,20%)]'
              }`}
            >
              STOP WATCH
            </button>
            <button
              onClick={() => handleModeChange('worldClock')}
              className={`px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                currentMode === 'worldClock'
                  ? 'bg-[hsl(120,100%,50%)] text-black shadow-lg shadow-[hsl(120,100%,50%)]/50'
                  : 'text-gray-300 hover:text-white hover:bg-[hsl(210,11%,20%)]'
              }`}
            >
              WORLD CLOCK
            </button>
            <button
              onClick={() => handleModeChange('focus')}
              className={`px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                currentMode === 'focus'
                  ? 'bg-[hsl(120,100%,50%)] text-black shadow-lg shadow-[hsl(120,100%,50%)]/50'
                  : 'text-gray-300 hover:text-white hover:bg-[hsl(210,11%,20%)]'
              }`}
            >
              FOCUS (POMODORO)
            </button>
            <button
              onClick={() => handleModeChange('alarm')}
              className={`px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                currentMode === 'alarm'
                  ? 'bg-[hsl(120,100%,50%)] text-black shadow-lg shadow-[hsl(120,100%,50%)]/50'
                  : 'text-gray-300 hover:text-white hover:bg-[hsl(210,11%,20%)]'
              }`}
            >
              ALARM CLOCK
            </button>
            <button
              onClick={() => handleModeChange('timer')}
              className={`px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                currentMode === 'timer'
                  ? 'bg-[hsl(120,100%,50%)] text-black shadow-lg shadow-[hsl(120,100%,50%)]/50'
                  : 'text-gray-300 hover:text-white hover:bg-[hsl(210,11%,20%)]'
              }`}
            >
              TIMER
            </button>
          </div>
        </div>

        {/* Big Clock Display */}
        {currentMode === 'bigClock' && (
          <div className="text-center w-full max-w-6xl mx-auto">
            {/* Main Time Display */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-4">
                <h1 
                  className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] font-bold text-white clock-glow font-mono leading-none cursor-pointer select-none"
                  onClick={toggleFormat}
                >
                  {clockState.time}
                </h1>
                {!clockState.is24Hour && (
                  <div className="flex flex-col justify-start pt-2">
                    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-gray-300 leading-none">
                      {clockState.ampm}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="mb-6">
              <h2 className="text-3xl lg:text-4xl font-medium text-gray-300">
                {clockState.date}
              </h2>
            </div>

            {/* Timezone Selector */}
            <div className="mb-6">
              <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                <SelectTrigger className="max-w-xs mx-auto bg-[hsl(210,11%,20%)] border-[hsl(210,11%,25%)] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezoneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {currentMode === 'stopwatch' && <SimpleStopwatch />}
        
        {currentMode === 'worldClock' && <WorldClockMode />}
        
        {currentMode === 'focus' && <FocusMode />}
        
        {currentMode === 'alarm' && <AlarmClockMode />}
        
        {currentMode === 'timer' && <TimerMode />}

      </main>

      {/* Bottom Ad Space - matches top header spacing exactly */}
      <div className="h-20 w-full bg-[hsl(210,11%,15%)]"></div>
    </div>
  );
}
