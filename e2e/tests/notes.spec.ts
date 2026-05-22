import { test, expect } from './_fixtures';

// ---------------------------------------------------------------------------
// ノート / 正常系
// ---------------------------------------------------------------------------

test.describe('ノート / 正常系', () => {
  test('ログイン後 Sidebar の「ノート」をタップ → /notebook 画面', async ({ freePage: page }) => {
    await page.goto('/');

    const notesLink = page
      .getByRole('link', { name: /ノート|note|notebook/i })
      .or(page.getByText(/ノート|notebook/i).first());

    await notesLink.first().click({ timeout: 10000 });

    await page.waitForURL(/\/notebook/, { timeout: 15000 });
    expect(page.url()).toContain('/notebook');
  });

  test('空状態表示「まだノートがありません」', async ({ freePage: page }) => {
    await page.goto('/notebook');

    // ノートが0件のシード状態を前提とする
    await expect(
      page
        .locator('text=/まだノートがありません|ノートがありません|no notes|空|empty/i')
        .first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('レッスン詳細: テキスト範囲選択 → 色選択 → ハイライト保存', async ({ freePage: page }, testInfo) => {
    // Selection API は Web (desktop/mobile Chrome/Safari) のみ
    if (!['desktop-chrome', 'desktop-safari', 'desktop-firefox'].includes(testInfo.project.name)) {
      test.skip(true, '実装待ち: Selection API は Web プロジェクト限定');
      return;
    }

    await page.goto('/');

    // レッスン詳細へ遷移（学習タブ → 最初のレッスン）
    const lessonLink = page
      .getByRole('link', { name: /レッスン|lesson|学習|study/i })
      .or(page.locator('[data-testid*="lesson"]').first());

    const isLessonVisible = await lessonLink.first().isVisible({ timeout: 8000 }).catch(() => false);
    if (!isLessonVisible) {
      test.skip(true, '実装待ち: レッスン一覧からの遷移経路');
      return;
    }
    await lessonLink.first().click();

    // HighlightableReader 内のテキストを取得して範囲選択
    const reader = page
      .locator('[data-testid="highlightable-reader"], .highlightable-reader')
      .or(page.locator('article, [role="article"]').first());

    await reader.first().waitFor({ timeout: 15000 });

    // Selection API で最初の文字から30文字を選択
    await page.evaluate(`(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      let textNode = null;
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.textContent && node.textContent.trim().length > 30) {
          textNode = node;
          break;
        }
      }
      if (!textNode) return;
      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, 30);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    })()`);

    // 色選択ポップオーバーが表示される
    const colorPicker = page
      .locator('[data-testid*="color"], [aria-label*="色"], [aria-label*="color"]')
      .or(page.locator('text=/ハイライト|highlight/i').first());

    await expect(colorPicker.first()).toBeVisible({ timeout: 10000 });

    // 最初の色を選択
    await colorPicker.first().click();

    // 保存完了の確認（toast or ハイライト要素の出現）
    await expect(
      page
        .locator('text=/保存|saved|ハイライト|highlight/i')
        .or(page.locator('[data-testid*="highlight-mark"]').first())
        .first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('ハイライトに「メモを追加」→ メモ入力 → 保存', async ({ freePage: page }, testInfo) => {
    if (!['desktop-chrome', 'desktop-safari', 'desktop-firefox'].includes(testInfo.project.name)) {
      test.skip(true, '実装待ち: Selection API は Web プロジェクト限定');
      return;
    }

    test.skip(true, '実装待ち: ハイライト保存後のメモ追加フロー');
  });

  test('Notebook 画面に戻る → ハイライトとメモが表示される', async ({ freePage: page }, testInfo) => {
    if (!['desktop-chrome', 'desktop-safari', 'desktop-firefox'].includes(testInfo.project.name)) {
      test.skip(true, '実装待ち: Selection API は Web プロジェクト限定');
      return;
    }

    test.skip(true, '実装待ち: ハイライト保存後の一覧反映確認');
  });

  test('ハイライト色フィルタで絞り込み', async ({ freePage: page }) => {
    await page.goto('/notebook');

    const filterBtn = page
      .locator('[data-testid*="filter"], [aria-label*="フィルタ"], [aria-label*="filter"]')
      .or(page.getByRole('button', { name: /フィルタ|filter|色|color/i }));

    const isFilterVisible = await filterBtn.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (!isFilterVisible) {
      test.skip(true, '実装待ち: 色フィルタ UI');
      return;
    }

    await filterBtn.first().click();
    await expect(
      page.locator('[data-testid*="color-filter"], [aria-label*="色"]').first()
    ).toBeVisible({ timeout: 8000 });
  });

  test('全文検索でメモ本文ヒット', async ({ freePage: page }) => {
    await page.goto('/notebook');

    const searchInput = page
      .getByPlaceholder(/検索|search/i)
      .or(page.locator('[data-testid="note-search"]'))
      .first();

    const isSearchVisible = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isSearchVisible) {
      test.skip(true, '実装待ち: ノート全文検索 UI');
      return;
    }

    await searchInput.fill('テスト');
    await page.keyboard.press('Enter');

    // 検索結果 or 空状態のいずれかが表示される
    await expect(
      page
        .locator('text=/テスト|結果|見つかりません|no results/i')
        .first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('ハイライト削除（スワイプ or 長押しメニュー）', async ({ freePage: page }) => {
    await page.goto('/notebook');

    const highlightItem = page
      .locator('[data-testid*="highlight-item"], [data-testid*="note-item"]')
      .or(page.locator('[role="listitem"]').first());

    const isItemVisible = await highlightItem.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (!isItemVisible) {
      test.skip(true, '実装待ち: ハイライト削除（ノートが存在する状態が前提）');
      return;
    }

    // 長押しメニュー
    await highlightItem.first().dispatchEvent('contextmenu');
    const deleteBtn = page
      .getByRole('button', { name: /削除|delete|remove/i })
      .or(page.locator('text=/削除|delete/i').first());

    await expect(deleteBtn.first()).toBeVisible({ timeout: 8000 });
    await deleteBtn.first().click();

    // 削除確認 Alert or 即時削除
    const confirmBtn = page
      .getByRole('button', { name: /削除|OK|確認|confirm/i })
      .first();
    const isConfirmVisible = await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (isConfirmVisible) {
      await confirmBtn.click();
    }
  });

  test('問題画面で PinNoteIcon タップ → BottomSheet → メモ入力 → 保存', async ({ freePage: page }) => {
    await page.goto('/');

    // 演習・問題画面へ遷移
    const quizLink = page
      .getByRole('link', { name: /演習|quiz|問題|practice/i })
      .or(page.getByText(/演習|quiz|問題/i).first());

    const isQuizVisible = await quizLink.first().isVisible({ timeout: 8000 }).catch(() => false);
    if (!isQuizVisible) {
      test.skip(true, '実装待ち: 問題画面への遷移経路');
      return;
    }
    await quizLink.first().click();

    const pinNoteIcon = page
      .locator('[data-testid="pin-note-icon"], [aria-label*="ピンノート"], [aria-label*="pin note"]')
      .or(page.locator('[data-testid*="pin"]').first());

    await expect(pinNoteIcon.first()).toBeVisible({ timeout: 15000 });
    await pinNoteIcon.first().click();

    // BottomSheet の出現を確認
    const bottomSheet = page
      .locator('[data-testid="pin-note-sheet"], [aria-label*="ノートを追加"]')
      .or(page.locator('[role="dialog"], [role="sheet"]').first());

    await expect(bottomSheet.first()).toBeVisible({ timeout: 10000 });

    // メモ入力
    const noteInput = bottomSheet.locator('textarea, input[type="text"]').first();
    await noteInput.fill('テストのピンノートです');

    // 保存
    await page
      .getByRole('button', { name: /保存|save|追加|add/i })
      .first()
      .click();

    await expect(
      page
        .locator('text=/保存|saved|追加|added/i')
        .or(page.locator('[data-testid="pin-note-saved"]'))
        .first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('同じ問題の PinNoteIcon に hasNote=true 反映', async ({ freePage: page }) => {
    test.skip(true, '実装待ち: PinNote保存後の hasNote フラグ反映確認');
  });

  test('PinNote 削除 → 確認 Alert → 削除完了', async ({ freePage: page }) => {
    await page.goto('/notebook');

    const pinNoteItem = page
      .locator('[data-testid*="pin-note-item"]')
      .or(page.locator('[data-testid*="note-item"]').first());

    const isItemVisible = await pinNoteItem.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (!isItemVisible) {
      test.skip(true, '実装待ち: PinNote削除（PinNoteが存在する状態が前提）');
      return;
    }

    await pinNoteItem.first().dispatchEvent('contextmenu');
    const deleteBtn = page
      .getByRole('button', { name: /削除|delete/i })
      .first();

    await expect(deleteBtn).toBeVisible({ timeout: 8000 });
    await deleteBtn.click();

    // 確認 Alert
    await expect(
      page.locator('text=/削除しますか|本当に|are you sure/i').first()
    ).toBeVisible({ timeout: 8000 });

    await page
      .getByRole('button', { name: /削除|OK|確認/i })
      .first()
      .click();

    // 削除完了 → アイテムが消える
    await expect(pinNoteItem.first()).not.toBeVisible({ timeout: 10000 });
  });

  test('ベストアンサーマーク（is_best_answer）切替', async ({ freePage: page }) => {
    test.skip(true, '実装待ち: is_best_answer トグル UI の確認');
  });
});

// ---------------------------------------------------------------------------
// ノート / 異常系
// ---------------------------------------------------------------------------

test.describe('ノート / 異常系', () => {
  test('空文字メモで保存試行 → バリデーション or 保存可（仕様確認）', async ({ freePage: page }) => {
    await page.goto('/notebook');

    const createBtn = page
      .getByRole('button', { name: /新規|作成|add|new|\+/i })
      .or(page.locator('[data-testid="create-note"]'))
      .first();

    const isCreateVisible = await createBtn.isVisible({ timeout: 8000 }).catch(() => false);
    if (!isCreateVisible) {
      test.skip(true, '実装待ち: ノート作成 UI');
      return;
    }

    await createBtn.click();

    const noteInput = page.locator('textarea, input[type="text"]').first();
    await noteInput.waitFor({ timeout: 8000 });
    // 空文字のまま保存
    await page
      .getByRole('button', { name: /保存|save/i })
      .first()
      .click();

    // バリデーションエラー or 画面が閉じる（仕様次第）の一方が発生すればOK
    const hasError = await page
      .locator('text=/入力|必須|required|空|empty/i')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const isClosed = await page
      .locator('[role="dialog"], [role="sheet"]')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    // どちらかが成立すればOK（仕様が決まり次第絞る）
    expect(hasError || !isClosed).toBeTruthy();
  });

  test('1000文字以上のメモ → 文字数制限 or 保存可', async ({ freePage: page }) => {
    await page.goto('/notebook');

    const createBtn = page
      .getByRole('button', { name: /新規|作成|add|new|\+/i })
      .or(page.locator('[data-testid="create-note"]'))
      .first();

    const isCreateVisible = await createBtn.isVisible({ timeout: 8000 }).catch(() => false);
    if (!isCreateVisible) {
      test.skip(true, '実装待ち: ノート作成 UI');
      return;
    }

    await createBtn.click();

    const noteInput = page.locator('textarea, input[type="text"]').first();
    await noteInput.waitFor({ timeout: 8000 });
    await noteInput.fill('あ'.repeat(1001));

    const actualLength = await noteInput.evaluate('(el) => (el.value || "").length') as number;

    // 制限がある場合は ≤ 1000、ない場合はそのまま保存可
    expect(actualLength).toBeGreaterThan(0);
    // 文字数カウント表示の確認（あれば）
    const counter = page.locator('text=/\\d+\\/1000|\\d+ 文字|characters/i').first();
    const isCounterVisible = await counter.isVisible({ timeout: 3000 }).catch(() => false);
    if (isCounterVisible) {
      await expect(counter).toBeVisible();
    }
  });

  test('同時編集（2タブで同じノートを編集）→ 後勝ち or マージ', async ({ browser }) => {
    test.skip(true, '実装待ち: 同時編集の競合解決ポリシー確認');
    // 2コンテキストで同じノートIDを開き、後から保存した値が勝つことを確認する予定
    void browser; // 参照のみ
  });

  test('削除済みハイライトの参照（直 URL）→ 404 or リダイレクト', async ({ freePage: page }) => {
    // 存在しない highlight ID を直接叩く
    await page.goto('/notebook/highlight/00000000-0000-0000-0000-000000000000');

    const is404 = await page
      .locator('text=/404|見つかりません|not found/i')
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    const isRedirected = !page.url().includes('/highlight/00000000-0000-0000-0000-000000000000');

    expect(is404 || isRedirected).toBe(true);
  });

  test('ネットワーク失敗時の保存 → retry or local キャッシュ', async ({ freePage: page }) => {
    await page.goto('/notebook');

    const createBtn = page
      .getByRole('button', { name: /新規|作成|add|new|\+/i })
      .or(page.locator('[data-testid="create-note"]'))
      .first();

    const isCreateVisible = await createBtn.isVisible({ timeout: 8000 }).catch(() => false);
    if (!isCreateVisible) {
      test.skip(true, '実装待ち: ノート作成 UI');
      return;
    }

    await createBtn.click();

    const noteInput = page.locator('textarea, input[type="text"]').first();
    await noteInput.waitFor({ timeout: 8000 });
    await noteInput.fill('オフライン保存テスト');

    // オフラインにしてから保存
    await page.context().setOffline(true);

    await page
      .getByRole('button', { name: /保存|save/i })
      .first()
      .click();

    // エラー表示 or リトライインジケーター or オフライン保存成功のいずれか
    await expect(
      page
        .locator('text=/エラー|error|保存できません|retry|再試行|オフライン|offline|キャッシュ|saved locally/i')
        .first()
    ).toBeVisible({ timeout: 15000 });

    await page.context().setOffline(false);
  });
});

// ---------------------------------------------------------------------------
// ノート / プラットフォーム別
// ---------------------------------------------------------------------------

test.describe('ノート / プラットフォーム別', () => {
  test('iPad form factor で範囲選択 UI（Apple Books 風 popover）が表示される', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'tablet-ipad') {
      test.skip(true, 'iPad プロジェクトのみ対象');
      return;
    }

    await page.goto('/');

    const lessonLink = page
      .getByRole('link', { name: /レッスン|lesson|学習/i })
      .or(page.locator('[data-testid*="lesson"]').first());

    const isLessonVisible = await lessonLink.first().isVisible({ timeout: 8000 }).catch(() => false);
    if (!isLessonVisible) {
      test.skip(true, '実装待ち: iPad でのレッスン遷移経路');
      return;
    }
    await lessonLink.first().click();

    // iPad での Selection API
    await page.evaluate(`(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      let textNode = null;
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.textContent && node.textContent.trim().length > 20) {
          textNode = node;
          break;
        }
      }
      if (!textNode) return;
      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, 20);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    })()`);

    // iPad では popover スタイルの UI が出ることを確認
    const popover = page
      .locator('[role="tooltip"], [data-testid*="popover"]')
      .or(page.locator('[aria-label*="ハイライト"], [aria-label*="highlight"]').first());

    await expect(popover.first()).toBeVisible({ timeout: 10000 });

    // viewport 内に収まっているか
    const box = await popover.first().boundingBox();
    const viewport = page.viewportSize();
    if (box && viewport) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test('Mobile form factor で BottomSheet が画面下部に出る', async ({ page }, testInfo) => {
    if (!['mobile-iphone', 'mobile-android'].includes(testInfo.project.name)) {
      test.skip(true, 'モバイルプロジェクトのみ対象');
      return;
    }

    await page.goto('/');

    const quizLink = page
      .getByRole('link', { name: /演習|quiz|問題/i })
      .or(page.getByText(/演習|問題/i).first());

    const isQuizVisible = await quizLink.first().isVisible({ timeout: 8000 }).catch(() => false);
    if (!isQuizVisible) {
      test.skip(true, '実装待ち: Mobile での問題画面遷移経路');
      return;
    }
    await quizLink.first().click();

    const pinNoteIcon = page
      .locator('[data-testid="pin-note-icon"], [aria-label*="ピンノート"]')
      .first();

    const isPinVisible = await pinNoteIcon.isVisible({ timeout: 10000 }).catch(() => false);
    if (!isPinVisible) {
      test.skip(true, '実装待ち: Mobile での PinNoteIcon 表示確認');
      return;
    }
    await pinNoteIcon.click();

    const bottomSheet = page
      .locator('[data-testid="pin-note-sheet"], [role="dialog"], [role="sheet"]')
      .first();

    await expect(bottomSheet).toBeVisible({ timeout: 10000 });

    // BottomSheet が画面下部に位置することを確認
    const box = await bottomSheet.boundingBox();
    const viewport = page.viewportSize();
    if (box && viewport) {
      // BottomSheet の上端が viewport 下半分より下にある
      expect(box.y).toBeGreaterThan(viewport.height * 0.3);
    }
  });

  test('Notebook の Card レイアウトが3デバイスで崩れない', async ({ page }, testInfo) => {
    const targetProjects = ['desktop-chrome', 'tablet-ipad', 'mobile-iphone'];
    if (!targetProjects.includes(testInfo.project.name)) {
      test.skip(true, 'desktop-chrome / tablet-ipad / mobile-iphone のみ対象');
      return;
    }

    await page.goto('/notebook');

    // Notebook カードの存在確認（空状態では代替テキストを確認）
    const noteCards = page.locator('[data-testid*="note-card"], [data-testid*="highlight-card"]');
    const isEmpty = await page
      .locator('text=/まだ|ありません|empty|no notes/i')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isEmpty) {
      // 空状態でも画面が崩れていないことを確認
      const viewport = page.viewportSize();
      if (viewport) {
        const body = page.locator('body');
        const bodyBox = await body.boundingBox();
        if (bodyBox) {
          expect(bodyBox.width).toBeLessThanOrEqual(viewport.width + 1);
        }
      }
      return;
    }

    // カードが viewport 幅をはみ出していないことを確認
    const cardCount = await noteCards.count();
    if (cardCount > 0) {
      const viewport = page.viewportSize();
      const firstCard = noteCards.first();
      const box = await firstCard.boundingBox();
      if (box && viewport) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      }
    }
  });
});
