import { test as base, type Page } from '@playwright/test';

/**
 * Test users seeded by `pnpm tsx scripts/seed-test-users.ts`.
 * Passwords are intentionally trivial — these accounts only exist in local Supabase.
 */
export const TEST_USERS = {
  free: { email: 'free@test.que.app', password: 'TestPassword123!' },
  paid: { email: 'paid@test.que.app', password: 'TestPassword123!' },
  admin: { email: 'admin@test.que.app', password: 'TestPassword123!' },
} as const;

export type TestUserKey = keyof typeof TEST_USERS;

/**
 * Sign in the given user via the login form.
 *
 * Lands on the dashboard ("/") on success. Throws if login UI is not reached
 * within the timeout, so tests fail fast on infra issues.
 */
export async function signIn(page: Page, userKey: TestUserKey): Promise<void> {
  const user = TEST_USERS[userKey];
  await page.goto('/login');

  await page.getByPlaceholder(/メール|email/i).first().fill(user.email);
  await page.getByPlaceholder(/パスワード|password/i).first().fill(user.password);
  await page.getByRole('button', { name: /ログイン|sign\s*in/i }).first().click();

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

export async function signOut(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /ログアウト|logout/i }).first().click().catch(() => {
    // Some layouts hide logout behind profile screen
  });
}

/**
 * Authenticated test fixture — provides `freePage` / `paidPage` / `adminPage`
 * that arrive pre-signed-in.
 */
interface AuthedFixtures {
  freePage: Page;
  paidPage: Page;
  adminPage: Page;
}

export const test = base.extend<AuthedFixtures>({
  freePage: async ({ page }, use) => {
    await signIn(page, 'free');
    await use(page);
  },
  paidPage: async ({ page }, use) => {
    await signIn(page, 'paid');
    await use(page);
  },
  adminPage: async ({ page }, use) => {
    await signIn(page, 'admin');
    await use(page);
  },
});

export { expect } from '@playwright/test';
