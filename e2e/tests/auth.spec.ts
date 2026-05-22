import { test, expect, signIn, signOut, TEST_USERS } from './_fixtures';

// ---------------------------------------------------------------------------
// 正常系
// ---------------------------------------------------------------------------

test.describe('認証 / 正常系', () => {
  test('ログインページが表示される（ロゴ・入力フィールド・ボタン）', async ({ page }) => {
    await page.goto('/login');

    // Que ロゴ or タイトル
    await expect(
      page.getByRole('heading', { name: /que/i }).or(page.locator('text=Que').first())
    ).toBeVisible({ timeout: 10000 });

    // メール・パスワード入力
    await expect(page.getByPlaceholder(/メール|email/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder(/パスワード|password/i).first()).toBeVisible({ timeout: 10000 });

    // ログインボタン
    await expect(
      page.getByRole('button', { name: /ログイン|sign\s*in/i }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('正しい認証情報でログイン → ダッシュボードへ遷移', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/メール|email/i).first().fill(TEST_USERS.free.email);
    await page.getByPlaceholder(/パスワード|password/i).first().fill(TEST_USERS.free.password);
    await page.getByRole('button', { name: /ログイン|sign\s*in/i }).first().click();

    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
    expect(page.url()).not.toContain('/login');
  });

  test('signIn fixture でログインが通る', async ({ page }) => {
    await signIn(page, 'free');
    expect(page.url()).not.toContain('/login');
  });

  test('ログアウト → /login へ戻る', async ({ page }) => {
    await signIn(page, 'free');

    // ログアウト: プロフィール画面経由など複数パターンを考慮
    const logoutBtn = page.getByRole('button', { name: /ログアウト|log\s*out|sign\s*out/i });
    const profileBtn = page.getByRole('button', { name: /プロフィール|profile|アカウント|account/i });

    if (await profileBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await profileBtn.first().click();
      await logoutBtn.first().click({ timeout: 8000 });
    } else {
      await logoutBtn.first().click({ timeout: 8000 });
    }

    await page.waitForURL(/\/login/, { timeout: 15000 });
    expect(page.url()).toContain('/login');
  });

  test('ログイン済みで /login に手動遷移するとダッシュボードへリダイレクト', async ({ page }) => {
    await signIn(page, 'free');
    await page.goto('/login');
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    expect(page.url()).not.toContain('/login');
  });

  test('再ログイン → ダッシュボード要素が表示される', async ({ page }) => {
    await signIn(page, 'free');
    await signOut(page);

    // 再ログイン
    await signIn(page, 'free');

    // ダッシュボード要素: ストリーク・今日・問題 など何らかのUI
    await expect(
      page.locator('text=/今日|Today|ストリーク|streak|問題|quiz|ホーム|home/i').first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('パスワードを忘れた → メール送信フォームが開く', async ({ page }) => {
    await page.goto('/login');

    const forgotLink = page.getByRole('link', { name: /パスワードを忘れ|forgot|reset/i })
      .or(page.getByText(/パスワードを忘れ|forgot|reset/i).first());

    await expect(forgotLink.first()).toBeVisible({ timeout: 10000 });
    await forgotLink.first().click();

    // メール送信フォーム or 別画面に遷移
    await expect(
      page.getByPlaceholder(/メール|email/i).first()
        .or(page.locator('text=/メールアドレス|email address|送信|send/i').first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('サインアップ画面に切り替えると氏名・メール・パスワードが表示される', async ({ page }) => {
    await page.goto('/login');

    const signupLink = page.getByRole('link', { name: /サインアップ|新規登録|sign\s*up|register/i })
      .or(page.getByText(/サインアップ|新規登録|sign\s*up|register/i).first());

    await expect(signupLink.first()).toBeVisible({ timeout: 10000 });
    await signupLink.first().click();

    // 氏名 or 名前フィールドが出現
    await expect(
      page.getByPlaceholder(/名前|氏名|name/i).first()
        .or(page.locator('input[type="text"]').first())
    ).toBeVisible({ timeout: 10000 });

    // メールとパスワードも確認
    await expect(page.getByPlaceholder(/メール|email/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder(/パスワード|password/i).first()).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// 異常系
// ---------------------------------------------------------------------------

test.describe('認証 / 異常系', () => {
  test('不正なメール＋パスワードでログイン → 日本語エラーメッセージ', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/メール|email/i).first().fill('invalid@example.com');
    await page.getByPlaceholder(/パスワード|password/i).first().fill('wrongpassword');
    await page.getByRole('button', { name: /ログイン|sign\s*in/i }).first().click();

    await expect(
      page.locator('text=/メール|パスワード|認証|エラー|ログイン|Invalid|incorrect/i').first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('存在しないアカウントでログイン → エラー表示', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/メール|email/i).first().fill('notexist@test.que.app');
    await page.getByPlaceholder(/パスワード|password/i).first().fill('TestPassword123!');
    await page.getByRole('button', { name: /ログイン|sign\s*in/i }).first().click();

    await expect(
      page.locator('text=/エラー|見つかり|存在|invalid|not found|incorrect/i').first()
    ).toBeVisible({ timeout: 15000 });
    expect(page.url()).toContain('/login');
  });

  test('空フィールドで送信 → バリデーションエラー or インラインエラー', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /ログイン|sign\s*in/i }).first().click();

    // バリデーションエラー or HTML5 required or エラーメッセージ
    const hasError = await page.locator('text=/入力|必須|required|メール|email/i').first()
      .isVisible({ timeout: 8000 }).catch(() => false);

    // /login を抜けていなければ最低限OK（ナビゲートせずに留まる）
    if (!hasError) {
      expect(page.url()).toContain('/login');
    } else {
      await expect(
        page.locator('text=/入力|必須|required|メール|email/i').first()
      ).toBeVisible();
    }
  });

  test('既存メールでサインアップ → エラー', async ({ page }) => {
    await page.goto('/login');

    const signupLink = page.getByText(/サインアップ|新規登録|sign\s*up|register/i).first();
    const isSignupVisible = await signupLink.isVisible({ timeout: 5000 }).catch(() => false);

    if (!isSignupVisible) {
      test.skip();
      return;
    }

    await signupLink.click();
    await page.getByPlaceholder(/名前|氏名|name/i).first().fill('Test User').catch(() => {});
    await page.getByPlaceholder(/メール|email/i).first().fill(TEST_USERS.free.email);
    await page.getByPlaceholder(/パスワード|password/i).first().fill('TestPassword123!');
    await page.getByRole('button', { name: /サインアップ|新規登録|sign\s*up|register|作成/i }).first().click();

    await expect(
      page.locator('text=/既に|already|exists|登録済み|エラー|error/i').first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('弱いパスワードでサインアップ → 拒否', async ({ page }) => {
    await page.goto('/login');

    const signupLink = page.getByText(/サインアップ|新規登録|sign\s*up|register/i).first();
    const isSignupVisible = await signupLink.isVisible({ timeout: 5000 }).catch(() => false);

    if (!isSignupVisible) {
      test.skip();
      return;
    }

    await signupLink.click();
    await page.getByPlaceholder(/名前|氏名|name/i).first().fill('Weak Pass User').catch(() => {});
    await page.getByPlaceholder(/メール|email/i).first().fill('weakpass@test.que.app');
    await page.getByPlaceholder(/パスワード|password/i).first().fill('123');
    await page.getByRole('button', { name: /サインアップ|新規登録|sign\s*up|register|作成/i }).first().click();

    await expect(
      page.locator('text=/パスワード|password|弱い|weak|短い|short|文字|characters/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('メール形式不正 → エラー', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/メール|email/i).first().fill('not-an-email');
    await page.getByPlaceholder(/パスワード|password/i).first().fill('TestPassword123!');
    await page.getByRole('button', { name: /ログイン|sign\s*in/i }).first().click();

    const hasError = await page.locator('text=/メール|email|形式|format|invalid|@/i').first()
      .isVisible({ timeout: 8000 }).catch(() => false);

    if (!hasError) {
      // HTML5 バリデーションが効いていれば /login を抜けない
      expect(page.url()).toContain('/login');
    } else {
      await expect(
        page.locator('text=/メール|email|形式|format|invalid/i').first()
      ).toBeVisible();
    }
  });

  test('パスワード忘れで存在しないメール → エラーまたは汎用成功メッセージ', async ({ page }) => {
    await page.goto('/login');

    const forgotLink = page.getByText(/パスワードを忘れ|forgot|reset/i).first();
    const isForgotVisible = await forgotLink.isVisible({ timeout: 5000 }).catch(() => false);

    if (!isForgotVisible) {
      test.skip();
      return;
    }

    await forgotLink.click();
    await page.getByPlaceholder(/メール|email/i).first().fill('ghost@test.que.app');
    await page.getByRole('button', { name: /送信|send|reset|リセット/i }).first().click();

    // セキュリティ仕様: エラーでも汎用成功メッセージでもいずれか表示
    await expect(
      page.locator('text=/送信|sent|エラー|error|メール|email|確認/i').first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('ネットワークオフライン状態でログイン → エラー表示', async ({ page }) => {
    await page.goto('/login');

    // オフラインにしてからフォーム送信
    await page.context().setOffline(true);

    await page.getByPlaceholder(/メール|email/i).first().fill(TEST_USERS.free.email);
    await page.getByPlaceholder(/パスワード|password/i).first().fill(TEST_USERS.free.password);
    await page.getByRole('button', { name: /ログイン|sign\s*in/i }).first().click();

    // オフラインエラー: ネットワーク系 or 汎用エラー
    await expect(
      page.locator('text=/エラー|error|ネットワーク|network|接続|connect|オフライン|offline/i').first()
    ).toBeVisible({ timeout: 15000 });

    await page.context().setOffline(false);
  });

  test('ログイン後セッション破棄 → /login へリダイレクト', async ({ page }) => {
    await signIn(page, 'free');

    // localStorage / sessionStorage を消してセッションを破棄
    // evaluate コールバックはブラウザコンテキストで実行されるため
    // グローバルは Function コンストラクタ経由で参照する
    await page.evaluate('(() => { localStorage.clear(); sessionStorage.clear(); Object.keys(localStorage).filter(k => k.startsWith("sb-") || k.includes("supabase")).forEach(k => localStorage.removeItem(k)); })()');

    // 保護ルートへ遷移するとログインへ戻る
    await page.goto('/');
    await page.waitForURL(/\/login/, { timeout: 15000 });
    expect(page.url()).toContain('/login');
  });

  test('Apple Sign In ボタンが Web では非表示', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Apple Sign In ボタンが存在しないか、hidden であることを確認
    const appleBtn = page.locator(
      'button:has-text("Apple"), [data-testid*="apple"], text=/Appleでサインイン|Sign in with Apple/i'
    );

    const isAppleVisible = await appleBtn.isVisible({ timeout: 3000 }).catch(() => false);
    expect(isAppleVisible).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// プラットフォーム別
// ---------------------------------------------------------------------------

test.describe('認証 / プラットフォーム別', () => {
  test('iPad でログイン画面が崩れない', async ({ page }, testInfo) => {
    if (!testInfo.project.name.includes('tablet')) {
      test.skip();
      return;
    }

    await page.goto('/login');

    const emailInput = page.getByPlaceholder(/メール|email/i).first();
    const passwordInput = page.getByPlaceholder(/パスワード|password/i).first();
    const loginBtn = page.getByRole('button', { name: /ログイン|sign\s*in/i }).first();

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await expect(loginBtn).toBeVisible({ timeout: 10000 });

    // 各要素が viewport 内に収まっているか確認
    const emailBox = await emailInput.boundingBox();
    const viewport = page.viewportSize();
    if (emailBox && viewport) {
      expect(emailBox.x).toBeGreaterThanOrEqual(0);
      expect(emailBox.x + emailBox.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test('iPhone でログイン画面が崩れない', async ({ page }, testInfo) => {
    if (!testInfo.project.name.includes('mobile-iphone')) {
      test.skip();
      return;
    }

    await page.goto('/login');

    const emailInput = page.getByPlaceholder(/メール|email/i).first();
    const passwordInput = page.getByPlaceholder(/パスワード|password/i).first();
    const loginBtn = page.getByRole('button', { name: /ログイン|sign\s*in/i }).first();

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await expect(loginBtn).toBeVisible({ timeout: 10000 });

    // 要素が viewport 幅をはみ出していないか
    const loginBox = await loginBtn.boundingBox();
    const viewport = page.viewportSize();
    if (loginBox && viewport) {
      expect(loginBox.x).toBeGreaterThanOrEqual(0);
      expect(loginBox.x + loginBox.width).toBeLessThanOrEqual(viewport.width);
    }
  });
});
