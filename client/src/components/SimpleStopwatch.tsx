import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

export default function SimpleStopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [splits, setSplits] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 10);
      }, 10);
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
  }, [isRunning]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setSplits([]);
  };
  const handleSplit = () => {
    if (isRunning) {
      setSplits(prev => [...prev, time]);
    }
  };

  return (
    <div className="text-center w-full max-w-4xl mx-auto">
      {/* Main Timer Display */}
      <div className="mb-8">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white clock-glow font-mono leading-none">
          {formatTime(time)}
        </h1>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-8">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 bg-[hsl(120,100%,50%)] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[hsl(120,100%,45%)] transition-colors"
          >
            <Play size={20} />
            START
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
          onClick={handleSplit}
          disabled={!isRunning}
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Square size={20} />
          SPLIT
        </button>
        
        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          <RotateCcw size={20} />
          RESET
        </button>
      </div>

      {/* Split Times */}
      {splits.length > 0 && (
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Split Times</h3>
          <div className="bg-[hsl(210,11%,20%)] rounded-lg p-4 max-h-40 overflow-y-auto">
            {splits.map((split, index) => (
              <div key={index} className="flex justify-between items-center py-1 border-b border-[hsl(210,11%,25%)] last:border-b-0">
                <span className="text-gray-400">Split {index + 1}</span>
                <span className="font-mono text-white">{formatTime(split)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
