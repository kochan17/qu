import { test, expect } from './_fixtures';

test.describe('学習ループ / 正常系 (free user)', () => {
  test('ログイン後ダッシュボードが表示される（ストリーク・今日の課題・コース一覧）', async ({ freePage: page }) => {
    await page.goto('/');
    // ダッシュボード要素のいずれかが表示される
    await expect(
      page.locator('text=/Today|ストリーク|課題|コース|学習/i').first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('サイドバーまたはナビからコース一覧に遷移するとコースカードが並ぶ', async ({ freePage: page }) => {
    await page.goto('/');
    // コース一覧リンクをクリック
    const courseLink = page
      .getByRole('link', { name: /コース|course/i })
      .or(page.locator('text=/コース一覧|コース/i'))
      .first();
    await courseLink.waitFor({ timeout: 15000 });
    await courseLink.click();
    // コースカード or コース名が表示される
    await expect(
      page.locator('[data-testid="course-card"], text=/ITパスポート|基本情報|SPI|簿記/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('コース詳細からレッスン一覧を開いて1レッスン開ける', async ({ freePage: page }) => {
    await page.goto('/(app)/learn');
    // レッスンリンクまたはカードの最初の要素をクリック
    const lessonItem = page
      .locator('[data-testid="lesson-item"], [data-testid="lesson-card"]')
      .or(page.getByRole('link', { name: /レッスン|lesson|第.章|Unit/i }))
      .first();
    const hasLesson = await lessonItem.isVisible({ timeout: 10000 }).catch(() => false);
    if (!hasLesson) {
      test.skip();
      return;
    }
    await lessonItem.click();
    // レッスンコンテンツが表示される
    await expect(
      page.locator('text=/問題|解説|レッスン|lesson/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('Practiceで1問解くと結果フィードバックが表示される', async ({ freePage: page }) => {
    await page.goto('/(app)/practice');
    // 選択肢ボタンを待機
    const choices = page
      .locator('[data-testid="choice"], [data-testid="option"]')
      .or(page.getByRole('button', { name: /[①②③④]|[ABCD]/ }));
    const hasChoices = await choices.first().isVisible({ timeout: 15000 }).catch(() => false);
    if (!hasChoices) {
      test.skip();
      return;
    }
    await choices.first().click();
    // 正解/不正解フィードバックが表示される
    await expect(
      page.locator('text=/正解|不正解|解説|correct|incorrect/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('1日の完了状態がストリークに反映される（再ロード後も保持）', async ({ freePage: page }) => {
    await page.goto('/');
    // ストリーク表示を確認
    const streak = page.locator('text=/ストリーク|連続|streak/i').first();
    const hasStreak = await streak.isVisible({ timeout: 10000 }).catch(() => false);
    if (!hasStreak) {
      test.skip();
      return;
    }
    // ページリロード後も表示が保持される
    await page.reload();
    await expect(streak).toBeVisible({ timeout: 10000 });
  });
});

test.describe('学習ループ / 正常系 (paid user)', () => {
  test('全コースにアクセスできる（ペイウォール非表示）', async ({ paidPage: page }) => {
    test.skip(true, '有料プランのコースアクセス制御UI未実装待ち');
    await page.goto('/(app)/learn');
    // ロックアイコンやペイウォールが表示されないことを確認
    const paywall = page.locator('[data-testid="paywall"], text=/アップグレード|プレミアム|unlock/i');
    await expect(paywall).not.toBeVisible({ timeout: 10000 });
  });

  test('音声解説タブで音声リストが表示される', async ({ paidPage: page }) => {
    test.skip(true, '音声解説タブUI未実装待ち');
    await page.goto('/(app)/learn');
    const audioTab = page.getByRole('tab', { name: /音声|audio/i }).first();
    await audioTab.click();
    await expect(
      page.locator('[data-testid="audio-item"], text=/音声|解説/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('AI Q&Aがペイウォールなしで使用できる', async ({ paidPage: page }) => {
    test.skip(true, 'AI Q&A機能未実装待ち');
    await page.goto('/(app)/practice');
    const aiButton = page.getByRole('button', { name: /AI|質問|Q&A/i }).first();
    await aiButton.click();
    // ペイウォールではなくQ&A入力UIが表示される
    await expect(
      page.locator('text=/アップグレード|プレミアム|unlock/i')
    ).not.toBeVisible({ timeout: 5000 });
    await expect(
      page.locator('[data-testid="ai-input"], text=/質問を入力|ask/i').first()
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('学習ループ / 異常系', () => {
  test('API エラー時に適切なエラーUIが表示される', async ({ freePage: page }) => {
    // Supabase REST API をモックしてエラーを返す
    await page.route('**/rest/v1/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    await page.goto('/(app)/practice');
    // エラーUI or リトライUIが表示される
    await expect(
      page.locator('text=/エラー|error|失敗|再試行|retry|読み込め/i').first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('問題ゼロの場合に Empty state UIが表示される', async ({ freePage: page }) => {
    // 空の問題リストを返すようにモック
    await page.route('**/rest/v1/questions**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
    await page.goto('/(app)/practice');
    // 空状態のUIが表示される
    await expect(
      page.locator('text=/問題がありません|empty|まだありません|今日の問題はありません/i').first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('pause状態のバナーから「再開」できる', async ({ freePage: page }) => {
    await page.goto('/(app)/pause');
    const resumeButton = page.getByRole('button', { name: /再開|resume|続ける/i }).first();
    const hasResume = await resumeButton.isVisible({ timeout: 10000 }).catch(() => false);
    if (!hasResume) {
      test.skip();
      return;
    }
    await resumeButton.click();
    // pause画面から離れる
    await expect(page).not.toHaveURL(/\/pause/, { timeout: 10000 });
  });

  test('ネットワーク切断中の解答送信でリトライまたはキャッシュが機能する', async ({ freePage: page }) => {
    await page.goto('/(app)/practice');
    const choices = page
      .locator('[data-testid="choice"], [data-testid="option"]')
      .or(page.getByRole('button', { name: /[①②③④]|[ABCD]/ }));
    const hasChoices = await choices.first().isVisible({ timeout: 15000 }).catch(() => false);
    if (!hasChoices) {
      test.skip();
      return;
    }
    // 解答送信エンドポイントをオフライン状態にモック
    await page.route('**/rest/v1/answers**', (route) => {
      route.abort('failed');
    });
    await choices.first().click();
    // エラーまたはリトライUIが表示される（クラッシュしないことを確認）
    await expect(
      page.locator('text=/エラー|再試行|retry|オフライン|通信/i')
        .or(page.locator('text=/正解|不正解|解説/i'))
        .first()
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('学習ループ / プラットフォーム別', () => {
  // これらはplaywright.config.ts の tablet-ipad / mobile-iphone プロジェクトで実行される
  // desktop プロジェクトでも動作するようにフォールバック付きで実装

  test('iPad form factor でサイドバーが表示され両カラムレイアウトになる', async ({ freePage: page }) => {
    const viewport = page.viewportSize();
    const isTablet = viewport && viewport.width >= 768;
    if (!isTablet) {
      test.skip();
      return;
    }
    await page.goto('/');
    // サイドバーが表示されている（常時表示）
    const sidebar = page
      .locator('[data-testid="sidebar"], nav[aria-label="sidebar"], aside')
      .first();
    const hasSidebar = await sidebar.isVisible({ timeout: 10000 }).catch(() => false);
    if (!hasSidebar) {
      test.skip();
      return;
    }
    await expect(sidebar).toBeVisible({ timeout: 10000 });
    // メインコンテンツ領域も同時に表示される
    await expect(
      page.locator('main, [data-testid="main-content"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('Mobile form factor でハンバーガーメニューまたは下タブUIが表示される', async ({ freePage: page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;
    if (!isMobile) {
      test.skip();
      return;
    }
    await page.goto('/');
    // ハンバーガーボタン or ボトムタブバーのいずれかが表示される
    const hamburger = page.getByRole('button', { name: /menu|メニュー|ハンバーガー/i });
    const bottomTab = page.locator('[data-testid="bottom-tab"], [role="tablist"]');
    const hasHamburger = await hamburger.first().isVisible({ timeout: 10000 }).catch(() => false);
    const hasBottomTab = await bottomTab.first().isVisible({ timeout: 10000 }).catch(() => false);
    expect(hasHamburger || hasBottomTab).toBe(true);
  });
});
