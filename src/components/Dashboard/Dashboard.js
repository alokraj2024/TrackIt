'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  CheckCircle2,
  Flame,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Calendar,
  Quote,
} from 'lucide-react';
import styles from './Dashboard.module.css';

const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It's not about having time, it's about making time.", author: "Unknown" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [habits, setHabits] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    if (!user) return;
    const t = JSON.parse(localStorage.getItem(`trackit_todos_${user.id}`) || '[]');
    const h = JSON.parse(localStorage.getItem(`trackit_habits_${user.id}`) || '[]');
    const tt = JSON.parse(localStorage.getItem(`trackit_timetable_${user.id}`) || '[]');
    setTodos(t);
    setHabits(h);
    setTimetable(tt);
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [user]);

  const todayStr = new Date().toISOString().split('T')[0];
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

  const completedToday = todos.filter(t => t.completed && t.completedAt?.startsWith(todayStr)).length;
  const pendingTodos = todos.filter(t => !t.completed).length;

  const todayHabits = habits.map(h => {
    const doneToday = h.completedDates?.includes(todayStr);
    return { ...h, doneToday };
  });
  const habitsCompletedToday = todayHabits.filter(h => h.doneToday).length;

  const currentStreak = habits.reduce((max, h) => {
    const streak = h.streak || 0;
    return streak > max ? streak : max;
  }, 0);

  const todaySchedule = timetable.filter(slot => slot.day === dayOfWeek);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={`${styles.header} animate-fade-in`}>
        <div>
          <h1 className={styles.greeting}>
            {greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className={styles.date}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className={styles.levelBadge}>
          <Zap size={16} />
          Level {user?.level || 1}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {[
          {
            icon: CheckCircle2,
            label: 'Tasks Done Today',
            value: completedToday,
            sub: `${pendingTodos} pending`,
            color: 'blue',
          },
          {
            icon: Flame,
            label: 'Habits Completed',
            value: `${habitsCompletedToday}/${habits.length}`,
            sub: 'today',
            color: 'emerald',
          },
          {
            icon: TrendingUp,
            label: 'Best Streak',
            value: `${currentStreak} days`,
            sub: 'keep going!',
            color: 'amber',
          },
          {
            icon: Target,
            label: 'Total XP',
            value: user?.xp || 0,
            sub: `${100 - ((user?.xp || 0) % 100)} to next level`,
            color: 'purple',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`${styles.statCard} ${styles[stat.color]} animate-fade-in delay-${i + 1}`}>
              <div className={styles.statIcon}>
                <Icon size={22} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statSub}>{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        {/* Today's Tasks */}
        <div className={`${styles.card} animate-fade-in delay-2`}>
          <div className={styles.cardHeader}>
            <h3><CheckCircle2 size={18} /> Today's Tasks</h3>
            <span className={styles.cardBadge}>{pendingTodos} pending</span>
          </div>
          <div className={styles.cardBody}>
            {todos.filter(t => !t.completed).length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🎉</span>
                <p>All caught up! Add new tasks in To-Do Lists.</p>
              </div>
            ) : (
              todos.filter(t => !t.completed).slice(0, 5).map((todo, i) => (
                <div key={todo.id} className={styles.taskItem}>
                  <div className={`${styles.priorityDot} ${styles[`priority-${todo.priority || 'medium'}`]}`} />
                  <span className={styles.taskText}>{todo.text}</span>
                  {todo.category && <span className={`badge badge-${todo.categoryColor || 'blue'}`}>{todo.category}</span>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className={`${styles.card} animate-fade-in delay-3`}>
          <div className={styles.cardHeader}>
            <h3><Calendar size={18} /> Today's Schedule</h3>
            <span className={styles.cardBadge}>{dayOfWeek}</span>
          </div>
          <div className={styles.cardBody}>
            {todaySchedule.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📅</span>
                <p>No classes scheduled today. Set up your timetable!</p>
              </div>
            ) : (
              todaySchedule.sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, 5).map((slot, i) => (
                <div key={slot.id} className={styles.scheduleItem}>
                  <div className={styles.scheduleTime}>
                    <Clock size={14} />
                    {slot.startTime} - {slot.endTime}
                  </div>
                  <span className={styles.scheduleSubject} style={{ borderLeftColor: slot.color || 'var(--accent-blue)' }}>
                    {slot.subject}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Habit Progress */}
        <div className={`${styles.card} animate-fade-in delay-4`}>
          <div className={styles.cardHeader}>
            <h3><Flame size={18} /> Habit Progress</h3>
            <span className={styles.cardBadge}>{habitsCompletedToday}/{habits.length}</span>
          </div>
          <div className={styles.cardBody}>
            {habits.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🌱</span>
                <p>No habits yet. Start building good habits!</p>
              </div>
            ) : (
              todayHabits.slice(0, 5).map((habit, i) => (
                <div key={habit.id} className={styles.habitItem}>
                  <span className={styles.habitEmoji}>{habit.icon || '📌'}</span>
                  <span className={styles.habitName}>{habit.name}</span>
                  <div className={styles.habitStatus}>
                    {habit.doneToday ? (
                      <span className={styles.habitDone}>✅</span>
                    ) : (
                      <span className={styles.habitPending}>○</span>
                    )}
                  </div>
                  {habit.streak > 0 && (
                    <span className={styles.streakBadge}>🔥 {habit.streak}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Motivational Quote */}
        <div className={`${styles.quoteCard} animate-fade-in delay-5`}>
          <Quote size={24} className={styles.quoteIcon} />
          <p className={styles.quoteText}>"{quote.text}"</p>
          <span className={styles.quoteAuthor}>— {quote.author}</span>
        </div>
      </div>
    </div>
  );
}
