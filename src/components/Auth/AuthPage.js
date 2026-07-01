'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!isLogin && !name) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));

    let result;
    if (isLogin) {
      result = login(email, password);
    } else {
      result = signup(name, email, password);
    }

    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      {/* Background effects */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />
      <div className={styles.gridOverlay} />

      <div className={styles.content}>
        {/* Left - Branding */}
        <div className={styles.brandSection}>
          <div className={styles.brandContent}>
            <div className={styles.logoRow}>
              <div className={styles.logoIcon}>
                <Zap size={28} />
              </div>
              <h1 className={styles.brandName}>TrackIt</h1>
            </div>
            <p className={styles.tagline}>
              Your productivity. <span className={styles.highlight}>Supercharged.</span>
            </p>
            <p className={styles.subTagline}>
              Manage your to-dos, build habits, schedule your day, and track your progress — all in one beautiful app.
            </p>
            <div className={styles.features}>
              {[
                { icon: '✅', text: 'Smart To-Do Lists' },
                { icon: '🔥', text: 'Habit Streaks' },
                { icon: '📅', text: 'Timetable Builder' },
                { icon: '⏱️', text: 'Pomodoro Timer' },
                { icon: '📈', text: 'Productivity Analytics' },
                { icon: '🏆', text: 'XP & Levels' },
              ].map((f, i) => (
                <div key={i} className={`${styles.featureItem} animate-fade-in delay-${i + 1}`}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Auth Form */}
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
              <p>{isLogin ? 'Sign in to continue your streak' : 'Start your productivity journey'}</p>
            </div>

            {error && (
              <div className={styles.errorMsg}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              {!isLogin && (
                <div className={styles.inputGroup}>
                  <label>Full Name</label>
                  <div className={styles.inputWrapper}>
                    <User size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>
              )}

              <div className={styles.inputGroup}>
                <label>Email</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className={styles.passToggle}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? (
                  <div className={styles.spinner} />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <button
              className={styles.switchBtn}
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? (
                <>
                  <Sparkles size={16} />
                  New here? Create an account
                </>
              ) : (
                <>Already have an account? Sign in</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
