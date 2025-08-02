import { useState, useEffect } from 'react';
import { useClock } from '@/hooks/useClock.tsx';

interface WorldClockTime {
  city: string;
  timezone: string;
  time: string;
  date: string;
}

export default function WorldClockMode() {
  const { clockState } = useClock();
  const [worldTimes, setWorldTimes] = useState<WorldClockTime[]>([]);

  useEffect(() => {
    const updateWorldTimes = () => {
      const now = new Date();
      const timeZones = [
        { city: 'New York', timezone: 'America/New_York' },
        { city: 'Paris', timezone: 'Europe/Paris' },
        { city: 'Sydney', timezone: 'Australia/Sydney' },
      ];

      const times = timeZones.map(({ city, timezone }) => {
        const time = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
        return {
          city,
          timezone,
          time: time.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          date: time.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        };
      });

      setWorldTimes(times);
    };

    updateWorldTimes();
    const interval = setInterval(updateWorldTimes, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center w-full max-w-6xl mx-auto">
      {/* Local Time - Large Display */}
      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-300 mb-4">Your Local Time</h2>
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white clock-glow font-mono leading-none">
            {clockState.time}
          </h1>
          {!clockState.is24Hour && (
            <div className="flex flex-col justify-start pt-2">
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-300 leading-none">
                {clockState.ampm}
              </span>
            </div>
          )}
        </div>
        <p className="text-xl lg:text-2xl text-gray-400">{clockState.date}</p>
      </div>

      {/* World Clocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {worldTimes.map((worldTime) => (
          <div key={worldTime.city} className="bg-[hsl(210,11%,20%)] rounded-lg p-6 border border-[hsl(210,11%,25%)]">
            <h3 className="text-xl font-semibold text-gray-300 mb-3">{worldTime.city}</h3>
            <div className="orange-glow text-3xl md:text-4xl font-bold font-mono mb-2">
              {worldTime.time}
            </div>
            <p className="text-sm text-gray-400">{worldTime.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
