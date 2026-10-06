import { projectsData } from './projectsData';
import { milestonesData } from './milestonesData';
import { initialAchievementsData } from './achievementsData';

const STORAGE_KEYS = {
  PROJECTS: 'bhavya_portfolio_projects_v1',
  MILESTONES: 'bhavya_portfolio_milestones_v1',
  ACHIEVEMENTS: 'bhavya_portfolio_achievements_v1',
  PASSWORD: 'bhavya_portfolio_admin_pwd_v1',
};

const DEFAULT_PASSWORDS = ['adminbhavya', 'bhavya2025', 'admin123', 'bhavya'];
const SYNC_EVENT = 'bhavya_portfolio_data_sync';

export function notifyDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  }
}

export function subscribeDataChanges(callback) {
  if (typeof window === 'undefined') return () => {};
  
  const handler = () => callback();
  window.addEventListener(SYNC_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(SYNC_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

// Password verification & update
export function verifyAdminPassword(inputPwd) {
  if (typeof window === 'undefined') return false;
  const customPwd = localStorage.getItem(STORAGE_KEYS.PASSWORD);
  const validList = customPwd ? [customPwd, ...DEFAULT_PASSWORDS] : DEFAULT_PASSWORDS;
  return validList.includes(inputPwd.trim());
}

export function setCustomAdminPassword(newPwd) {
  if (typeof window === 'undefined') return;
  if (!newPwd || !newPwd.trim()) {
    localStorage.removeItem(STORAGE_KEYS.PASSWORD);
  } else {
    localStorage.setItem(STORAGE_KEYS.PASSWORD, newPwd.trim());
  }
}

// Projects
export function getStoredProjects() {
  if (typeof window === 'undefined') return projectsData;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) return projectsData;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : projectsData;
  } catch (e) {
    console.error('Failed to load projects from localStorage', e);
    return projectsData;
  }
}

export function saveStoredProjects(projects) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    notifyDataChanged();
  } catch (e) {
    console.error('Failed to save projects to localStorage', e);
  }
}

// Milestones Flip Cards
export function getStoredMilestones() {
  if (typeof window === 'undefined') return milestonesData;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    if (!raw) return milestonesData;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : milestonesData;
  } catch (e) {
    console.error('Failed to load milestones from localStorage', e);
    return milestonesData;
  }
}

export function saveStoredMilestones(milestones) {
  try {
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
    notifyDataChanged();
  } catch (e) {
    console.error('Failed to save milestones to localStorage', e);
  }
}

// Achievements Bullet Points
export function getStoredAchievements() {
  if (typeof window === 'undefined') return initialAchievementsData;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (!raw) return initialAchievementsData;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialAchievementsData;
  } catch (e) {
    console.error('Failed to load achievements from localStorage', e);
    return initialAchievementsData;
  }
}

export function saveStoredAchievements(achievements) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    notifyDataChanged();
  } catch (e) {
    console.error('Failed to save achievements to localStorage', e);
  }
}

// Reset all
export function resetAllDataToDefault() {
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.MILESTONES);
  localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
  notifyDataChanged();
}
