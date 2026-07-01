'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BarChart3, TrendingUp, Target, Flame, CheckCircle2, Calendar } from 'lucide-react';
import styles from './Analytics.module.css';

export default function Analytics() {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [habits, setHabits] = useState([]);
  const [pomodoroData, setPomodoroData] = useState({});

  useEffect(() => {
    if (!user) return;
    setTodos(JSON.parse(localStorage.getItem(`trackit_todos_${user.id}`) || '[]'));
    setHabits(JSON.parse(localStorage.getItem(`trackit_habits_${user.id}`) || '[]'));
    setPomodoroData(JSON.parse(localStorage.getItem(`trackit_pomodoro_${user.id}`) || '{}'));
  }, [user]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Task stats
  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.completed).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Tasks by priority
  const tasksByPriority = {
    urgent: todos.filter(t => t.priority === 'urgent').length,
    high: todos.filter(t => t.priority === 'high').length,
    medium: todos.filter(t => t.priority === 'medium').length,
    low: todos.filter(t => t.priority === 'low').length,
  };

  // Habit stats
  const totalHabits = habits.length;
  const totalCheckins = habits.reduce((sum, h) => sum + (h.completedDates?.length || 0), 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0);
  const habitsCompletedToday = habits.filter(h => h.completedDates?.includes(todayStr)).length;

  // Last 7 days habit completion
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weeklyHabitData = last7Days.map(day => {
    const completed = habits.filter(h => h.completedDates?.includes(day)).length;
    return {
      day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
      completed,
      total: totalHabits,
      percentage: totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0,
    };
  });

  // Pomodoro stats
  const totalSessions = pomodoroData.sessions || 0;
  const focusMinutes = totalSessions * 25;

  // Productivity score (weighted average)
  const productivityScore = Math.round(
    (taskCompletionRate * 0.4) +
    (totalHabits > 0 ? (habitsCompletedToday / totalHabits) * 100 * 0.35 : 0) +
    (totalSessions > 0 ? Math.min(totalSessions * 10, 100) * 0.25 : 0)
  );

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-fade-in`}>
        <h1 className={styles.title}>Analytics</h1>
        <p className={styles.subtitle}>Track your productivity progress</p>
      </div>

      {/* Productivity Score */}
      <div className={`${styles.scoreCard} animate-fade-in delay-1`}>
        <div className={styles.scoreRing}>
          <svg viewBox="0 0 120 120" className={styles.scoreSvg}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-color)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - productivityScore / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-blue)" />
                <stop offset="100%" stopColor="var(--accent-purple)" />
              </linearGradient>
            </defs>
          </svg>
          <div className={styles.scoreValue}>
            <span className={styles.scoreNum}>{productivityScore}</span>
            <span className={styles.scoreLabel}>Score</span>
          </div>
        </div>
        <div className={styles.scoreInfo}>
          <h2>Productivity Score</h2>
          <p>Based on task completion, habit consistency, and focus sessions</p>
          <div className={styles.scoreBreakdown}>
            <div className={styles.breakdownItem}>
              <span className={styles.breakdownDot} style={{ background: 'var(--accent-blue)' }} />
              <span>Tasks: {taskCompletionRate}%</span>
            </div>
            <div className={styles.breakdownItem}>
              <span className={styles.breakdownDot} style={{ background: 'var(--accent-emerald)' }} />
              <span>Habits: {totalHabits > 0 ? Math.round((habitsCompletedToday / totalHabits) * 100) : 0}%</span>
            </div>
            <div className={styles.breakdownItem}>
              <span className={styles.breakdownDot} style={{ background: 'var(--accent-purple)' }} />
              <span>Focus: {totalSessions} sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {[
          { icon: CheckCircle2, label: 'Tasks Completed', value: `${completedTasks}/${totalTasks}`, color: 'blue' },
          { icon: Flame, label: 'Best Streak', value: `${bestStreak} days`, color: 'amber' },
          { icon: Target, label: 'Total Check-ins', value: totalCheckins, color: 'emerald' },
          { icon: BarChart3, label: 'Focus Time', value: `${focusMinutes} min`, color: 'purple' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`${styles.statCard} ${styles[stat.color]} animate-fade-in delay-${i + 1}`}>
              <Icon size={20} />
              <span className={styles.statVal}>{stat.value}</span>
              <span className={styles.statLbl}>{stat.label}</span>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Weekly Habit Chart */}
        <div className={`${styles.chartCard} animate-fade-in delay-2`}>
          <h3 className={styles.chartTitle}>
            <Calendar size={18} />
            Weekly Habit Completion
          </h3>
          <div className={styles.barChart}>
            {weeklyHabitData.map((d, i) => (
              <div key={i} className={styles.barCol}>
                <div className={styles.barWrapper}>
                  <div
                    className={styles.bar}
                    style={{
                      height: `${Math.max(d.percentage, 4)}%`,
                      background: d.percentage >= 80 ? 'var(--accent-emerald)' : d.percentage >= 50 ? 'var(--accent-blue)' : 'var(--accent-amber)',
                    }}
                  />
                </div>
                <span className={styles.barLabel}>{d.day}</span>
                <span className={styles.barValue}>{d.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className={`${styles.chartCard} animate-fade-in delay-3`}>
          <h3 className={styles.chartTitle}>
            <TrendingUp size={18} />
            Tasks by Priority
          </h3>
          <div className={styles.priorityChart}>
            {[
              { label: 'Urgent', count: tasksByPriority.urgent, color: '#ef4444' },
              { label: 'High', count: tasksByPriority.high, color: 'var(--accent-rose)' },
              { label: 'Medium', count: tasksByPriority.medium, color: 'var(--accent-amber)' },
              { label: 'Low', count: tasksByPriority.low, color: 'var(--accent-blue)' },
            ].map((p, i) => (
              <div key={i} className={styles.priorityRow}>
                <div className={styles.priorityInfo}>
                  <div className={styles.priorityDot} style={{ background: p.color }} />
                  <span>{p.label}</span>
                </div>
                <div className={styles.priorityBar}>
                  <div
                    className={styles.priorityFill}
                    style={{
                      width: `${totalTasks > 0 ? (p.count / totalTasks) * 100 : 0}%`,
                      background: p.color,
                    }}
                  />
                </div>
                <span className={styles.priorityCount}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Habits */}
        <div className={`${styles.chartCard} ${styles.fullWidth} animate-fade-in delay-4`}>
          <h3 className={styles.chartTitle}>
            <Flame size={18} />
            Habit Leaderboard
          </h3>
          {habits.length === 0 ? (
            <div className={styles.emptyChart}>
              <p>No habits tracked yet. Start building habits!</p>
            </div>
          ) : (
            <div className={styles.leaderboard}>
              {[...habits]
                .sort((a, b) => (b.streak || 0) - (a.streak || 0))
                .map((habit, i) => (
                  <div key={habit.id} className={styles.leaderRow}>
                    <span className={styles.rank}>#{i + 1}</span>
                    <span className={styles.leaderIcon}>{habit.icon || '📌'}</span>
                    <span className={styles.leaderName}>{habit.name}</span>
                    <div className={styles.leaderStats}>
                      <span className={styles.leaderStreak}>🔥 {habit.streak || 0}</span>
                      <span className={styles.leaderTotal}>{habit.completedDates?.length || 0} days</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
