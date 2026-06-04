// src/lib/db.ts — Supabase integration layer for RTIH InnovationOS
// Uses JSONB-based universal table pattern: each table has (id TEXT, data JSONB)

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// Singleton client — reused for both queries and realtime subscriptions
let _client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}

/** Exported so other modules (e.g. mockDb) can subscribe to Realtime channels. */
export function getSupabaseClient(): SupabaseClient {
  return getClient();
}

// ─────────────────────────────────────────────────────────────────────
// Table name mapping: mockDb key → supabase table name
// Adjust these if your Supabase table names differ
// ─────────────────────────────────────────────────────────────────────
const TABLE_MAP: Record<string, string> = {
  startups: 'startups',
  founders: 'founders',
  mentors: 'mentors',
  investors: 'investors',
  universities: 'universities',
  outposts: 'outposts',
  sessions: 'mentor_sessions',
  hackathons: 'hackathons',
  registrations: 'hackathon_registrations',
  submissions: 'hackathon_submissions',
  certifications: 'certificates',
  watchlists: 'investor_watchlists',
  assessments: 'founder_assessments',
  applications: 'startup_applications',
  incubationCenters: 'incubation_centers',
  departments: 'departments',
  programs: 'programs',
  tasks: 'tasks',
  notifications: 'notifications',
  messages: 'messages',
  documents: 'documents',
  alumniStartups: 'alumni_startups',
  ideaPosts: 'idea_posts',
  citizenProfiles: 'citizen_profiles',
  stageRecommendations: 'stage_recommendations',
  jobPostings: 'job_postings',
  mentorshipGoals: 'mentorship_goals',
  actionItems: 'action_items',
};

// ─────────────────────────────────────────────────────────────────────
// Generic read: tries both JSONB (data column) and flat column patterns
// ─────────────────────────────────────────────────────────────────────
async function readTable(tableName: string): Promise<any[]> {
  const supabase = getClient();
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) return [];
  if (!data || data.length === 0) return [];

  // Detect if data is stored in a JSONB "data" column
  if (data[0] && typeof data[0].data === 'object' && data[0].data !== null) {
    return data.map((row: any) => ({ id: row.id, ...row.data }));
  }
  // Otherwise return flat rows as-is
  return data;
}

// ─────────────────────────────────────────────────────────────────────
// Pull all collections from Supabase
// ─────────────────────────────────────────────────────────────────────
export async function supabasePullAll(): Promise<Record<string, any[]>> {
  if (!isSupabaseConfigured()) return {};

  const result: Record<string, any[]> = {};
  await Promise.all(
    Object.entries(TABLE_MAP).map(async ([mockKey, tableName]) => {
      const rows = await readTable(tableName);
      if (rows.length > 0) {
        result[mockKey] = rows;
      }
    })
  );
  return result;
}

// ─────────────────────────────────────────────────────────────────────
// Seed all collections into Supabase from mock data
// ─────────────────────────────────────────────────────────────────────
export async function supabaseSeedAll(data: Record<string, any[]>): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getClient();

  for (const [mockKey, tableName] of Object.entries(TABLE_MAP)) {
    const items: any[] = (data as any)[mockKey] || [];
    if (items.length === 0) continue;

    // Try JSONB pattern first (id + data columns)
    const rows = items.map((item: any) => ({ id: item.id, data: item }));
    const { error } = await supabase.from(tableName).upsert(rows, { onConflict: 'id' });

    if (error) {
      // Fallback: try flat columns
      const { error: flatError } = await supabase.from(tableName).upsert(items, { onConflict: 'id' });
      if (flatError) {
        console.warn(`[RTIH] Could not seed ${tableName}:`, flatError.message);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────
// Upsert a single entity — called on every change
// ─────────────────────────────────────────────────────────────────────
export async function supabaseUpsertEntity(collectionKey: string, item: any): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const tableName = TABLE_MAP[collectionKey];
  if (!tableName) return;

  const supabase = getClient();
  // Try JSONB pattern
  const { error } = await supabase
    .from(tableName)
    .upsert({ id: item.id, data: item }, { onConflict: 'id' });

  if (error) {
    // Fallback to flat columns
    await supabase.from(tableName).upsert(item, { onConflict: 'id' });
  }
}

// ─────────────────────────────────────────────────────────────────────
// Startup application specific helpers (for registration flow)
// ─────────────────────────────────────────────────────────────────────
export async function submitStartupApplication(application: any): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const supabase = getClient();
  const { error } = await supabase
    .from(TABLE_MAP.applications)
    .upsert({ id: application.id, data: application }, { onConflict: 'id' });
  if (error) {
    // try flat
    const { error: flatError } = await supabase.from(TABLE_MAP.applications).upsert(application, { onConflict: 'id' });
    if (flatError) return { success: false, error: flatError.message };
  }
  return { success: true };
}

export async function getStartupApplications(): Promise<any[]> {
  return readTable(TABLE_MAP.applications);
}

export async function updateApplicationStatus(
  id: string,
  status: 'Approved' | 'Rejected',
  extra?: Record<string, any>
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getClient();

  // Try JSONB update pattern
  const { data: existing } = await supabase.from(TABLE_MAP.applications).select('*').eq('id', id).single();
  if (existing?.data) {
    const updated = { ...existing.data, status, ...extra };
    await supabase.from(TABLE_MAP.applications).update({ data: updated }).eq('id', id);
  } else {
    // flat pattern
    await supabase.from(TABLE_MAP.applications).update({ status, ...extra }).eq('id', id);
  }
}
