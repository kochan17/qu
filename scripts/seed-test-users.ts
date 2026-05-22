/**
 * Seed three test users into the local Supabase Auth + DB:
 *   free@test.que.app   → no subscription
 *   paid@test.que.app   → subscriptions row with is_premium = true
 *   admin@test.que.app  → profiles.role = 'admin'
 *
 * Idempotent — safe to run repeatedly. Uses the service role key so RLS is
 * bypassed. Reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from .env.
 *
 * Usage:
 *   pnpm tsx seed-test-users.ts
 */

import 'dotenv/config';
import { createClient, type User } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (typeof SERVICE_ROLE_KEY !== 'string' || SERVICE_ROLE_KEY === '') {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var is required');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface TestUserSpec {
  email: string;
  password: string;
  role: 'user' | 'admin';
  isPremium: boolean;
  displayName: string;
}

const TEST_USERS: ReadonlyArray<TestUserSpec> = [
  { email: 'free@test.que.app', password: 'TestPassword123!', role: 'user', isPremium: false, displayName: 'Free Tester' },
  { email: 'paid@test.que.app', password: 'TestPassword123!', role: 'user', isPremium: true, displayName: 'Paid Tester' },
  { email: 'admin@test.que.app', password: 'TestPassword123!', role: 'admin', isPremium: true, displayName: 'Admin Tester' },
];

async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error !== null) {
    throw new Error(`listUsers failed: ${error.message}`);
  }
  return data.users.find((u) => u.email === email) ?? null;
}

async function ensureUser(spec: TestUserSpec): Promise<string> {
  const existing = await findUserByEmail(spec.email);
  if (existing !== null) {
    console.log(`[skip] ${spec.email} already exists (${existing.id})`);
    return existing.id;
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email: spec.email,
    password: spec.password,
    email_confirm: true,
    user_metadata: { display_name: spec.displayName },
  });
  if (error !== null || data.user === null) {
    throw new Error(`createUser ${spec.email} failed: ${error?.message ?? 'unknown'}`);
  }
  console.log(`[create] ${spec.email} → ${data.user.id}`);
  return data.user.id;
}

async function ensureProfile(userId: string, spec: TestUserSpec): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        display_name: spec.displayName,
        role: spec.role,
        preferred_certification: 'ip',
      },
      { onConflict: 'id' },
    );
  if (error !== null) {
    throw new Error(`upsert profile ${spec.email} failed: ${error.message}`);
  }
}

async function ensureSubscription(userId: string, isPremium: boolean): Promise<void> {
  if (!isPremium) {
    return;
  }
  // is_premium is derived in app code from status === 'active' | 'trialing'.
  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        status: 'active',
        source: 'stripe',
        stripe_subscription_id: `test_sub_${userId.slice(0, 8)}`,
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: 'stripe_subscription_id' },
    );
  if (error !== null) {
    throw new Error(`upsert subscription failed: ${error.message}`);
  }
}

async function main(): Promise<void> {
  console.log(`Seeding test users into ${SUPABASE_URL}`);
  for (const spec of TEST_USERS) {
    const userId = await ensureUser(spec);
    await ensureProfile(userId, spec);
    await ensureSubscription(userId, spec.isPremium);
  }
  console.log('Done.');
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
