import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type FocusState = 'idle' | 'focus' | 'break';

export default function FocusMode() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [state, setState] = useState<FocusState>('idle');
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const focusTime = 25 * 60; // 25 minutes
  const breakTime = 5 * 60; // 5 minutes

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (state === 'focus') {
      setSessions(prev => prev + 1);
      setState('break');
      setTimeLeft(breakTime);
    } else if (state === 'break') {
      setState('idle');
      setTimeLeft(focusTime);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    if (state === 'idle') {
      setState('focus');
    }
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setState('idle');
    setTimeLeft(focusTime);
  };

  const getProgress = () => {
    const totalTime = state === 'focus' ? focusTime : breakTime;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <div className="text-center w-full max-w-4xl mx-auto">
      {/* Session Counter */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-300 mb-2">Pomodoro Sessions</h2>
        <div className="text-4xl font-bold text-[hsl(120,100%,50%)]">{sessions}</div>
      </div>

      {/* Timer Display */}
      <div className="mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            {state === 'idle' && 'Ready to Focus'}
            {state === 'focus' && 'Focus Time'}
            {state === 'break' && 'Break Time'}
          </h3>
          {state === 'focus' && <Coffee className="mx-auto text-gray-400" size={24} />}
          {state === 'break' && <Coffee className="mx-auto text-orange-500" size={24} />}
        </div>
        
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white clock-glow font-mono leading-none mb-6">
          {formatTime(timeLeft)}
        </h1>

        {/* Progress Bar */}
        {state !== 'idle' && (
          <div className="max-w-md mx-auto mb-6">
            <Progress 
              value={getProgress()} 
              className="h-3"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 bg-[hsl(120,100%,50%)] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[hsl(120,100%,45%)] transition-colors"
          >
            <Play size={20} />
            {state === 'idle' ? 'START FOCUS' : 'RESUME'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            <Pause size={20} />
            PAUSE
          </button>
        )}
        
        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          <RotateCcw size={20} />
          RESET
        </button>
      </div>

      {/* Tips */}
      <div className="mt-8 max-w-md mx-auto text-sm text-gray-400">
        <p>💡 Focus for 25 minutes, then take a 5-minute break to maintain productivity</p>
      </div>
    </div>
  );
}
