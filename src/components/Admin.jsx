import React, { useState, useEffect, useMemo } from 'react';
import {
  getStoredProjects,
  saveStoredProjects,
  getStoredMilestones,
  saveStoredMilestones,
  getStoredAchievements,
  saveStoredAchievements,
  resetAllDataToDefault,
  verifyAdminPassword,
  setCustomAdminPassword
} from '../data/storage';

const POPULAR_TAGS = [
  'React', 'Next.js', 'Python', 'PyTorch', 'OpenCV',
  'Node.js', 'FastAPI', 'MongoDB', 'Docker', 'TypeScript',
  'TailwindCSS', 'C++', 'TensorFlow', 'PostgreSQL', 'LangChain'
];

const EMOJI_PRESETS = ['🏆', '💻', '🧠', '🚀', '🎓', '⭐', '⚡', '🥇', '🛠️', '💡', '🤖', '📊'];

export default function Admin({ onNavigateHome }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'achievements' | 'milestones' | 'settings'
  const [notification, setNotification] = useState(null);

  // Data state
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Search, Filter & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modals & Editing states
  const [editingProject, setEditingProject] = useState(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null);

  const [editingMilestone, setEditingMilestone] = useState(null);
  const [isNewMilestone, setIsNewMilestone] = useState(false);
  const [previewFlip, setPreviewFlip] = useState(false);
  const [deleteConfirmMilestone, setDeleteConfirmMilestone] = useState(null);

  const [newAchievementText, setNewAchievementText] = useState('');
  const [editingAchievementIdx, setEditingAchievementIdx] = useState(null);
  const [editingAchievementText, setEditingAchievementText] = useState('');

  // Password change state
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [confirmPasswordVal, setConfirmPasswordVal] = useState('');
  const [rawJsonPaste, setRawJsonPaste] = useState('');

  useEffect(() => {
    // Do not restore session from storage so user must re-enter password on every page reload
    setIsAuthenticated(false);
    loadAllData();
  }, []);

  const loadAllData = () => {
    setProjects(getStoredProjects());
    setMilestones(getStoredMilestones());
    setAchievements(getStoredAchievements());
  };

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (verifyAdminPassword(passwordInput)) {
      setIsAuthenticated(true);
      setAuthError('');
      showToast('Logged in successfully!');
    } else {
      setAuthError('Incorrect master passcode. Access denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    showToast('Logged out of admin session', 'info');
  };

  // -------------------------------------------------------------
  // STATS
  // -------------------------------------------------------------
  const stats = useMemo(() => {
    const categoriesSet = new Set(projects.map(p => p.category).filter(Boolean));
    return {
      totalProjects: projects.length,
      categoriesCount: categoriesSet.size,
      totalAchievements: achievements.length,
      totalMilestones: milestones.length
    };
  }, [projects, achievements, milestones]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query || 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.tags || []).some(t => t.toLowerCase().includes(query)) ||
        (p.id || '').toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [projects, selectedCategoryFilter, searchQuery]);

  // Unique categories list for filter
  const allCategories = useMemo(() => {
    const set = new Set();
    projects.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  // -------------------------------------------------------------
  // PROJECTS CRUD
  // -------------------------------------------------------------
  const handleOpenAddProject = () => {
    const nextNum = projects.length + 1;
    const paddedNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    setEditingProject({
      id: `FILE_${paddedNum}`,
      title: '',
      category: 'ai-ml',
      categoryLabel: 'AI / ML',
      description: '',
      highlights: [''],
      tags: ['React', 'Python'],
      githubUrl: 'https://github.com',
      liveUrl: '#'
    });
    setTagInput('');
    setIsNewProject(true);
  };

  const handleOpenEditProject = (proj) => {
    setEditingProject(JSON.parse(JSON.stringify(proj)));
    setTagInput('');
    setIsNewProject(false);
  };

  const handleDuplicateProject = (proj) => {
    const nextNum = projects.length + 1;
    const paddedNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    const duplicated = {
      ...JSON.parse(JSON.stringify(proj)),
      id: `FILE_${paddedNum}`,
      title: `${proj.title} (Copy)`
    };
    const updated = [duplicated, ...projects];
    setProjects(updated);
    saveStoredProjects(updated);
    showToast(`Duplicated "${proj.title}"`);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!editingProject.title.trim()) {
      alert('Please enter a project title.');
      return;
    }

    const cleanedHighlights = (editingProject.highlights || []).filter(h => h.trim() !== '');
    const cleanedTags = (editingProject.tags || []).filter(t => t.trim() !== '');

    const projectToSave = {
      ...editingProject,
      highlights: cleanedHighlights.length > 0 ? cleanedHighlights : ['Custom feature highlight'],
      tags: cleanedTags.length > 0 ? cleanedTags : ['Software']
    };

    let updatedList;
    if (isNewProject) {
      updatedList = [projectToSave, ...projects];
      showToast(`Created project "${projectToSave.title}"`);
    } else {
      updatedList = projects.map(p => p.id === projectToSave.id ? projectToSave : p);
      showToast(`Saved changes to "${projectToSave.title}"`);
    }

    setProjects(updatedList);
    saveStoredProjects(updatedList);
    setEditingProject(null);
  };

  const handleDeleteProject = (id) => {
    const updatedList = projects.filter(p => p.id !== id);
    setProjects(updatedList);
    saveStoredProjects(updatedList);
    setDeleteConfirmProject(null);
    showToast('Project deleted', 'info');
  };

  const handleMoveProject = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= projects.length) return;
    const updatedList = [...projects];
    const [moved] = updatedList.splice(index, 1);
    updatedList.splice(targetIdx, 0, moved);
    setProjects(updatedList);
    saveStoredProjects(updatedList);
  };

  const handleAddTag = (tagToAdd) => {
    const clean = tagToAdd.trim();
    if (!clean) return;
    const existing = editingProject.tags || [];
    if (!existing.includes(clean)) {
      setEditingProject({
        ...editingProject,
        tags: [...existing, clean]
      });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditingProject({
      ...editingProject,
      tags: (editingProject.tags || []).filter(t => t !== tagToRemove)
    });
  };

  // -------------------------------------------------------------
  // ACHIEVEMENTS CRUD
  // -------------------------------------------------------------
  const handleAddAchievement = (e) => {
    e.preventDefault();
    if (!newAchievementText.trim()) return;
    const updated = [...achievements, newAchievementText.trim()];
    setAchievements(updated);
    saveStoredAchievements(updated);
    setNewAchievementText('');
    showToast('Added new achievement bullet!');
  };

  const handleStartEditAchievement = (idx, text) => {
    setEditingAchievementIdx(idx);
    setEditingAchievementText(text);
  };

  const handleSaveAchievementEdit = (idx) => {
    if (!editingAchievementText.trim()) return;
    const updated = [...achievements];
    updated[idx] = editingAchievementText.trim();
    setAchievements(updated);
    saveStoredAchievements(updated);
    setEditingAchievementIdx(null);
    showToast('Updated achievement bullet!');
  };

  const handleDeleteAchievement = (idx) => {
    const updated = achievements.filter((_, i) => i !== idx);
    setAchievements(updated);
    saveStoredAchievements(updated);
    showToast('Achievement bullet removed', 'info');
  };

  const handleMoveAchievement = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= achievements.length) return;
    const updated = [...achievements];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setAchievements(updated);
    saveStoredAchievements(updated);
  };

  // -------------------------------------------------------------
  // MILESTONES CRUD
  // -------------------------------------------------------------
  const handleOpenAddMilestone = () => {
    setEditingMilestone({
      id: Date.now(),
      icon: '🏆',
      title: '',
      stamp: 'ACHIEVEMENT',
      description: '',
      tag: 'Honors'
    });
    setPreviewFlip(false);
    setIsNewMilestone(true);
  };

  const handleOpenEditMilestone = (ms) => {
    setEditingMilestone(JSON.parse(JSON.stringify(ms)));
    setPreviewFlip(false);
    setIsNewMilestone(false);
  };

  const handleSaveMilestone = (e) => {
    e.preventDefault();
    if (!editingMilestone.title.trim()) {
      alert('Please enter a milestone title.');
      return;
    }

    let updatedList;
    if (isNewMilestone) {
      updatedList = [...milestones, editingMilestone];
      showToast(`Added milestone card "${editingMilestone.title}"`);
    } else {
      updatedList = milestones.map(m => m.id === editingMilestone.id ? editingMilestone : m);
      showToast(`Updated milestone card "${editingMilestone.title}"`);
    }

    setMilestones(updatedList);
    saveStoredMilestones(updatedList);
    setEditingMilestone(null);
  };

  const handleDeleteMilestone = (id) => {
    const updatedList = milestones.filter(m => m.id !== id);
    setMilestones(updatedList);
    saveStoredMilestones(updatedList);
    setDeleteConfirmMilestone(null);
    showToast('Milestone card deleted', 'info');
  };

  const handleMoveMilestone = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= milestones.length) return;
    const updatedList = [...milestones];
    const [moved] = updatedList.splice(index, 1);
    updatedList.splice(targetIdx, 0, moved);
    setMilestones(updatedList);
    saveStoredMilestones(updatedList);
  };

  // -------------------------------------------------------------
  // BACKUP, RESTORE & SECURITY
  // -------------------------------------------------------------
  const handleExportJSON = () => {
    const data = {
      projects,
      milestones,
      achievements,
      version: '1.0',
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhavya_portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Portfolio backup file downloaded!');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.projects && Array.isArray(parsed.projects)) {
          setProjects(parsed.projects);
          saveStoredProjects(parsed.projects);
        }
        if (parsed.milestones && Array.isArray(parsed.milestones)) {
          setMilestones(parsed.milestones);
          saveStoredMilestones(parsed.milestones);
        }
        if (parsed.achievements && Array.isArray(parsed.achievements)) {
          setAchievements(parsed.achievements);
          saveStoredAchievements(parsed.achievements);
        }
        showToast('Backup restored successfully!');
      } catch (err) {
        alert('Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteJSON = () => {
    try {
      const parsed = JSON.parse(rawJsonPaste);
      if (parsed.projects && Array.isArray(parsed.projects)) {
        setProjects(parsed.projects);
        saveStoredProjects(parsed.projects);
      }
      if (parsed.milestones && Array.isArray(parsed.milestones)) {
        setMilestones(parsed.milestones);
        saveStoredMilestones(parsed.milestones);
      }
      if (parsed.achievements && Array.isArray(parsed.achievements)) {
        setAchievements(parsed.achievements);
        saveStoredAchievements(parsed.achievements);
      }
      setRawJsonPaste('');
      showToast('JSON applied successfully!');
    } catch (err) {
      alert('Could not parse JSON. Please check the syntax.');
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!newPasswordVal.trim()) {
      alert('Please enter a new password');
      return;
    }
    if (newPasswordVal !== confirmPasswordVal) {
      alert('Passwords do not match');
      return;
    }
    setCustomAdminPassword(newPasswordVal);
    setNewPasswordVal('');
    setConfirmPasswordVal('');
    showToast('Custom admin password updated successfully!');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all projects, achievements, and milestones to default factory state? This cannot be undone.')) {
      resetAllDataToDefault();
      loadAllData();
      showToast('Portfolio data restored to default', 'info');
    }
  };

  // -------------------------------------------------------------
  // LOGIN VIEW
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-notebook flex flex-col items-center justify-center p-6 relative selection:bg-ink-blue selection:text-white">
        {/* Back Link */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={onNavigateHome}
            className="font-mono text-xs sm:text-sm font-bold text-ink-blue border border-ink-blue/40 px-3.5 py-2 rounded-[2px] hover:bg-ink-blue hover:text-white transition-all cursor-pointer bg-white shadow-sm flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Return to Portfolio</span>
          </button>
        </div>

        {/* Console Box */}
        <div className="w-full max-w-md bg-white border-2 border-ink-blue rounded-[4px] p-8 shadow-polaroid relative z-10">
          {/* Top Washi Tape */}
          <div 
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-32 h-7 bg-washi opacity-90 rotate-1 pointer-events-none shadow-xs"
            style={{ clipPath: 'polygon(2% 0%, 98% 2%, 96% 98%, 0% 95%)' }}
          />

          <div className="text-center mb-6 pt-1">
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-ink-red tracking-widest uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-ink-red animate-ping" />
              <span>SECURITY GATE // AUTH_REQ</span>
            </div>
            <h1 className="font-typewriter text-3xl font-bold text-ink-blue tracking-tight">
              Admin Control Center
            </h1>
            <p className="font-mono text-xs text-ink-muted mt-1.5">
              Portfolio Content Management System
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block font-typewriter text-xs font-bold text-ink-blue mb-1.5">
                [ ENTER MASTER PASSCODE ]
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="Master Passcode..."
                  className="w-full font-mono text-sm p-3 pr-10 bg-[#fafbfc] border border-ink-blue/40 rounded-[2px] text-ink-dark focus:border-ink-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink-blue/15 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-blue text-xs font-mono font-bold p-1 cursor-pointer"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-300 text-red-700 font-mono text-xs rounded-[2px] flex items-center gap-2">
                <span>⚠</span>
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="font-mono text-sm font-bold px-6 py-3 bg-ink-blue text-white border-2 border-ink-blue shadow-btn-ink hover:bg-ink-dark hover:border-ink-dark hover:shadow-btn-ink-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer mt-1"
            >
              Authorize &amp; Launch &rarr;
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED DASHBOARD VIEW
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-notebook text-ink-dark font-mono antialiased pb-24 selection:bg-ink-blue selection:text-white">
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-[3px] shadow-2xl font-mono text-sm font-bold border-2 transition-all flex items-center gap-2 animate-bounce ${
          notification.type === 'info'
            ? 'bg-amber-50 text-amber-900 border-amber-400'
            : 'bg-emerald-50 text-emerald-950 border-emerald-500'
        }`}>
          <span className="text-base">{notification.type === 'info' ? 'ℹ' : '✓'}</span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#f8f9fa]/95 backdrop-blur-md border-b-2 border-ink-blue/20 px-6 py-3.5 shadow-xs">
        <div className="max-w-[1180px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateHome}
              className="font-mono text-xs sm:text-sm font-bold text-ink-blue hover:text-ink-red transition-colors flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 border border-ink-blue/30 rounded-[2px]"
            >
              <span>&larr;</span>
              <span>View Live Portfolio</span>
            </button>
            <span className="text-ink-light">|</span>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              <span className="font-typewriter font-bold text-ink-blue text-base sm:text-lg tracking-tight">
                ADMIN CONSOLE // Bhavya Agarwal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportJSON}
              title="Download backup file"
              className="font-mono text-xs font-bold px-3 py-1.5 bg-white border border-ink-blue/30 text-ink-blue hover:bg-ink-blue hover:text-white rounded-[2px] transition-all cursor-pointer shadow-xs flex items-center gap-1"
            >
              <span>⬇</span>
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleLogout}
              className="font-mono text-xs font-bold px-3 py-1.5 bg-red-50 border border-red-300 text-red-700 hover:bg-red-600 hover:text-white rounded-[2px] transition-all cursor-pointer shadow-xs"
            >
              [ Lock / Logout ]
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1180px] mx-auto px-6 pt-8">
        
        {/* Quick Analytics Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-ink-blue/20 rounded-[3px] p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold text-ink-muted uppercase">Total Projects</p>
              <h4 className="font-typewriter text-2xl font-bold text-ink-blue">{stats.totalProjects}</h4>
            </div>
            <span className="text-2xl">📁</span>
          </div>

          <div className="bg-white border border-ink-blue/20 rounded-[3px] p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold text-ink-muted uppercase">Categories</p>
              <h4 className="font-typewriter text-2xl font-bold text-ink-blue">{stats.categoriesCount}</h4>
            </div>
            <span className="text-2xl">🏷️</span>
          </div>

          <div className="bg-white border border-ink-blue/20 rounded-[3px] p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold text-ink-muted uppercase">Achievements</p>
              <h4 className="font-typewriter text-2xl font-bold text-ink-blue">{stats.totalAchievements}</h4>
            </div>
            <span className="text-2xl">⚡</span>
          </div>

          <div className="bg-white border border-ink-blue/20 rounded-[3px] p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold text-ink-muted uppercase">3D Flip Cards</p>
              <h4 className="font-typewriter text-2xl font-bold text-ink-blue">{stats.totalMilestones}</h4>
            </div>
            <span className="text-2xl">🏆</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-ink-blue/20 pb-2 mb-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`font-mono text-sm font-bold px-5 py-2.5 rounded-[2px] transition-all border cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-ink-blue text-white border-ink-blue shadow-[2px_2px_0px_rgba(15,44,89,0.3)]'
                : 'bg-white text-ink-blue border-ink-blue/30 hover:border-ink-blue'
            }`}
          >
            📁 Projects Directory ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab('achievements')}
            className={`font-mono text-sm font-bold px-5 py-2.5 rounded-[2px] transition-all border cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-ink-blue text-white border-ink-blue shadow-[2px_2px_0px_rgba(15,44,89,0.3)]'
                : 'bg-white text-ink-blue border-ink-blue/30 hover:border-ink-blue'
            }`}
          >
            ⚡ Achievements Bullet List ({achievements.length})
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`font-mono text-sm font-bold px-5 py-2.5 rounded-[2px] transition-all border cursor-pointer ${
              activeTab === 'milestones'
                ? 'bg-ink-blue text-white border-ink-blue shadow-[2px_2px_0px_rgba(15,44,89,0.3)]'
                : 'bg-white text-ink-blue border-ink-blue/30 hover:border-ink-blue'
            }`}
          >
            🏆 Milestone 3D Cards ({milestones.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`font-mono text-sm font-bold px-5 py-2.5 rounded-[2px] transition-all border cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-ink-blue text-white border-ink-blue shadow-[2px_2px_0px_rgba(15,44,89,0.3)]'
                : 'bg-white text-ink-blue border-ink-blue/30 hover:border-ink-blue'
            }`}
          >
            ⚙ Settings &amp; Security
          </button>
        </div>

        {/* --------------------------------------------------------- */}
        {/* TAB 1: PROJECTS DIRECTORY */}
        {/* --------------------------------------------------------- */}
        {activeTab === 'projects' && (
          <div>
            {/* Top Toolbar */}
            <div className="bg-white border border-ink-blue/25 rounded-[3px] p-5 shadow-sm mb-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-typewriter text-xl font-bold text-ink-blue">
                    Project Cards Manager
                  </h2>
                  <p className="font-mono text-xs text-ink-muted">
                    Manage portfolio project cards, categories, tags, bullet points &amp; external links.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddProject}
                  className="font-mono text-sm font-bold px-5 py-2.5 bg-ink-blue text-white border-2 border-ink-blue shadow-btn-ink hover:bg-ink-dark hover:border-ink-dark hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="text-base">+</span>
                  <span>Add New Project Card</span>
                </button>
              </div>

              {/* Search, Filter and View Mode Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-dashed border-ink-blue/15">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search projects by title, tag, description..."
                      className="w-full font-mono text-xs p-2 pl-8 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px] text-ink-dark focus:border-ink-blue focus:bg-white focus:outline-none"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted text-xs">🔍</span>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-red text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setSelectedCategoryFilter('all')}
                      className={`font-mono text-xs font-bold px-2.5 py-1 rounded-[2px] border transition-all cursor-pointer ${
                        selectedCategoryFilter === 'all'
                          ? 'bg-ink-blue text-white border-ink-blue'
                          : 'bg-slate-50 text-ink-blue border-ink-blue/20 hover:border-ink-blue'
                      }`}
                    >
                      [ALL]
                    </button>
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`font-mono text-xs font-bold px-2.5 py-1 rounded-[2px] border transition-all cursor-pointer ${
                          selectedCategoryFilter === cat
                            ? 'bg-ink-blue text-white border-ink-blue'
                            : 'bg-slate-50 text-ink-blue border-ink-blue/20 hover:border-ink-blue'
                        }`}
                      >
                        [{cat.toUpperCase()}]
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Switcher */}
                <div className="flex items-center gap-1 border border-ink-blue/20 p-0.5 rounded-[2px] bg-slate-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                    className={`font-mono text-xs font-bold px-2 py-1 rounded-[2px] transition-all ${
                      viewMode === 'grid' ? 'bg-ink-blue text-white' : 'text-ink-blue hover:bg-slate-200'
                    }`}
                  >
                    ▦ Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    title="List View"
                    className={`font-mono text-xs font-bold px-2 py-1 rounded-[2px] transition-all ${
                      viewMode === 'list' ? 'bg-ink-blue text-white' : 'text-ink-blue hover:bg-slate-200'
                    }`}
                  >
                    ☰ List
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <div className="bg-white border border-dashed border-ink-blue/30 rounded-[3px] p-12 text-center">
                <span className="text-4xl block mb-2">📁</span>
                <h3 className="font-typewriter text-lg text-ink-blue font-bold">No Projects Found</h3>
                <p className="font-mono text-xs text-ink-muted mt-1">
                  {searchQuery ? `No matches found for "${searchQuery}".` : 'Get started by creating your first project card.'}
                </p>
                <button
                  onClick={handleOpenAddProject}
                  className="mt-4 font-mono text-xs font-bold px-4 py-2 bg-ink-blue text-white rounded-[2px]"
                >
                  + Add New Project
                </button>
              </div>
            )}

            {/* Projects Render: GRID or LIST */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((proj, idx) => {
                  const globalIdx = projects.findIndex(p => p.id === proj.id);
                  return (
                    <div
                      key={proj.id}
                      className="bg-white border border-ink-blue/25 rounded-[3px] p-6 shadow-sm hover:shadow-card-soft transition-all flex flex-col justify-between relative group"
                    >
                      {/* Top Washi Tape */}
                      <div 
                        className="absolute -top-2 left-6 w-16 h-3.5 bg-washi opacity-85 -rotate-1 pointer-events-none"
                        style={{ clipPath: 'polygon(0% 0%, 100% 4%, 97% 100%, 3% 96%)' }}
                      />

                      <div>
                        {/* Header ID & Category */}
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="font-mono text-xs font-bold text-ink-red tracking-widest">
                            {proj.id}
                          </span>
                          <span className="font-mono text-xs font-bold bg-ink-blue/10 text-ink-blue px-2 py-0.5 rounded-[2px]">
                            {proj.categoryLabel || proj.category}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-typewriter text-lg font-bold text-ink-blue mb-1.5 leading-snug">
                          {proj.title}
                        </h3>
                        <p className="font-mono text-xs text-[#1a2838] leading-relaxed mb-4 line-clamp-3">
                          {proj.description}
                        </p>

                        {/* Highlights */}
                        {proj.highlights && proj.highlights.length > 0 && (
                          <div className="flex flex-col gap-1 text-[11px] text-ink-muted mb-4 border-l-2 border-ink-blue/30 pl-2.5">
                            {proj.highlights.slice(0, 2).map((h, i) => (
                              <span key={i} className="line-clamp-1">• {h}</span>
                            ))}
                            {proj.highlights.length > 2 && (
                              <span className="text-[10px] text-ink-blue font-bold">+ {proj.highlights.length - 2} more highlight(s)</span>
                            )}
                          </div>
                        )}

                        {/* Tech Tags */}
                        {proj.tags && proj.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {proj.tags.map((t, i) => (
                              <span
                                key={i}
                                className="font-mono text-[11px] bg-[#f0f4f9] text-ink-dark border border-ink-blue/15 px-1.5 py-0.5 rounded-[2px]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-dashed border-ink-blue/20 flex items-center justify-between gap-2">
                        {/* Move Ordering */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveProject(globalIdx, -1)}
                            disabled={globalIdx === 0}
                            title="Move Earlier in List"
                            className="font-mono text-xs font-bold px-2 py-1 border border-ink-blue/20 bg-slate-50 hover:bg-slate-200 disabled:opacity-30 rounded-[2px] cursor-pointer"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleMoveProject(globalIdx, 1)}
                            disabled={globalIdx === projects.length - 1}
                            title="Move Later in List"
                            className="font-mono text-xs font-bold px-2 py-1 border border-ink-blue/20 bg-slate-50 hover:bg-slate-200 disabled:opacity-30 rounded-[2px] cursor-pointer"
                          >
                            ▼
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDuplicateProject(proj)}
                            title="Duplicate Project"
                            className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-ink-blue rounded-[2px] cursor-pointer"
                          >
                            📋 Copy
                          </button>
                          <button
                            onClick={() => handleOpenEditProject(proj)}
                            className="font-mono text-xs font-bold px-3 py-1 bg-ink-blue text-white rounded-[2px] hover:bg-ink-dark transition-all cursor-pointer"
                          >
                            ✏ Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmProject(proj)}
                            className="font-mono text-xs font-bold px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-[2px] cursor-pointer"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="flex flex-col gap-3">
                {filteredProjects.map((proj) => {
                  const globalIdx = projects.findIndex(p => p.id === proj.id);
                  return (
                    <div
                      key={proj.id}
                      className="bg-white border border-ink-blue/20 rounded-[3px] p-4 shadow-xs hover:border-ink-blue/40 transition-all flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                        <span className="font-mono text-xs font-bold text-ink-red w-16">
                          {proj.id}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-typewriter text-base font-bold text-ink-blue">
                            {proj.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] bg-ink-blue/10 text-ink-blue px-1.5 py-0.5 rounded-[2px]">
                              {proj.categoryLabel || proj.category}
                            </span>
                            <span className="font-mono text-[11px] text-ink-muted">
                              {(proj.tags || []).slice(0, 4).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMoveProject(globalIdx, -1)}
                          disabled={globalIdx === 0}
                          className="font-mono text-xs px-2 py-1 border border-ink-blue/20 bg-slate-50 disabled:opacity-30 rounded-[2px]"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveProject(globalIdx, 1)}
                          disabled={globalIdx === projects.length - 1}
                          className="font-mono text-xs px-2 py-1 border border-ink-blue/20 bg-slate-50 disabled:opacity-30 rounded-[2px]"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => handleOpenEditProject(proj)}
                          className="font-mono text-xs font-bold px-3 py-1 bg-ink-blue text-white rounded-[2px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmProject(proj)}
                          className="font-mono text-xs font-bold px-2 py-1 text-red-600 hover:bg-red-50 rounded-[2px]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 2: ACHIEVEMENTS BULLET LIST */}
        {/* --------------------------------------------------------- */}
        {activeTab === 'achievements' && (
          <div className="bg-white border border-ink-blue/25 rounded-[3px] p-7 shadow-sm">
            <div className="mb-6">
              <h2 className="font-typewriter text-xl font-bold text-ink-blue">
                Milestones &amp; Honors — Key Achievements Bullet List
              </h2>
              <p className="font-mono text-xs text-ink-muted mt-1">
                These bullet points appear dynamically under the "03 // MILESTONES &amp; HONORS" title on your live site.
              </p>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddAchievement} className="flex flex-col sm:flex-row gap-3 mb-8 p-4 bg-[#f8f9fa] border border-ink-blue/20 rounded-[2px]">
              <input
                type="text"
                value={newAchievementText}
                onChange={(e) => setNewAchievementText(e.target.value)}
                placeholder="e.g. Winner of TIET AI Hackathon 2026 — Built autonomous drone navigation pipeline..."
                className="flex-1 font-mono text-sm p-3 bg-white border border-ink-blue/30 rounded-[2px] text-ink-dark focus:border-ink-blue focus:outline-none shadow-xs"
              />
              <button
                type="submit"
                className="font-mono text-sm font-bold px-6 py-3 bg-ink-blue text-white rounded-[2px] hover:bg-ink-dark transition-all cursor-pointer shrink-0 shadow-xs"
              >
                + Add Bullet Point
              </button>
            </form>

            {/* Achievements List */}
            <div className="flex flex-col gap-3">
              {achievements.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 p-4 bg-white border border-ink-blue/15 rounded-[2px] hover:border-ink-blue/40 transition-all shadow-xs"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="font-mono font-bold text-ink-red text-sm mt-0.5 select-none">
                      #{idx + 1}
                    </span>

                    {editingAchievementIdx === idx ? (
                      <div className="flex-1 flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={editingAchievementText}
                          onChange={(e) => setEditingAchievementText(e.target.value)}
                          className="flex-1 font-mono text-sm p-2 border border-ink-blue rounded-[2px]"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveAchievementEdit(idx)}
                            className="font-mono text-xs font-bold px-3 py-2 bg-emerald-600 text-white rounded-[2px] cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingAchievementIdx(null)}
                            className="font-mono text-xs px-3 py-2 bg-slate-200 text-ink-dark rounded-[2px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="font-mono text-sm text-[#1a2838] leading-relaxed flex-1">
                        – {item}
                      </p>
                    )}
                  </div>

                  {editingAchievementIdx !== idx && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleMoveAchievement(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="font-mono text-xs p-1.5 px-2 border border-ink-blue/20 bg-slate-50 disabled:opacity-30 rounded-[2px] cursor-pointer"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveAchievement(idx, 1)}
                        disabled={idx === achievements.length - 1}
                        title="Move Down"
                        className="font-mono text-xs p-1.5 px-2 border border-ink-blue/20 bg-slate-50 disabled:opacity-30 rounded-[2px] cursor-pointer"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => handleStartEditAchievement(idx, item)}
                        className="font-mono text-xs font-bold px-3 py-1.5 bg-slate-100 text-ink-blue hover:bg-ink-blue hover:text-white rounded-[2px] transition-all cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAchievement(idx)}
                        className="font-mono text-xs font-bold px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-[2px] cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 3: MILESTONE 3D FLIP CARDS */}
        {/* --------------------------------------------------------- */}
        {activeTab === 'milestones' && (
          <div>
            <div className="bg-white border border-ink-blue/25 rounded-[3px] p-5 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-typewriter text-xl font-bold text-ink-blue">
                  Interactive 3D Milestone Flip Cards
                </h2>
                <p className="font-mono text-xs text-ink-muted">
                  Front face displays the Icon &amp; Heading. Hovering or tapping flips to reveal the stamp, detailed note &amp; tag.
                </p>
              </div>

              <button
                onClick={handleOpenAddMilestone}
                className="font-mono text-sm font-bold px-5 py-2.5 bg-ink-blue text-white border-2 border-ink-blue shadow-btn-ink hover:bg-ink-dark transition-all cursor-pointer flex items-center gap-2"
              >
                <span>+</span>
                <span>Add Flip Card</span>
              </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {milestones.map((ms, idx) => (
                <div
                  key={ms.id}
                  className="bg-white border border-ink-blue/25 rounded-[3px] p-6 shadow-sm flex flex-col justify-between hover:shadow-card-soft transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-ink-blue/15">
                      <span className="text-3xl">{ms.icon}</span>
                      <span className="font-typewriter text-[11px] font-bold text-ink-red tracking-widest border border-ink-red px-2 py-0.5">
                        {ms.stamp}
                      </span>
                    </div>

                    <h3 className="font-typewriter text-lg font-bold text-ink-blue mb-2 leading-snug">
                      {ms.title}
                    </h3>
                    <p className="font-mono text-xs text-[#1a2838] leading-relaxed mb-4">
                      {ms.description}
                    </p>
                    <span className="font-mono text-xs font-bold text-ink-blue bg-ink-blue/10 px-2 py-0.5 rounded-[2px]">
                      {ms.tag}
                    </span>
                  </div>

                  <div className="pt-4 mt-4 border-t border-ink-blue/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveMilestone(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="font-mono text-xs px-2 py-1 border border-ink-blue/20 bg-slate-50 disabled:opacity-30 rounded-[2px]"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveMilestone(idx, 1)}
                        disabled={idx === milestones.length - 1}
                        title="Move Down"
                        className="font-mono text-xs px-2 py-1 border border-ink-blue/20 bg-slate-50 disabled:opacity-30 rounded-[2px]"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditMilestone(ms)}
                        className="font-mono text-xs font-bold px-3 py-1.5 bg-ink-blue text-white rounded-[2px] hover:bg-ink-dark transition-all cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmMilestone(ms)}
                        className="font-mono text-xs font-bold px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-[2px] cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 4: SETTINGS, BACKUP & SECURITY */}
        {/* --------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-8">
            {/* Backup & Restore Section */}
            <div className="bg-white border border-ink-blue/25 rounded-[3px] p-7 shadow-sm">
              <h2 className="font-typewriter text-xl font-bold text-ink-blue mb-1">
                Data Management &amp; Portable Backup
              </h2>
              <p className="font-mono text-xs text-ink-muted mb-6">
                All changes are automatically saved to your browser storage. You can export a JSON backup file or import one anytime.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Export Card */}
                <div className="border border-ink-blue/20 p-5 rounded-[2px] bg-[#fafbfc] flex flex-col justify-between">
                  <div>
                    <h3 className="font-typewriter font-bold text-ink-blue text-base mb-1">
                      1. Export JSON File
                    </h3>
                    <p className="font-mono text-xs text-ink-muted mb-4">
                      Download complete snapshot of projects, milestones &amp; achievements.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="font-mono text-xs font-bold px-4 py-2.5 bg-ink-blue text-white rounded-[2px] hover:bg-ink-dark transition-all cursor-pointer shadow-xs"
                  >
                    ⬇ Download Backup .JSON
                  </button>
                </div>

                {/* Import File Card */}
                <div className="border border-ink-blue/20 p-5 rounded-[2px] bg-[#fafbfc] flex flex-col justify-between">
                  <div>
                    <h3 className="font-typewriter font-bold text-ink-blue text-base mb-1">
                      2. Upload Backup File
                    </h3>
                    <p className="font-mono text-xs text-ink-muted mb-4">
                      Select a previous .json backup file to restore all content.
                    </p>
                  </div>
                  <label className="font-mono text-xs font-bold px-4 py-2.5 bg-slate-100 border border-ink-blue/30 text-ink-blue rounded-[2px] hover:bg-slate-200 transition-all text-center cursor-pointer shadow-xs">
                    <span>📁 Choose File &amp; Restore</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Factory Reset */}
                <div className="border border-red-300 p-5 rounded-[2px] bg-red-50/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-typewriter font-bold text-red-800 text-base mb-1">
                      3. Reset to Defaults
                    </h3>
                    <p className="font-mono text-xs text-red-700/80 mb-4">
                      Revert all data back to the original portfolio projects and honors.
                    </p>
                  </div>
                  <button
                    onClick={handleResetDefaults}
                    className="font-mono text-xs font-bold px-4 py-2.5 bg-red-700 text-white rounded-[2px] hover:bg-red-800 transition-all cursor-pointer shadow-xs"
                  >
                    ⚠ Factory Reset
                  </button>
                </div>
              </div>

              {/* Direct JSON Paste Box */}
              <div className="mt-8 pt-6 border-t border-dashed border-ink-blue/20">
                <h3 className="font-typewriter font-bold text-ink-blue text-sm mb-2">
                  Direct JSON Paste / Importer
                </h3>
                <textarea
                  rows={3}
                  value={rawJsonPaste}
                  onChange={(e) => setRawJsonPaste(e.target.value)}
                  placeholder='{"projects": [...], "milestones": [...], "achievements": [...]}'
                  className="w-full font-mono text-xs p-3 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px] text-ink-dark focus:border-ink-blue"
                />
                <button
                  onClick={handlePasteJSON}
                  disabled={!rawJsonPaste.trim()}
                  className="mt-2 font-mono text-xs font-bold px-4 py-2 bg-ink-blue text-white rounded-[2px] disabled:opacity-40 cursor-pointer"
                >
                  Apply Pasted JSON
                </button>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white border border-ink-blue/25 rounded-[3px] p-7 shadow-sm">
              <h2 className="font-typewriter text-xl font-bold text-ink-blue mb-1">
                Admin Security &amp; Passcode
              </h2>
              <p className="font-mono text-xs text-ink-muted mb-6">
                Set a custom password for accessing the `/adminbhavya` portal.
              </p>

              <form onSubmit={handleChangePassword} className="max-w-md flex flex-col gap-4">
                <div>
                  <label className="block font-typewriter text-xs font-bold text-ink-blue mb-1">
                    [ NEW PASSCODE ]
                  </label>
                  <input
                    type="password"
                    value={newPasswordVal}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full font-mono text-xs p-2.5 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px]"
                  />
                </div>

                <div>
                  <label className="block font-typewriter text-xs font-bold text-ink-blue mb-1">
                    [ CONFIRM NEW PASSCODE ]
                  </label>
                  <input
                    type="password"
                    value={confirmPasswordVal}
                    onChange={(e) => setConfirmPasswordVal(e.target.value)}
                    placeholder="Confirm new password..."
                    className="w-full font-mono text-xs p-2.5 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px]"
                  />
                </div>

                <button
                  type="submit"
                  className="font-mono text-xs font-bold px-5 py-2.5 bg-ink-blue text-white rounded-[2px] hover:bg-ink-dark cursor-pointer self-start"
                >
                  Update Admin Passcode
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* ADD / EDIT PROJECT MODAL WITH REAL-TIME LIVE PREVIEW */}
      {/* ------------------------------------------------------------- */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-ink-blue rounded-[3px] w-full max-w-5xl p-6 sm:p-8 shadow-2xl my-6 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-ink-blue/20">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-ink-red">
                  {isNewProject ? '[ NEW ENTRY ]' : `[ EDITING: ${editingProject.id} ]`}
                </span>
                <h2 className="font-typewriter text-xl font-bold text-ink-blue">
                  {isNewProject ? 'Create Project Card' : editingProject.title || 'Project Editor'}
                </h2>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="font-mono text-sm font-bold text-ink-blue hover:text-ink-red px-2 py-1 rounded-[2px] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Split Screen: Left = Form, Right = Live Preview Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Side (7 cols) */}
              <form onSubmit={handleSaveProject} className="lg:col-span-7 flex flex-col gap-4 font-mono text-xs">
                
                {/* ID and Category Select */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-ink-blue mb-1">Project ID</label>
                    <input
                      type="text"
                      value={editingProject.id}
                      onChange={(e) => setEditingProject({ ...editingProject, id: e.target.value })}
                      required
                      placeholder="FILE_01"
                      className="w-full p-2.5 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-ink-blue mb-1">Category Filter Key</label>
                    <select
                      value={editingProject.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        let label = editingProject.categoryLabel;
                        if (cat === 'ai-ml') label = 'AI / ML';
                        if (cat === 'fullstack') label = 'WEB PLATFORM';
                        if (cat === 'systems') label = 'ALGORITHMS';
                        if (cat === 'mobile') label = 'MOBILE APP';
                        setEditingProject({ ...editingProject, category: cat, categoryLabel: label });
                      }}
                      className="w-full p-2.5 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px]"
                    >
                      <option value="ai-ml">ai-ml (AI &amp; Machine Learning)</option>
                      <option value="fullstack">fullstack (Web &amp; Full Stack)</option>
                      <option value="systems">systems (Algo &amp; Tools)</option>
                      <option value="mobile">mobile (Mobile Applications)</option>
                      <option value="other">other (Custom)</option>
                    </select>
                  </div>
                </div>

                {/* Title and Category Badge Label */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-ink-blue mb-1">Project Title *</label>
                    <input
                      type="text"
                      value={editingProject.title}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      required
                      placeholder="e.g. NeuralVision — Real-time CV"
                      className="w-full p-2.5 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px] font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-ink-blue mb-1">Badge Display Label</label>
                    <input
                      type="text"
                      value={editingProject.categoryLabel}
                      onChange={(e) => setEditingProject({ ...editingProject, categoryLabel: e.target.value })}
                      placeholder="e.g. AI / ML, WEB APP, NLP"
                      className="w-full p-2.5 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-ink-blue">Project Description</label>
                    <span className="text-[10px] text-ink-muted">{(editingProject.description || '').length} chars</span>
                  </div>
                  <textarea
                    rows={3}
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    placeholder="Comprehensive explanation of what the project does, architecture &amp; outcomes..."
                    className="w-full p-2.5 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px]"
                  />
                </div>

                {/* Tech Tags Input */}
                <div>
                  <label className="block font-bold text-ink-blue mb-1">Technologies &amp; Tags</label>
                  
                  {/* Current Tags Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2 min-h-[30px] p-2 bg-[#f8f9fa] border border-ink-blue/20 rounded-[2px]">
                    {(editingProject.tags || []).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 font-mono text-xs bg-white text-ink-blue border border-ink-blue/30 px-2 py-0.5 rounded-[2px]"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-red-500 font-bold ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {(editingProject.tags || []).length === 0 && (
                      <span className="text-[11px] text-ink-muted">No tags added yet. Type below or click popular presets.</span>
                    )}
                  </div>

                  {/* Add Tag Input */}
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      placeholder="Type tag name and press Enter..."
                      className="flex-1 p-2 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(tagInput)}
                      className="px-3 py-2 bg-ink-blue text-white rounded-[2px] font-bold"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Popular Tag Presets */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-ink-muted mr-1 font-bold">Presets:</span>
                    {POPULAR_TAGS.map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => handleAddTag(pt)}
                        className="text-[10px] bg-slate-100 hover:bg-ink-blue hover:text-white text-ink-dark px-1.5 py-0.5 rounded-[2px] border border-ink-blue/15 transition-all"
                      >
                        +{pt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Highlights (bullet points) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-ink-blue">Key Highlights / Metrics</label>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject({
                          ...editingProject,
                          highlights: [...(editingProject.highlights || []), '']
                        });
                      }}
                      className="text-[11px] text-ink-blue font-bold underline cursor-pointer"
                    >
                      + Add Highlight
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {(editingProject.highlights || []).map((h, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-ink-blue font-bold">•</span>
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => {
                            const copy = [...editingProject.highlights];
                            copy[i] = e.target.value;
                            setEditingProject({ ...editingProject, highlights: copy });
                          }}
                          placeholder="e.g. Optimized inference latency by 42% via TensorRT export..."
                          className="flex-1 p-2 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const copy = editingProject.highlights.filter((_, idx) => idx !== i);
                            setEditingProject({ ...editingProject, highlights: copy });
                          }}
                          className="text-red-500 font-bold px-2 py-1 hover:bg-red-50 rounded-[2px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-ink-blue mb-1">GitHub URL</label>
                    <input
                      type="text"
                      value={editingProject.githubUrl}
                      onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full p-2 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-ink-blue mb-1">Live Demo URL</label>
                    <input
                      type="text"
                      value={editingProject.liveUrl}
                      onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                      placeholder="https://my-app.vercel.app or #"
                      className="w-full p-2 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px]"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-blue/20 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="font-mono text-xs font-bold px-4 py-2.5 border border-ink-blue/30 text-ink-muted hover:bg-slate-100 rounded-[2px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="font-mono text-xs font-bold px-6 py-2.5 bg-ink-blue text-white rounded-[2px] hover:bg-ink-dark shadow-btn-ink cursor-pointer"
                  >
                    {isNewProject ? 'Create Project Card' : 'Save Changes'}
                  </button>
                </div>
              </form>

              {/* Right Side: LIVE PREVIEW (5 cols) */}
              <div className="lg:col-span-5 bg-[#f8f9fa] border-2 border-dashed border-ink-blue/25 p-5 rounded-[3px]">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-ink-blue/15">
                  <span className="font-mono text-[11px] font-bold text-ink-red tracking-wider">
                    ● REAL-TIME LIVE PREVIEW
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted">As seen on live website</span>
                </div>

                {/* Rendered Live Card */}
                <div className="relative bg-white p-6 rounded-[3px] border border-ink-blue/20 shadow-card-soft mt-2">
                  {/* Washi tape on top */}
                  <div 
                    className="absolute -top-2 left-6 w-20 h-4 bg-washi opacity-85 -rotate-1 pointer-events-none"
                    style={{ clipPath: 'polygon(0% 0%, 100% 4%, 97% 100%, 3% 96%)' }}
                  />

                  {/* Header info */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-xs font-bold text-ink-red tracking-widest">
                      {editingProject.id || 'FILE_XX'}
                    </span>
                    <span className="font-mono text-xs font-bold bg-ink-blue/10 text-ink-blue px-2 py-0.5 rounded-[2px]">
                      {editingProject.categoryLabel || editingProject.category || 'CATEGORY'}
                    </span>
                  </div>

                  {/* Title & description */}
                  <h3 className="font-typewriter text-lg text-ink-blue mb-2 leading-snug font-bold">
                    {editingProject.title || 'Untitled Project'}
                  </h3>
                  <p className="font-mono text-xs leading-relaxed text-[#1a2838] mb-4">
                    {editingProject.description || 'Project description will appear here...'}
                  </p>

                  {/* Highlights */}
                  {(editingProject.highlights || []).filter(h => h.trim()).length > 0 && (
                    <div className="flex flex-col gap-1 text-[11px] text-ink-muted mb-4 border-l-2 border-ink-blue/30 pl-2.5">
                      {(editingProject.highlights || []).filter(h => h.trim()).map((h, i) => (
                        <span key={i} className="leading-snug">• {h}</span>
                      ))}
                    </div>
                  )}

                  {/* Tech tags */}
                  {(editingProject.tags || []).filter(t => t.trim()).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto mb-4">
                      {(editingProject.tags || []).filter(t => t.trim()).map((t, i) => (
                        <span
                          key={i}
                          className="font-mono text-[10px] bg-[#f0f4f9] text-ink-dark border border-ink-blue/15 px-1.5 py-0.5 rounded-[2px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex items-center gap-3 pt-3 border-t border-dashed border-ink-blue/20 text-xs font-bold font-mono text-ink-blue">
                    <span>[ GitHub Repo &rarr; ]</span>
                    <span>[ Live Demo &#x2197; ]</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ADD / EDIT MILESTONE 3D CARD MODAL WITH INTERACTIVE FLIP */}
      {/* ------------------------------------------------------------- */}
      {editingMilestone && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-ink-blue rounded-[3px] w-full max-w-4xl p-6 sm:p-8 shadow-2xl my-6">
            
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-ink-blue/20">
              <h2 className="font-typewriter text-xl font-bold text-ink-blue">
                {isNewMilestone ? '[ ADD MILESTONE 3D FLIP CARD ]' : `[ EDIT MILESTONE: ${editingMilestone.title} ]`}
              </h2>
              <button
                onClick={() => setEditingMilestone(null)}
                className="font-mono text-sm font-bold text-ink-blue hover:text-ink-red px-2 py-1 rounded-[2px] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Form (7 cols) */}
              <form onSubmit={handleSaveMilestone} className="md:col-span-7 flex flex-col gap-4 font-mono text-xs">
                
                {/* Emoji & Title */}
                <div className="grid grid-cols-[80px_1fr] gap-3">
                  <div>
                    <label className="block font-bold text-ink-blue mb-1">Emoji</label>
                    <input
                      type="text"
                      value={editingMilestone.icon}
                      onChange={(e) => setEditingMilestone({ ...editingMilestone, icon: e.target.value })}
                      required
                      placeholder="🏆"
                      className="w-full p-2.5 text-center text-2xl bg-[#fafbfc] border border-ink-blue/30 rounded-[2px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-ink-blue mb-1">Heading (Front of Card) *</label>
                    <input
                      type="text"
                      value={editingMilestone.title}
                      onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                      required
                      placeholder="e.g. Problem Solving & DSA"
                      className="w-full p-2.5 font-bold bg-[#fafbfc] border border-ink-blue/30 rounded-[2px] text-sm"
                    />
                  </div>
                </div>

                {/* Emoji presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-ink-muted font-bold mr-1">Pick Icon:</span>
                  {EMOJI_PRESETS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEditingMilestone({ ...editingMilestone, icon: em })}
                      className="text-base p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      {em}
                    </button>
                  ))}
                </div>

                {/* Stamp & Tag */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-ink-blue mb-1">Stamp Badge (Back)</label>
                    <input
                      type="text"
                      value={editingMilestone.stamp}
                      onChange={(e) => setEditingMilestone({ ...editingMilestone, stamp: e.target.value })}
                      placeholder="e.g. COMPETITIVE CODE"
                      className="w-full p-2 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-ink-blue mb-1">Bottom Tag (Back)</label>
                    <input
                      type="text"
                      value={editingMilestone.tag}
                      onChange={(e) => setEditingMilestone({ ...editingMilestone, tag: e.target.value })}
                      placeholder="e.g. LeetCode 300+ Solved"
                      className="w-full p-2 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-ink-blue mb-1">Detailed Description (Back of Card)</label>
                  <textarea
                    rows={3}
                    value={editingMilestone.description}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                    placeholder="Details revealed when the card flips..."
                    className="w-full p-2.5 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px]"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-blue/20">
                  <button
                    type="button"
                    onClick={() => setEditingMilestone(null)}
                    className="px-4 py-2 border border-ink-blue/30 rounded-[2px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-ink-blue text-white rounded-[2px] font-bold cursor-pointer"
                  >
                    Save Milestone Card
                  </button>
                </div>
              </form>

              {/* Live 3D Interactive Card Preview (5 cols) */}
              <div className="md:col-span-5 bg-[#f8f9fa] border-2 border-dashed border-ink-blue/25 p-5 rounded-[3px] flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-3 pb-2 border-b border-ink-blue/15">
                  <span className="font-mono text-[11px] font-bold text-ink-red">
                    ● 3D FLIP CARD PREVIEW
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewFlip(!previewFlip)}
                    className="font-mono text-[10px] text-ink-blue font-bold underline cursor-pointer"
                  >
                    [ Click to Flip ↺ ]
                  </button>
                </div>

                <div
                  onClick={() => setPreviewFlip(!previewFlip)}
                  className="w-full max-w-[240px] h-[240px] [perspective:1000px] cursor-pointer my-2"
                >
                  <div
                    className={`relative w-full h-full text-center transition-transform duration-700 [transform-style:preserve-3d] ${
                      previewFlip ? '[transform:rotateY(180deg)]' : ''
                    }`}
                  >
                    {/* FRONT */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white border border-ink-blue/25 rounded-[3px] p-5 shadow-card-soft flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">{editingMilestone.icon || '🏆'}</span>
                      <h3 className="font-typewriter text-base text-ink-blue leading-snug mb-2 font-bold">
                        {editingMilestone.title || 'Card Heading'}
                      </h3>
                      <span className="font-handwritten text-xs text-ink-muted opacity-80 mt-1">
                        [ hover to flip ↺ ]
                      </span>
                    </div>

                    {/* BACK */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-card-yellow border-2 border-dashed border-ink-blue rounded-[3px] p-4 flex flex-col items-center justify-center gap-2 text-center shadow-card-soft">
                      <span className="font-typewriter text-[11px] font-bold text-ink-red tracking-widest border border-ink-red px-2 py-0.5">
                        {editingMilestone.stamp || 'STAMP'}
                      </span>
                      <p className="font-mono text-xs leading-relaxed text-[#1a2838]">
                        {editingMilestone.description || 'Description text...'}
                      </p>
                      <span className="font-mono text-xs font-bold text-ink-blue bg-ink-blue/10 px-2 py-0.5 rounded-[2px] mt-auto">
                        {editingMilestone.tag || 'Tag'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="font-mono text-[10px] text-ink-muted mt-2 text-center">
                  Tap or click card above to test flip animation.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Projects */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-red-500 rounded-[3px] max-w-sm w-full p-6 shadow-2xl animate-scale-in">
            <h3 className="font-typewriter text-lg font-bold text-red-700 mb-2">
              Confirm Delete Project
            </h3>
            <p className="font-mono text-xs text-ink-dark mb-6">
              Are you sure you want to permanently delete <strong>"{deleteConfirmProject.title}"</strong> ({deleteConfirmProject.id})?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmProject(null)}
                className="font-mono text-xs px-3.5 py-2 border border-ink-blue/30 rounded-[2px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(deleteConfirmProject.id)}
                className="font-mono text-xs font-bold px-4 py-2 bg-red-600 text-white rounded-[2px] hover:bg-red-700 cursor-pointer shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Milestones */}
      {deleteConfirmMilestone && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-red-500 rounded-[3px] max-w-sm w-full p-6 shadow-2xl animate-scale-in">
            <h3 className="font-typewriter text-lg font-bold text-red-700 mb-2">
              Confirm Delete Milestone
            </h3>
            <p className="font-mono text-xs text-ink-dark mb-6">
              Are you sure you want to permanently delete <strong>"{deleteConfirmMilestone.title}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmMilestone(null)}
                className="font-mono text-xs px-3.5 py-2 border border-ink-blue/30 rounded-[2px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMilestone(deleteConfirmMilestone.id)}
                className="font-mono text-xs font-bold px-4 py-2 bg-red-600 text-white rounded-[2px] hover:bg-red-700 cursor-pointer shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
