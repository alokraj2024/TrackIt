'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Check,
  Trash2,
  Edit3,
  X,
  ChevronDown,
  Tag,
  Flag,
  Calendar,
} from 'lucide-react';
import styles from './TodoList.module.css';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'var(--accent-blue)' },
  { value: 'medium', label: 'Medium', color: 'var(--accent-amber)' },
  { value: 'high', label: 'High', color: 'var(--accent-rose)' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];

const CATEGORIES = [
  { name: 'Work', color: 'blue' },
  { name: 'Personal', color: 'emerald' },
  { name: 'Study', color: 'purple' },
  { name: 'Health', color: 'amber' },
  { name: 'Other', color: 'rose' },
];

export default function TodoList() {
  const { user, updateXP } = useAuth();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const storageKey = `trackit_todos_${user?.id}`;

  useEffect(() => {
    if (!user) return;
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setTodos(saved);
  }, [user, storageKey]);

  const save = (updated) => {
    setTodos(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      priority,
      category: category || null,
      categoryColor: CATEGORIES.find(c => c.name === category)?.color || 'blue',
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    save([todo, ...todos]);
    setNewTodo('');
    setPriority('medium');
    setCategory('');
    setShowAddForm(false);
    updateXP(5);
  };

  const toggleTodo = (id) => {
    const updated = todos.map(t => {
      if (t.id === id) {
        const completed = !t.completed;
        if (completed) updateXP(10);
        return {
          ...t,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        };
      }
      return t;
    });
    save(updated);
  };

  const deleteTodo = (id) => {
    save(todos.filter(t => t.id !== id));
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    save(todos.map(t => t.id === id ? { ...t, text: editText.trim() } : t));
    setEditingId(null);
    setEditText('');
  };

  // Filtering
  const filtered = todos.filter(t => {
    if (searchQuery && !t.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterStatus === 'active' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    return true;
  });

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={`${styles.header} animate-fade-in`}>
        <div>
          <h1 className={styles.title}>To-Do Lists</h1>
          <p className={styles.subtitle}>
            {completedCount}/{totalCount} tasks completed
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className={`${styles.progressSection} animate-fade-in delay-1`}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className={styles.progressText}>
            {Math.round((completedCount / totalCount) * 100)}% complete
          </span>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className={`${styles.addForm} animate-scale-in`}>
          <input
            type="text"
            placeholder="What do you need to do?"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            className={`input-field ${styles.addInput}`}
            autoFocus
          />
          <div className={styles.addOptions}>
            <div className={styles.optionGroup}>
              <Flag size={14} />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={styles.select}
              >
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.optionGroup}>
              <Tag size={14} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.select}
              >
                <option value="">No Category</option>
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <button className="btn-primary" onClick={addTodo}>
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className={`${styles.controls} animate-fade-in delay-1`}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Tasks</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Todo List */}
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📝</span>
            <h3>No tasks found</h3>
            <p>{todos.length === 0 ? 'Add your first task to get started!' : 'Try adjusting your filters.'}</p>
          </div>
        ) : (
          filtered.map((todo, i) => (
            <div
              key={todo.id}
              className={`${styles.todoItem} ${todo.completed ? styles.completed : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <button
                className={`${styles.checkbox} ${todo.completed ? styles.checked : ''}`}
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.completed && <Check size={14} />}
              </button>

              <div className={`${styles.todoPriority} ${styles[`p-${todo.priority}`]}`} />

              {editingId === todo.id ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(todo.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onBlur={() => saveEdit(todo.id)}
                  className={styles.editInput}
                  autoFocus
                />
              ) : (
                <span className={styles.todoText}>{todo.text}</span>
              )}

              {todo.category && (
                <span className={`badge badge-${todo.categoryColor}`}>
                  {todo.category}
                </span>
              )}

              <div className={styles.todoActions}>
                <button
                  className={styles.actionBtn}
                  onClick={() => startEdit(todo)}
                  title="Edit"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => deleteTodo(todo.id)}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
