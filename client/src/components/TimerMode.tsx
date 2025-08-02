import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Progress } from '@/components/ui/progress.tsx';

export default function TimerMode() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [originalTime, setOriginalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const presets = [
    { label: '1 min', seconds: 60 },
    { label: '5 min', seconds: 300 },
    { label: '10 min', seconds: 600 },
    { label: '15 min', seconds: 900 },
    { label: '30 min', seconds: 1800 },
    { label: '1 hour', seconds: 3600 },
  ];

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
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

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const setCustomTimer = () => {
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setOriginalTime(totalSeconds);
      setIsRunning(false);
    }
  };

  const setPresetTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setOriginalTime(seconds);
    setIsRunning(false);
  };

  const handleStart = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(originalTime);
  };

  const getProgress = () => {
    if (originalTime === 0) return 0;
    return ((originalTime - timeLeft) / originalTime) * 100;
  };

  return (
    <div className="text-center w-full max-w-4xl mx-auto">
      {/* Timer Display */}
      <div className="mb-8">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white clock-glow font-mono leading-none mb-6">
          {formatTime(timeLeft)}
        </h1>

        {/* Progress Bar */}
        {originalTime > 0 && (
          <div className="max-w-md mx-auto mb-6">
            <Progress 
              value={getProgress()} 
              className="h-3"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      {timeLeft > 0 && (
        <div className="flex justify-center gap-4 mb-8">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="flex items-center gap-2 bg-[hsl(120,100%,50%)] text-black hover:bg-[hsl(120,100%,45%)]"
            >
              <Play size={20} />
              START
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              className="flex items-center gap-2 bg-orange-500 text-white hover:bg-orange-600"
            >
              <Pause size={20} />
              PAUSE
            </Button>
          )}
          
          <Button
            onClick={handleReset}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <RotateCcw size={20} />
            RESET
          </Button>
        </div>
      )}

      {/* Custom Timer Setup */}
      <div className="mb-8 p-6 bg-[hsl(210,11%,20%)] rounded-lg border border-[hsl(210,11%,25%)]">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Set Custom Timer</h3>
        <div className="flex justify-center items-end gap-4 mb-4">
          <div className="text-center">
            <Label htmlFor="hours" className="text-sm text-gray-400">Hours</Label>
            <Input
              id="hours"
              type="number"
              min="0"
              max="23"
              value={hours || ''}
              onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-20 bg-[hsl(210,11%,25%)] border-[hsl(210,11%,30%)] text-white text-center"
            />
          </div>
          <div className="text-center">
            <Label htmlFor="minutes" className="text-sm text-gray-400">Minutes</Label>
            <Input
              id="minutes"
              type="number"
              min="0"
              max="59"
              value={minutes || ''}
              onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              className="w-20 bg-[hsl(210,11%,25%)] border-[hsl(210,11%,30%)] text-white text-center"
            />
          </div>
          <div className="text-center">
            <Label htmlFor="seconds" className="text-sm text-gray-400">Seconds</Label>
            <Input
              id="seconds"
              type="number"
              min="0"
              max="59"
              value={seconds || ''}
              onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              className="w-20 bg-[hsl(210,11%,25%)] border-[hsl(210,11%,30%)] text-white text-center"
            />
          </div>
          <Button 
            onClick={setCustomTimer}
            className="bg-[hsl(120,100%,50%)] text-black hover:bg-[hsl(120,100%,45%)]"
          >
            Set Timer
          </Button>
        </div>
      </div>

      {/* Preset Timers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Quick Presets</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              onClick={() => setPresetTimer(preset.seconds)}
              variant="outline"
              className="border-[hsl(210,11%,25%)] text-gray-300 hover:bg-[hsl(210,11%,25%)] hover:text-white"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {timeLeft === 0 && originalTime === 0 && (
        <div className="mt-8 text-gray-400">
          <p>Set a custom timer or choose a preset to get started</p>
        </div>
      )}
    </div>
  );
}
