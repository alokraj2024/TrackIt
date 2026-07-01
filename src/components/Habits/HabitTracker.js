'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, X, Flame, Check, Trash2, Edit3, Save, Trophy } from 'lucide-react';
import styles from './HabitTracker.module.css';

const HABIT_ICONS = ['💪', '📚', '🧘', '💧', '🏃', '🎨', '🎵', '💤', '🥗', '✍️', '🧠', '🌅', '🚶', '💊', '📝', '🧹'];

export default function HabitTracker() {
  const { user, updateXP } = useAuth();
  const [habits, setHabits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '💪',
    frequency: 'daily',
    target: 1,
  });

  const storageKey = `trackit_habits_${user?.id}`;
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) return;
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setHabits(saved);
  }, [user, storageKey]);

  const save = (updated) => {
    setHabits(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const resetForm = () => {
    setFormData({ name: '', icon: '💪', frequency: 'daily', target: 1 });
    setEditingHabit(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingHabit) {
      save(habits.map(h => h.id === editingHabit.id ? { ...h, name: formData.name, icon: formData.icon, frequency: formData.frequency, target: formData.target } : h));
    } else {
      const newHabit = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        icon: formData.icon,
        frequency: formData.frequency,
        target: formData.target,
        completedDates: [],
        streak: 0,
        bestStreak: 0,
        createdAt: new Date().toISOString(),
      };
      save([...habits, newHabit]);
      updateXP(5);
    }
    resetForm();
  };

  const toggleHabit = (habitId) => {
    save(habits.map(h => {
      if (h.id !== habitId) return h;

      const completedDates = [...(h.completedDates || [])];
      const doneToday = completedDates.includes(todayStr);

      if (doneToday) {
        // Un-complete
        const idx = completedDates.indexOf(todayStr);
        completedDates.splice(idx, 1);
        const streak = calculateStreak(completedDates);
        return { ...h, completedDates, streak, bestStreak: Math.max(h.bestStreak || 0, streak) };
      } else {
        // Complete
        completedDates.push(todayStr);
        const streak = calculateStreak(completedDates);
        updateXP(15);
        return { ...h, completedDates, streak, bestStreak: Math.max(h.bestStreak || 0, streak) };
      }
    }));
  };

  const calculateStreak = (dates) => {
    if (!dates || dates.length === 0) return 0;
    const sorted = [...dates].sort().reverse();
    let streak = 0;
    let current = new Date(todayStr);

    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i]);
      const expected = new Date(current);
      expected.setDate(expected.getDate() - i);

      if (d.toISOString().split('T')[0] === expected.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const deleteHabit = (id) => {
    save(habits.filter(h => h.id !== id));
  };

  const editHabit = (habit) => {
    setFormData({ name: habit.name, icon: habit.icon, frequency: habit.frequency || 'daily', target: habit.target || 1 });
    setEditingHabit(habit);
    setShowForm(true);
  };

  // Generate last 7 days for the mini calendar
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dayLabels = last7Days.map(d => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
  });

  const totalCompleted = habits.filter(h => h.completedDates?.includes(todayStr)).length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={`${styles.header} animate-fade-in`}>
        <div>
          <h1 className={styles.title}>Habit Tracker</h1>
          <p className={styles.subtitle}>
            {totalCompleted}/{habits.length} habits completed today
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'New Habit'}
        </button>
      </div>

      {/* Stats */}
      <div className={`${styles.statsRow} animate-fade-in delay-1`}>
        <div className={styles.statMini}>
          <Flame size={18} className={styles.fireIcon} />
          <div>
            <span className={styles.statNum}>{bestStreak}</span>
            <span className={styles.statLbl}>Best Streak</span>
          </div>
        </div>
        <div className={styles.statMini}>
          <Trophy size={18} className={styles.trophyIcon} />
          <div>
            <span className={styles.statNum}>{habits.reduce((sum, h) => sum + (h.completedDates?.length || 0), 0)}</span>
            <span className={styles.statLbl}>Total Check-ins</span>
          </div>
        </div>
        <div className={styles.statMini}>
          <Check size={18} className={styles.checkIcon} />
          <div>
            <span className={styles.statNum}>{habits.length > 0 ? Math.round((totalCompleted / habits.length) * 100) : 0}%</span>
            <span className={styles.statLbl}>Today's Rate</span>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className={`${styles.form} animate-scale-in`}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Habit Name</label>
              <input
                type="text"
                placeholder="e.g. Read 30 min, Drink water"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                autoFocus
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Icon</label>
              <div className={styles.iconPicker}>
                {HABIT_ICONS.map(icon => (
                  <button
                    key={icon}
                    className={`${styles.iconBtn} ${formData.icon === icon ? styles.activeIcon : ''}`}
                    onClick={() => setFormData({ ...formData, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn-secondary" onClick={resetForm}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit}>
              <Save size={16} />
              {editingHabit ? 'Update' : 'Create Habit'}
            </button>
          </div>
        </div>
      )}

      {/* Habit List */}
      <div className={styles.habitList}>
        {habits.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🌱</span>
            <h3>No habits yet</h3>
            <p>Start building good habits! Add your first one above.</p>
          </div>
        ) : (
          habits.map((habit, i) => {
            const doneToday = habit.completedDates?.includes(todayStr);
            return (
              <div
                key={habit.id}
                className={`${styles.habitCard} ${doneToday ? styles.completed : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={styles.habitMain}>
                  {/* Check button */}
                  <button
                    className={`${styles.checkBtn} ${doneToday ? styles.checked : ''}`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    {doneToday ? <Check size={20} /> : <span className={styles.habitIcon}>{habit.icon}</span>}
                  </button>

                  <div className={styles.habitInfo}>
                    <span className={styles.habitName}>{habit.name}</span>
                    <div className={styles.habitMeta}>
                      {habit.streak > 0 && (
                        <span className={styles.streakTag}>
                          🔥 {habit.streak} day{habit.streak > 1 ? 's' : ''}
                        </span>
                      )}
                      <span className={styles.totalTag}>
                        {habit.completedDates?.length || 0} total
                      </span>
                    </div>
                  </div>

                  {/* Mini calendar */}
                  <div className={styles.miniCalendar}>
                    {last7Days.map((d, j) => {
                      const done = habit.completedDates?.includes(d);
                      return (
                        <div key={d} className={styles.calDay}>
                          <span className={styles.calLabel}>{dayLabels[j]}</span>
                          <div className={`${styles.calDot} ${done ? styles.calDone : ''}`} />
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className={styles.habitActions}>
                    <button onClick={() => editHabit(habit)} title="Edit">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => deleteHabit(habit.id)} className={styles.delBtn} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
