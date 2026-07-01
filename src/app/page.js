'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AuthPage from '@/components/Auth/AuthPage';
import Sidebar from '@/components/Sidebar/Sidebar';
import Dashboard from '@/components/Dashboard/Dashboard';
import TodoList from '@/components/Todos/TodoList';
import Timetable from '@/components/Timetable/Timetable';
import HabitTracker from '@/components/Habits/HabitTracker';
import Pomodoro from '@/components/Pomodoro/Pomodoro';
import Analytics from '@/components/Analytics/Analytics';
import styles from './page.module.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loader}>
          <div className={styles.loaderDot} />
          <div className={styles.loaderDot} />
          <div className={styles.loaderDot} />
        </div>
        <span className={styles.loadingText}>Loading TrackIt...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'todos': return <TodoList />;
      case 'timetable': return <Timetable />;
      case 'habits': return <HabitTracker />;
      case 'pomodoro': return <Pomodoro />;
      case 'analytics': return <Analytics />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={styles.appLayout}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className={styles.mainContent}>
        {renderPage()}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
