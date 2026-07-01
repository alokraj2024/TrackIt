'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, X, Clock, Edit3, Trash2, Save, StickyNote } from 'lucide-react';
import styles from './Timetable.module.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 20 }, (_, i) => {
  const h = i + 4; // 4 AM to 11 PM
  return `${h.toString().padStart(2, '0')}:00`;
});
const FIRST_HOUR = 4; // grid starts at 4 AM
const CELL_HEIGHT = 56; // px per hour row

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

export default function Timetable() {
  const { user, updateXP } = useAuth();
  const [slots, setSlots] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [cellInput, setCellInput] = useState('');
  const [editingSlot, setEditingSlot] = useState(null);
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [noteSlot, setNoteSlot] = useState(null); // slot whose note is being edited
  const [noteText, setNoteText] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    color: COLORS[0],
    location: '',
    note: '',
  });
  const inputRef = useRef(null);
  const noteInputRef = useRef(null);

  const storageKey = `trackit_timetable_${user?.id}`;

  useEffect(() => {
    if (!user) return;
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setSlots(saved);
  }, [user, storageKey]);

  useEffect(() => {
    if (editingCell && inputRef.current) inputRef.current.focus();
  }, [editingCell]);

  useEffect(() => {
    if (noteSlot && noteInputRef.current) noteInputRef.current.focus();
  }, [noteSlot]);

  const save = (updated) => {
    setSlots(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // ---- Time helpers ----
  const timeToMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const formatHour = (hourStr) => {
    const h = parseInt(hourStr);
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  // ---- Quick Add (click on cell) ----
  const handleCellClick = (day, hour) => {
    const existing = getSlotsForCell(day, hour);
    if (existing.length > 0) return;
    setEditingCell({ day, hour });
    setCellInput('');
  };

  const handleCellSubmit = () => {
    if (!cellInput.trim() || !editingCell) {
      setEditingCell(null);
      setCellInput('');
      return;
    }
    const hourNum = parseInt(editingCell.hour);
    const newSlot = {
      id: Date.now().toString(),
      subject: cellInput.trim(),
      day: editingCell.day,
      startTime: editingCell.hour,
      endTime: `${(hourNum + 1).toString().padStart(2, '0')}:00`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      location: '',
      note: '',
    };
    save([...slots, newSlot]);
    updateXP(5);
    setEditingCell(null);
    setCellInput('');
  };

  const handleCellKeyDown = (e) => {
    if (e.key === 'Enter') handleCellSubmit();
    else if (e.key === 'Escape') { setEditingCell(null); setCellInput(''); }
  };

  // ---- Note editing ----
  const openNote = (e, slot) => {
    e.stopPropagation();
    setNoteSlot(slot);
    setNoteText(slot.note || '');
  };

  const saveNote = () => {
    if (!noteSlot) return;
    save(slots.map(s => s.id === noteSlot.id ? { ...s, note: noteText } : s));
    setNoteSlot(null);
    setNoteText('');
  };

  // ---- Detailed Form ----
  const resetForm = () => {
    setFormData({ subject: '', day: 'Monday', startTime: '09:00', endTime: '10:00', color: COLORS[0], location: '', note: '' });
    setEditingSlot(null);
    setShowDetailForm(false);
  };

  const handleFormSubmit = () => {
    if (!formData.subject.trim()) return;
    if (editingSlot) {
      save(slots.map(s => s.id === editingSlot.id ? { ...formData, id: editingSlot.id } : s));
    } else {
      save([...slots, { ...formData, id: Date.now().toString(), subject: formData.subject.trim() }]);
      updateXP(5);
    }
    resetForm();
  };

  const editSlot = (e, slot) => {
    e.stopPropagation();
    setFormData({ ...slot, note: slot.note || '' });
    setEditingSlot(slot);
    setShowDetailForm(true);
  };

  const deleteSlot = (e, id) => {
    e.stopPropagation();
    save(slots.filter(s => s.id !== id));
  };

  // ---- Slot position (pixel-accurate) ----
  const getSlotsForCell = (day, hour) => {
    const cellH = parseInt(hour.split(':')[0]);
    return slots.filter(s => {
      if (s.day !== day) return false;
      const startMin = timeToMinutes(s.startTime);
      const endMin = timeToMinutes(s.endTime);
      const cellStart = cellH * 60;
      const cellEnd = (cellH + 1) * 60;
      return startMin < cellEnd && endMin > cellStart;
    });
  };

  const getSlotsForDay = (day) => {
    return slots.filter(s => s.day === day);
  };

  const getSlotStyle = (slot) => {
    const startMin = timeToMinutes(slot.startTime);
    const endMin = timeToMinutes(slot.endTime);
    const gridStartMin = FIRST_HOUR * 60;
    const topPx = ((startMin - gridStartMin) / 60) * CELL_HEIGHT;
    const heightPx = ((endMin - startMin) / 60) * CELL_HEIGHT;
    return {
      top: `${topPx}px`,
      height: `${Math.max(heightPx, 24)}px`,
      background: `${slot.color}18`,
      borderLeft: `3px solid ${slot.color}`,
    };
  };

  // Current time
  const now = new Date();
  const currentDay = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];
  const currentHour = now.getHours();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimePx = ((currentMinutes - FIRST_HOUR * 60) / 60) * CELL_HEIGHT;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={`${styles.header} animate-fade-in`}>
        <div>
          <h1 className={styles.title}>Timetable</h1>
          <p className={styles.subtitle}>
            {slots.length} activit{slots.length === 1 ? 'y' : 'ies'} scheduled · Click any cell to add
          </p>
        </div>
        <button className="btn-primary" onClick={() => { if (showDetailForm) resetForm(); else setShowDetailForm(true); }}>
          {showDetailForm ? <X size={18} /> : <Plus size={18} />}
          {showDetailForm ? 'Cancel' : 'Detailed Add'}
        </button>
      </div>

      {/* Note Modal */}
      {noteSlot && (
        <div className={styles.noteOverlay} onClick={() => { saveNote(); }}>
          <div className={styles.noteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.noteHeader}>
              <StickyNote size={18} />
              <h3>Note for <span style={{ color: noteSlot.color }}>{noteSlot.subject}</span></h3>
              <button className={styles.noteClose} onClick={saveNote}><X size={16} /></button>
            </div>
            <textarea
              ref={noteInputRef}
              className={styles.noteTextarea}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your note here... e.g. Learn Arrays, Solve 5 problems, Revise chapter 3"
              rows={4}
            />
            <div className={styles.noteActions}>
              <button className="btn-secondary" onClick={() => { setNoteSlot(null); setNoteText(''); }}>Cancel</button>
              <button className="btn-primary" onClick={saveNote}><Save size={16} /> Save Note</button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Add/Edit Form */}
      {showDetailForm && (
        <div className={`${styles.form} animate-scale-in`}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Activity</label>
              <input type="text" placeholder="e.g. Wake Up, Study, Gym" value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="input-field" autoFocus />
            </div>
            <div className={styles.formGroup}>
              <label>Day</label>
              <select value={formData.day} onChange={(e) => setFormData({ ...formData, day: e.target.value })} className="input-field">
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Start Time</label>
              <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="input-field" />
            </div>
            <div className={styles.formGroup}>
              <label>End Time</label>
              <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="input-field" />
            </div>
            <div className={styles.formGroup}>
              <label>Location (optional)</label>
              <input type="text" placeholder="e.g. Home, Room 101" value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input-field" />
            </div>
            <div className={styles.formGroup}>
              <label>Color</label>
              <div className={styles.colorPicker}>
                {COLORS.map(c => (
                  <button key={c} className={`${styles.colorDot} ${formData.color === c ? styles.activeColor : ''}`}
                    style={{ background: c }} onClick={() => setFormData({ ...formData, color: c })} />
                ))}
              </div>
            </div>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label>Note (optional)</label>
              <input type="text" placeholder="e.g. Learn Arrays, Revise Chapter 3" value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn-secondary" onClick={resetForm}>Cancel</button>
            <button className="btn-primary" onClick={handleFormSubmit}>
              <Save size={16} /> {editingSlot ? 'Update' : 'Add Activity'}
            </button>
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      <div className={`${styles.tableWrapper} animate-fade-in delay-1`}>
        <div className={styles.table}>
          {/* Header Row */}
          <div className={styles.headerRow}>
            <div className={styles.timeHeader}><Clock size={14} /></div>
            {DAYS.map(day => (
              <div key={day} className={`${styles.dayHeader} ${day === currentDay ? styles.today : ''}`}>
                <span className={styles.dayShort}>{day.slice(0, 3)}</span>
                <span className={styles.dayFull}>{day}</span>
              </div>
            ))}
          </div>

          {/* Grid Body — time labels + day columns with absolute-positioned slots */}
          <div className={styles.gridBody}>
            {/* Time labels column */}
            <div className={styles.timeColumn}>
              {HOURS.map(hour => (
                <div key={hour} className={`${styles.timeCell} ${parseInt(hour) === currentHour ? styles.currentTimeCell : ''}`}>
                  <span className={styles.timeLabel}>{formatHour(hour)}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map(day => {
              const daySlots = getSlotsForDay(day);
              const isToday = day === currentDay;

              return (
                <div key={day} className={`${styles.dayColumn} ${isToday ? styles.todayColumn : ''}`}>
                  {/* Hour grid lines (clickable cells) */}
                  {HOURS.map(hour => {
                    const cellH = parseInt(hour);
                    const isCurrentHour = cellH === currentHour && isToday;
                    const isEditing = editingCell?.day === day && editingCell?.hour === hour;
                    const cellSlots = getSlotsForCell(day, hour);
                    const isEmpty = cellSlots.length === 0;

                    return (
                      <div
                        key={hour}
                        className={`${styles.cell} ${isCurrentHour ? styles.nowCell : ''} ${isEmpty && !isEditing ? styles.clickable : ''}`}
                        onClick={() => isEmpty && !isEditing && handleCellClick(day, hour)}
                      >
                        {isEditing && (
                          <div className={styles.inlineEdit}>
                            <input ref={inputRef} type="text" value={cellInput}
                              onChange={(e) => setCellInput(e.target.value)}
                              onKeyDown={handleCellKeyDown} onBlur={handleCellSubmit}
                              placeholder="Type activity..." className={styles.inlineInput} />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Absolutely positioned slot cards */}
                  {daySlots.map(slot => (
                    <div key={slot.id} className={styles.slotCard} style={getSlotStyle(slot)}>
                      <span className={styles.slotSubject} style={{ color: slot.color }}>{slot.subject}</span>
                      {slot.note && <span className={styles.slotNote}>📝 {slot.note}</span>}
                      {slot.location && <span className={styles.slotLocation}>{slot.location}</span>}
                      <span className={styles.slotTime}>{slot.startTime} – {slot.endTime}</span>
                      <div className={styles.slotActions}>
                        <button onClick={(e) => openNote(e, slot)} title="Add Note"><StickyNote size={12} /></button>
                        <button onClick={(e) => editSlot(e, slot)} title="Edit"><Edit3 size={12} /></button>
                        <button onClick={(e) => deleteSlot(e, slot.id)} title="Delete"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}

                  {/* Current time line */}
                  {isToday && currentTimePx > 0 && currentTimePx < HOURS.length * CELL_HEIGHT && (
                    <div className={styles.nowLine} style={{ top: `${currentTimePx}px` }}>
                      <div className={styles.nowDot} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
