'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('trackit_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const signup = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('trackit_users') || '[]');
    const exists = users.find(u => u.email === email);
    if (exists) {
      return { error: 'An account with this email already exists' };
    }
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In production, this would be hashed
      createdAt: new Date().toISOString(),
      xp: 0,
      level: 1,
    };
    users.push(newUser);
    localStorage.setItem('trackit_users', JSON.stringify(users));

    const { password: _, ...safeUser } = newUser;
    localStorage.setItem('trackit_user', JSON.stringify(safeUser));
    setUser(safeUser);

    // Initialize user data
    localStorage.setItem(`trackit_todos_${newUser.id}`, JSON.stringify([]));
    localStorage.setItem(`trackit_habits_${newUser.id}`, JSON.stringify([]));
    localStorage.setItem(`trackit_timetable_${newUser.id}`, JSON.stringify([]));
    localStorage.setItem(`trackit_pomodoro_${newUser.id}`, JSON.stringify({ sessions: [] }));

    return { success: true };
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('trackit_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      return { error: 'Invalid email or password' };
    }
    const { password: _, ...safeUser } = found;
    localStorage.setItem('trackit_user', JSON.stringify(safeUser));
    setUser(safeUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('trackit_user');
    setUser(null);
  };

  const updateXP = (amount) => {
    if (!user) return;
    const newXP = (user.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const updatedUser = { ...user, xp: newXP, level: newLevel };
    setUser(updatedUser);
    localStorage.setItem('trackit_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateXP }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
