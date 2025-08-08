import { useState, useEffect } from 'react';
import { Plus, Trash2, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label';

interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  days: string[];
}

export default function AlarmClockMode() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState('');
  const [newAlarmLabel, setNewAlarmLabel] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedAlarms = localStorage.getItem('alarms');
    if (savedAlarms) {
      setAlarms(JSON.parse(savedAlarms));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('alarms', JSON.stringify(alarms));
  }, [alarms]);

  const addAlarm = () => {
    if (newAlarmTime && alarms.length < 5) {
      const alarm: Alarm = {
        id: Date.now().toString(),
        time: newAlarmTime,
        label: newAlarmLabel || 'Alarm',
        enabled: true,
        days: []
      };
      setAlarms([...alarms, alarm]);
      setNewAlarmTime('');
      setNewAlarmLabel('');
    }
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getNextAlarm = () => {
    const now = new Date();
    const enabledAlarms = alarms.filter(alarm => alarm.enabled);
    
    if (enabledAlarms.length === 0) return null;

    const nextAlarm = enabledAlarms.reduce((next, alarm) => {
      const [hours, minutes] = alarm.time.split(':').map(Number);
      const alarmTime = new Date();
      alarmTime.setHours(hours, minutes, 0, 0);
      
      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }
      
      if (!next || alarmTime < next.time) {
        return { alarm, time: alarmTime };
      }
      return next;
    }, null as { alarm: Alarm, time: Date } | null);

    return nextAlarm;
  };

  const nextAlarm = getNextAlarm();

  return (
    <div className="text-center w-full max-w-4xl mx-auto">
      {/* Current Time Display */}
      <div className="mb-8">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white clock-glow font-mono leading-none">
          {formatCurrentTime()}
        </h1>
        <p className="text-xl text-gray-400 mt-2">
          {currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Next Alarm Info */}
      {nextAlarm && (
        <div className="mb-6 p-4 bg-[hsl(120,100%,50%)]/10 border border-[hsl(120,100%,50%)]/30 rounded-lg">
          <p className="text-[hsl(120,100%,50%)] font-semibold">
            Next alarm: {nextAlarm.alarm.label} at {nextAlarm.alarm.time}
          </p>
        </div>
      )}

      {/* Add New Alarm */}
      {alarms.length < 5 && (
        <div className="mb-8 p-6 bg-[hsl(210,11%,20%)] rounded-lg border border-[hsl(210,11%,25%)]">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Add New Alarm</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="alarm-time" className="text-sm text-gray-400">Time</Label>
              <Input
                id="alarm-time"
                type="time"
                value={newAlarmTime}
                onChange={(e) => setNewAlarmTime(e.target.value)}
                className="bg-[hsl(210,11%,25%)] border-[hsl(210,11%,30%)] text-white"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="alarm-label" className="text-sm text-gray-400">Label</Label>
              <Input
                id="alarm-label"
                type="text"
                placeholder="Wake up"
                value={newAlarmLabel}
                onChange={(e) => setNewAlarmLabel(e.target.value)}
                className="bg-[hsl(210,11%,25%)] border-[hsl(210,11%,30%)] text-white"
              />
            </div>
            <Button 
              onClick={addAlarm}
              disabled={!newAlarmTime}
              className="bg-[hsl(120,100%,50%)] text-black hover:bg-[hsl(120,100%,45%)]"
            >
              <Plus size={16} className="mr-2" />
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Alarms List */}
      <div className="space-y-4">
        {alarms.map((alarm) => (
          <div key={alarm.id} className="flex items-center justify-between p-4 bg-[hsl(210,11%,20%)] rounded-lg border border-[hsl(210,11%,25%)]">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleAlarm(alarm.id)}
                className={`p-2 rounded-full transition-colors ${
                  alarm.enabled 
                    ? 'bg-[hsl(120,100%,50%)] text-black' 
                    : 'bg-gray-600 text-gray-400'
                }`}
              >
                {alarm.enabled ? <Bell size={20} /> : <BellOff size={20} />}
              </button>
              <div className="text-left">
                <div className="text-2xl font-bold text-white font-mono">{alarm.time}</div>
                <div className="text-sm text-gray-400">{alarm.label}</div>
              </div>
            </div>
            <button
              onClick={() => deleteAlarm(alarm.id)}
              className="p-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {alarms.length === 0 && (
        <div className="text-center py-8">
          <Bell size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No alarms set. Add your first alarm above.</p>
        </div>
      )}

      {alarms.length >= 5 && (
        <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <p className="text-orange-400 text-sm">Maximum of 5 alarms reached</p>
        </div>
      )}
    </div>
  );
}
