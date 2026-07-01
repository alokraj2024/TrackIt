'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Flame,
  Timer,
  BarChart3,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'todos', label: 'To-Do Lists', icon: CheckSquare },
  { id: 'timetable', label: 'Timetable', icon: Calendar },
  { id: 'habits', label: 'Habits', icon: Flame },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const xpProgress = user ? ((user.xp || 0) % 100) : 0;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Zap size={22} />
          </div>
          {!collapsed && <span className={styles.logoText}>TrackIt</span>}
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
                {isActive && <div className={styles.activeIndicator} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className={styles.bottomSection}>
          {/* XP Bar */}
          {!collapsed && user && (
            <div className={styles.xpCard}>
              <div className={styles.xpHeader}>
                <span className={styles.xpLevel}>Level {user.level || 1}</span>
                <span className={styles.xpAmount}>{xpProgress}/100 XP</span>
              </div>
              <div className={styles.xpBarTrack}>
                <div
                  className={styles.xpBarFill}
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Theme toggle */}
          <button className={styles.navItem} onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* Logout */}
          <button className={styles.navItem} onClick={logout} title="Log out">
            <LogOut size={20} />
            {!collapsed && <span>Log Out</span>}
          </button>

          {/* User info */}
          {!collapsed && user && (
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
