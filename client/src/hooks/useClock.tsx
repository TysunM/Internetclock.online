import { useState, useEffect } from 'react';

interface ClockState {
  time: string;
  date: string;
  timezone: string;
  is24Hour: boolean;
  ampm: string;
}

export function useClock() {
  const [clockState, setClockState] = useState<ClockState>({
    time: '',
    date: '',
    timezone: '',
    is24Hour: false,
    ampm: ''
  });
  const [selectedTimezone, setSelectedTimezone] = useState('auto');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let displayTime: Date;

      // Handle timezone selection
      if (selectedTimezone === 'auto') {
        displayTime = now;
      } else {
        const timeZoneMap: { [key: string]: string } = {
          'UTC': 'UTC',
          'EST': 'America/New_York',
          'CST': 'America/Chicago',
          'MST': 'America/Denver',
          'PST': 'America/Los_Angeles',
          'GMT': 'Europe/London'
        };
        
        const timeZone = timeZoneMap[selectedTimezone] || 'UTC';
        displayTime = new Date(now.toLocaleString("en-US", { timeZone }));
      }

      const is24Hour = localStorage.getItem('is24Hour') === 'true';
      
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: !is24Hour
      };

      const timeString = displayTime.toLocaleTimeString('en-US', timeOptions);
      const [time, ampm] = is24Hour ? [timeString, ''] : timeString.split(' ');

      setClockState({
        time: time || timeString,
        date: displayTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        timezone: displayTime.toLocaleDateString('en-US', { timeZoneName: 'short' }).split(', ')[1] || '',
        is24Hour,
        ampm: ampm || ''
      });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, [selectedTimezone]);

  const toggleFormat = () => {
    const newFormat = !clockState.is24Hour;
    localStorage.setItem('is24Hour', newFormat.toString());
    setClockState(prev => ({ ...prev, is24Hour: newFormat }));
  };

  return {
    clockState,
    toggleFormat,
    selectedTimezone,
    setSelectedTimezone
  };
}
