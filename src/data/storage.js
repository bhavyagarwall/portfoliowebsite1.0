import { projectsData } from './projectsData';
import { milestonesData } from './milestonesData';
import { initialAchievementsData } from './achievementsData';
import { supabase } from '../lib/supabaseClient';

const STORAGE_KEYS = {
  PROJECTS: 'bhavya_portfolio_projects_v1',
  MILESTONES: 'bhavya_portfolio_milestones_v1',
  ACHIEVEMENTS: 'bhavya_portfolio_achievements_v1',
  PASSWORD_HASH: 'bhavya_portfolio_admin_pwd_hash_v1',
};

// SHA-256 precomputed hashes of authorized passcodes:
// "bhavya2025" -> 5d0a68d0bb41d3b248a39bfe87e7ebfe26ec7e0fc218b065476a666989445207
// "adminbhavya" -> 4e4f51e06a58eb7bc8516087fb68393526ae7eb0a01fa266858e37976e5d59ce
// "admin123" -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
const DEFAULT_AUTHORIZED_HASHES = [
  '5d0a68d0bb41d3b248a39bfe87e7ebfe26ec7e0fc218b065476a666989445207', // bhavya2025
  '4e4f51e06a58eb7bc8516087fb68393526ae7eb0a01fa266858e37976e5d59ce', // adminbhavya
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123
];

const SYNC_EVENT = 'bhavya_portfolio_data_sync';

// Cryptographic SHA-256 hashing helper
export async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Secure URL Sanitizer to prevent XSS (javascript:, data: schemes)
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (trimmed === '#' || trimmed.startsWith('#')) return trimmed;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed;
  }
  return '#';
}

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

// -------------------------------------------------------------
// SUPABASE CLOUD DATABASE SYNC & REALTIME
// -------------------------------------------------------------
let isCloudSyncInitialized = false;

export async function initCloudSync() {
  if (typeof window === 'undefined' || isCloudSyncInitialized) return;
  isCloudSyncInitialized = true;

  try {
    // 1. Fetch current global records from Supabase
    const { data, error } = await supabase
      .from('portfolio_content')
      .select('key, data');

    if (!error && data && Array.isArray(data)) {
      let hasUpdates = false;

      data.forEach((row) => {
        if (row.key === 'projects' && Array.isArray(row.data) && row.data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(row.data));
          hasUpdates = true;
        } else if (row.key === 'milestones' && Array.isArray(row.data) && row.data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(row.data));
          hasUpdates = true;
        } else if (row.key === 'achievements' && Array.isArray(row.data) && row.data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(row.data));
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        notifyDataChanged();
      }

      // If Supabase is empty, seed initial data to cloud
      if (data.length === 0) {
        seedInitialDataToCloud();
      }
    } else if (error) {
      console.warn('Supabase initial fetch notice:', error.message);
    }

    // 2. Realtime Subscription: Update all visitors globally when changes occur
    supabase
      .channel('portfolio_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_content' },
        (payload) => {
          if (payload.new && payload.new.key && payload.new.data) {
            const { key, data: newData } = payload.new;
            if (key === 'projects') {
              localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(newData));
            } else if (key === 'milestones') {
              localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(newData));
            } else if (key === 'achievements') {
              localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(newData));
            }
            notifyDataChanged();
          }
        }
      )
      .subscribe();

  } catch (err) {
    console.warn('Cloud sync offline or table pending setup:', err);
  }
}

async function seedInitialDataToCloud() {
  try {
    const currentProjects = getStoredProjects();
    const currentMilestones = getStoredMilestones();
    const currentAchievements = getStoredAchievements();

    await supabase.from('portfolio_content').upsert([
      { key: 'projects', data: currentProjects },
      { key: 'milestones', data: currentMilestones },
      { key: 'achievements', data: currentAchievements }
    ]);
  } catch (e) {
    console.warn('Could not seed initial data to cloud:', e);
  }
}

// -------------------------------------------------------------
// PASSWORD SECURITY
// -------------------------------------------------------------
export async function verifyAdminPassword(inputPwd) {
  if (typeof window === 'undefined' || !inputPwd) return false;
  try {
    const inputHash = await sha256(inputPwd.trim());
    const customHash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
    const validHashes = customHash ? [customHash, ...DEFAULT_AUTHORIZED_HASHES] : DEFAULT_AUTHORIZED_HASHES;
    return validHashes.includes(inputHash);
  } catch (e) {
    console.error('Cryptographic verification failed', e);
    return false;
  }
}

export async function setCustomAdminPassword(newPwd) {
  if (typeof window === 'undefined') return;
  if (!newPwd || !newPwd.trim()) {
    localStorage.removeItem(STORAGE_KEYS.PASSWORD_HASH);
  } else {
    const hash = await sha256(newPwd.trim());
    localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, hash);
  }
}

// -------------------------------------------------------------
// SCHEMA VALIDATOR FOR BACKUPS
// -------------------------------------------------------------
export function validateAndCleanBackup(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Backup data is not a valid object.');
  }

  const result = {};

  if (Array.isArray(parsed.projects)) {
    result.projects = parsed.projects
      .filter(p => p && typeof p === 'object' && p.title)
      .map((p, idx) => ({
        id: String(p.id || `FILE_${idx + 1}`),
        title: String(p.title || 'Untitled Project').slice(0, 150),
        category: String(p.category || 'ai-ml').toLowerCase().slice(0, 40),
        categoryLabel: String(p.categoryLabel || p.category || 'AI / ML').slice(0, 40),
        description: String(p.description || '').slice(0, 1000),
        highlights: Array.isArray(p.highlights) 
          ? p.highlights.map(h => String(h).slice(0, 300)).filter(Boolean)
          : [],
        tags: Array.isArray(p.tags) 
          ? p.tags.map(t => String(t).slice(0, 50)).filter(Boolean)
          : [],
        githubUrl: sanitizeUrl(p.githubUrl),
        liveUrl: sanitizeUrl(p.liveUrl)
      }));
  }

  if (Array.isArray(parsed.milestones)) {
    result.milestones = parsed.milestones
      .filter(m => m && typeof m === 'object' && m.title)
      .map((m, idx) => ({
        id: m.id || idx + 1,
        icon: String(m.icon || '🏆').slice(0, 10),
        title: String(m.title || 'Milestone').slice(0, 100),
        stamp: String(m.stamp || 'HONORS').slice(0, 50),
        description: String(m.description || '').slice(0, 500),
        tag: String(m.tag || '').slice(0, 50)
      }));
  }

  if (Array.isArray(parsed.achievements)) {
    result.achievements = parsed.achievements
      .map(a => String(a).slice(0, 400).trim())
      .filter(Boolean);
  }

  return result;
}

// -------------------------------------------------------------
// GET & SAVE DATA (SAVED TO BOTH LOCALSTORAGE & SUPABASE CLOUD)
// -------------------------------------------------------------
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

export async function saveStoredProjects(projects) {
  try {
    const cleaned = projects.map(p => ({
      ...p,
      githubUrl: sanitizeUrl(p.githubUrl),
      liveUrl: sanitizeUrl(p.liveUrl)
    }));
    
    // 1. Instant local update
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(cleaned));
    notifyDataChanged();

    // 2. Global Cloud Sync to Supabase
    const { error } = await supabase
      .from('portfolio_content')
      .upsert({ key: 'projects', data: cleaned });

    if (error) {
      console.warn('Supabase projects save notice:', error.message);
    }
  } catch (e) {
    console.error('Failed to save projects', e);
  }
}

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

export async function saveStoredMilestones(milestones) {
  try {
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
    notifyDataChanged();

    const { error } = await supabase
      .from('portfolio_content')
      .upsert({ key: 'milestones', data: milestones });

    if (error) {
      console.warn('Supabase milestones save notice:', error.message);
    }
  } catch (e) {
    console.error('Failed to save milestones', e);
  }
}

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

export async function saveStoredAchievements(achievements) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    notifyDataChanged();

    const { error } = await supabase
      .from('portfolio_content')
      .upsert({ key: 'achievements', data: achievements });

    if (error) {
      console.warn('Supabase achievements save notice:', error.message);
    }
  } catch (e) {
    console.error('Failed to save achievements', e);
  }
}

export async function resetAllDataToDefault() {
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.MILESTONES);
  localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
  localStorage.removeItem(STORAGE_KEYS.PASSWORD_HASH);
  notifyDataChanged();

  try {
    await supabase.from('portfolio_content').upsert([
      { key: 'projects', data: projectsData },
      { key: 'milestones', data: milestonesData },
      { key: 'achievements', data: initialAchievementsData }
    ]);
  } catch (e) {
    console.warn('Could not reset Supabase data:', e);
  }
}
