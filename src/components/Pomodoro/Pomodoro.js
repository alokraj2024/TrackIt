'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Play, Pause, RotateCcw, Settings, Coffee, Brain, Trophy } from 'lucide-react';
import styles from './Pomodoro.module.css';

const PRESETS = {
  classic: { work: 25, short: 5, long: 15, label: 'Classic' },
  deep: { work: 50, short: 10, long: 20, label: 'Deep Work' },
  quick: { work: 15, short: 3, long: 10, label: 'Quick' },
};

export default function Pomodoro() {
  const { user, updateXP } = useAuth();
  const [mode, setMode] = useState('work'); // work, short, long
  const [preset, setPreset] = useState('classic');
  const [timeLeft, setTimeLeft] = useState(PRESETS.classic.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const storageKey = `trackit_pomodoro_${user?.id}`;

  useEffect(() => {
    if (!user) return;
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{"sessions":0,"todaySessions":0,"todayDate":""}');
    const today = new Date().toISOString().split('T')[0];
    if (saved.todayDate === today) {
      setSessions(saved.todaySessions || 0);
    }
  }, [user, storageKey]);

  const saveSessions = useCallback((count) => {
    const today = new Date().toISOString().split('T')[0];
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    localStorage.setItem(storageKey, JSON.stringify({
      ...saved,
      sessions: (saved.sessions || 0) + 1,
      todaySessions: count,
      todayDate: today,
    }));
  }, [storageKey]);

  const totalSeconds = mode === 'work'
    ? PRESETS[preset].work * 60
    : mode === 'short'
      ? PRESETS[preset].short * 60
      : PRESETS[preset].long * 60;

  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer complete
      setIsRunning(false);
      if (mode === 'work') {
        const newSessions = sessions + 1;
        setSessions(newSessions);
        saveSessions(newSessions);
        updateXP(20);
        // Auto switch to break
        if (newSessions % 4 === 0) {
          setMode('long');
          setTimeLeft(PRESETS[preset].long * 60);
        } else {
          setMode('short');
          setTimeLeft(PRESETS[preset].short * 60);
        }
      } else {
        // Break complete, back to work
        setMode('work');
        setTimeLeft(PRESETS[preset].work * 60);
      }
      // Play notification sound
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {}
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, mode, sessions, preset, saveSessions, updateXP]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    const seconds = newMode === 'work'
      ? PRESETS[preset].work * 60
      : newMode === 'short'
        ? PRESETS[preset].short * 60
        : PRESETS[preset].long * 60;
    setTimeLeft(seconds);
  };

  const changePreset = (p) => {
    setPreset(p);
    setIsRunning(false);
    setMode('work');
    setTimeLeft(PRESETS[p].work * 60);
  };

  const formatTime = (s) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modeColors = {
    work: { main: 'var(--accent-blue)', glow: 'var(--accent-blue-glow)' },
    short: { main: 'var(--accent-emerald)', glow: 'var(--accent-emerald-glow)' },
    long: { main: 'var(--accent-purple)', glow: 'var(--accent-purple-glow)' },
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-fade-in`}>
        <div>
          <h1 className={styles.title}>Pomodoro Timer</h1>
          <p className={styles.subtitle}>Stay focused, take breaks</p>
        </div>
        <button
          className="btn-icon"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Presets */}
      {showSettings && (
        <div className={`${styles.presets} animate-scale-in`}>
          {Object.entries(PRESETS).map(([key, val]) => (
            <button
              key={key}
              className={`${styles.presetBtn} ${preset === key ? styles.activePreset : ''}`}
              onClick={() => changePreset(key)}
            >
              <span className={styles.presetLabel}>{val.label}</span>
              <span className={styles.presetTimes}>{val.work}/{val.short}/{val.long} min</span>
            </button>
          ))}
        </div>
      )}

      {/* Mode Toggle */}
      <div className={`${styles.modeToggle} animate-fade-in delay-1`}>
        <button
          className={`${styles.modeBtn} ${mode === 'work' ? styles.activeMode : ''}`}
          onClick={() => switchMode('work')}
        >
          <Brain size={16} />
          Focus
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'short' ? styles.activeMode : ''}`}
          onClick={() => switchMode('short')}
        >
          <Coffee size={16} />
          Short Break
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'long' ? styles.activeMode : ''}`}
          onClick={() => switchMode('long')}
        >
          <Coffee size={16} />
          Long Break
        </button>
      </div>

      {/* Timer */}
      <div className={`${styles.timerSection} animate-fade-in delay-2`}>
        <div className={styles.timerRing}>
          <svg viewBox="0 0 300 300" className={styles.timerSvg}>
            {/* Background circle */}
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="var(--border-color)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke={modeColors[mode].main}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 150 150)"
              style={{
                transition: 'stroke-dashoffset 0.5s ease',
                filter: `drop-shadow(0 0 8px ${modeColors[mode].glow})`,
              }}
            />
          </svg>
          <div className={styles.timerContent}>
            <span className={styles.timerDisplay}>{formatTime(timeLeft)}</span>
            <span className={styles.timerMode}>
              {mode === 'work' ? '🧠 Focus Time' : mode === 'short' ? '☕ Short Break' : '🌿 Long Break'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button className={styles.resetBtn} onClick={resetTimer} title="Reset">
            <RotateCcw size={20} />
          </button>
          <button
            className={`${styles.playBtn} ${isRunning ? styles.pauseState : ''}`}
            onClick={toggleTimer}
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
          </button>
          <div className={styles.sessionCount} title="Sessions completed today">
            <Trophy size={16} />
            <span>{sessions}</span>
          </div>
        </div>
      </div>

      {/* Session dots */}
      <div className={`${styles.sessionDots} animate-fade-in delay-3`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i < (sessions % 4) ? styles.dotFilled : ''}`}
          />
        ))}
        <span className={styles.dotLabel}>
          {4 - (sessions % 4)} sessions until long break
        </span>
      </div>
    </div>
  );
}
