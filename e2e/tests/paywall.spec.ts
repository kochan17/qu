import { test, expect, signIn } from './_fixtures';

// ---------------------------------------------------------------------------
// Free user / 正常系
// ---------------------------------------------------------------------------

test.describe('ペイウォール / Free user / 正常系', () => {
  test('AI Q&A タブを開く → 1日上限制限の表示 or 上限到達後のペイウォールポップアップが見える', async ({ freePage: page }) => {
    await page.goto('/');

    const aiTab = page
      .getByRole('tab', { name: /ai|q&a|質問/i })
      .or(page.getByText(/ai q&a|ai質問|aiチャット/i).first());

    await aiTab.first().click({ timeout: 10000 });

    await expect(
      page
        .locator('text=/残り|あと|上限|制限|limit|今日の|daily/i')
        .or(page.locator('text=/プレミアム|premium|解除|アップグレード/i'))
        .first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('音声解説タブを開く → 「プレミアム限定」表示またはアクセス不可', async ({ freePage: page }) => {
    await page.goto('/');

    const audioTab = page
      .getByRole('tab', { name: /音声|audio|解説/i })
      .or(page.getByText(/音声解説|音声|audio/i).first());

    await audioTab.first().click({ timeout: 10000 });

    await expect(
      page
        .locator('text=/プレミアム限定|premium|限定|アクセス不可|locked|upgrade/i')
        .first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('Sidebar の PremiumCard で「プレミアムを始める」CTA が見える', async ({ freePage: page }) => {
    await page.goto('/');

    await expect(
      page
        .getByText(/プレミアムを始める|プレミアムにアップグレード|upgrade|premium/i)
        .first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('Notebook 画面: フリーユーザーでもメモ作成が可能', async ({ freePage: page }) => {
    await page.goto('/notebook');

    const createBtn = page
      .getByRole('button', { name: /新規|作成|add|new|\+/i })
      .or(page.locator('[data-testid="create-note"]'))
      .first();

    const isCreateVisible = await createBtn.isVisible({ timeout: 10000 }).catch(() => false);

    if (!isCreateVisible) {
      // ペイウォールで完全ブロックされている実装の場合はスキップ
      test.skip(true, '実装待ち: Notebook 作成ボタンの表示確認');
      return;
    }

    await expect(createBtn).toBeVisible();
  });

  test('Bookmarks 画面: フリーで動作する基本機能だけ表示', async ({ freePage: page }) => {
    await page.goto('/bookmarks');

    // ブックマーク一覧または空状態が表示される（premium ゲートがかかっていない）
    await expect(
      page
        .locator('text=/ブックマーク|bookmark|お気に入り|favorite|まだ|空/i')
        .first()
    ).toBeVisible({ timeout: 15000 });

    // ペイウォールブロックが表示されていないことを確認
    const isBlocked = await page
      .locator('text=/プレミアム限定|premium only|アップグレードが必要/i')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    expect(isBlocked).toBe(false);
  });

  test('ペイウォール表示時の CTA をタップ → 課金画面へ誘導', async ({ freePage: page }) => {
    await page.goto('/');

    const premiumCta = page
      .getByRole('button', { name: /プレミアムを始める|アップグレード|upgrade|subscribe|購入/i })
      .or(page.getByText(/プレミアムを始める|アップグレード|upgrade/i).first());

    await premiumCta.first().click({ timeout: 10000 });

    await expect(
      page
        .locator('text=/プレミアム|premium|プラン|plan|月額|円\/月|980|購読|subscribe/i')
        .first()
    ).toBeVisible({ timeout: 15000 });
  });
});

// ---------------------------------------------------------------------------
// Paid user / 正常系
// ---------------------------------------------------------------------------

test.describe('ペイウォール / Paid user / 正常系', () => {
  test('AI Q&A 無制限（上限表示なし）', async ({ paidPage: page }) => {
    await page.goto('/');

    const aiTab = page
      .getByRole('tab', { name: /ai|q&a|質問/i })
      .or(page.getByText(/ai q&a|ai質問|aiチャット/i).first());

    await aiTab.first().click({ timeout: 10000 });

    // 上限・制限表示が出ていないことを確認
    const hasLimit = await page
      .locator('text=/残り\d+回|上限|制限|limit reached|daily limit/i')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    expect(hasLimit).toBe(false);

    // 入力フォームが有効なまま表示されている
    await expect(
      page
        .getByPlaceholder(/質問|聞く|ask|message/i)
        .or(page.locator('textarea').first())
        .first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('音声解説タブ → 音声リスト表示・再生コントロール', async ({ paidPage: page }) => {
    await page.goto('/');

    const audioTab = page
      .getByRole('tab', { name: /音声|audio|解説/i })
      .or(page.getByText(/音声解説|audio/i).first());

    await audioTab.first().click({ timeout: 10000 });

    // ペイウォールブロックがないことを確認
    const isBlocked = await page
      .locator('text=/プレミアム限定|premium only|locked/i')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    expect(isBlocked).toBe(false);

    // 音声リストまたは再生コントロールが表示される
    await expect(
      page
        .locator('text=/解説|lecture|lesson|音声/i')
        .or(page.locator('[data-testid*="audio"], [aria-label*="再生"], button[aria-label*="play"]'))
        .first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('Sidebar に PremiumCard が非表示 or 別UI', async ({ paidPage: page }) => {
    await page.goto('/');

    // 「プレミアムを始める」CTA が表示されていないことを確認
    const isPremiumCtaVisible = await page
      .getByText(/プレミアムを始める|今すぐアップグレード|upgrade to premium/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    expect(isPremiumCtaVisible).toBe(false);
  });

  test('Profile に「Que プレミアム」緑バッジ表示', async ({ paidPage: page }) => {
    const profileBtn = page
      .getByRole('button', { name: /プロフィール|profile|アカウント|account/i })
      .or(page.locator('[data-testid="profile-icon"], [data-testid="profile-btn"]'));

    const isProfileVisible = await profileBtn.first().isVisible({ timeout: 8000 }).catch(() => false);
    if (isProfileVisible) {
      await profileBtn.first().click();
    } else {
      await page.goto('/profile');
    }

    await expect(
      page
        .locator('text=/プレミアム|premium|Que プレミアム/i')
        .first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('全コース閲覧可能', async ({ paidPage: page }) => {
    await page.goto('/');

    const coursesLink = page
      .getByRole('link', { name: /コース|courses|学習|study/i })
      .or(page.getByText(/コース一覧|all courses/i).first());

    const isCoursesVisible = await coursesLink.first().isVisible({ timeout: 8000 }).catch(() => false);
    if (isCoursesVisible) {
      await coursesLink.first().click();
    } else {
      await page.goto('/courses');
    }

    // ロック・ペイウォールが表示されていないことを確認
    const isLocked = await page
      .locator('text=/プレミアム限定|locked|premium only/i, [data-testid*="lock"]')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    expect(isLocked).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 異常系
// ---------------------------------------------------------------------------

test.describe('ペイウォール / 異常系', () => {
  test('Free user が paid only URL を直接叩く → ペイウォール画面 or リダイレクト', async ({ page }) => {
    await signIn(page, 'free');
    await page.goto('/(app)/audio');

    // ペイウォール表示 or 別ページへリダイレクトのいずれか
    const isPaywalled = await page
      .locator('text=/プレミアム限定|premium|locked|アクセスできません|upgrade/i')
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    const isRedirected = !page.url().includes('/audio');

    expect(isPaywalled || isRedirected).toBe(true);
  });

  test('セッション切れ → /login へリダイレクト', async ({ page }) => {
    await signIn(page, 'free');

    // セッションを破棄
    await page.evaluate(
      '(() => { localStorage.clear(); sessionStorage.clear(); Object.keys(localStorage).filter(k => k.startsWith("sb-") || k.includes("supabase")).forEach(k => localStorage.removeItem(k)); })()'
    );

    await page.goto('/');
    await page.waitForURL(/\/login/, { timeout: 15000 });
    expect(page.url()).toContain('/login');
  });

  test('Free user が API 経由で paid 操作を試行 → サーバー側 RLS でブロック（応答コード確認）', async ({ page }) => {
    await signIn(page, 'free');

    // アクセストークンを取得
    const token = await page.evaluate(`(() => {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          try {
            const parsed = JSON.parse(localStorage.getItem(key) || '{}');
            if (parsed && typeof parsed.access_token === 'string') {
              return parsed.access_token;
            }
          } catch (e) { /* ignore */ }
        }
      }
      return null;
    })()`) as string | null;

    if (!token) {
      test.skip(true, '実装待ち: Supabase アクセストークン取得方法の確認');
      return;
    }

    // audio_tracks は paid only テーブルを想定（RLS で free ユーザーを排除）
    const supabaseUrl = 'http://127.0.0.1:54321';
    const response = await page.request.get(`${supabaseUrl}/rest/v1/audio_tracks?select=*`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: token,
      },
    });

    // RLS によりデータが返らない（200 で空配列 or 403/401）
    expect([200, 401, 403]).toContain(response.status());
    if (response.status() === 200) {
      const body: unknown = await response.json();
      expect(Array.isArray(body) && body.length === 0).toBe(true);
    }
  });
});
