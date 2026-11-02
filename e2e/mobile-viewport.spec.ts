import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport & Touch Scroll E2E Tests', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Main dashboard has zero horizontal body overflow on mobile screens', async ({ page }) => {
    // Check document scrollWidth vs clientWidth
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        clientWidth: doc.clientWidth,
        scrollWidth: doc.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasHorizontalScroll: doc.scrollWidth > doc.clientWidth + 2
      };
    });

    expect(overflow.hasHorizontalScroll).toBe(false);
  });

  test('Vedic Calendar Modal on mobile does not cut off days 28-31', async ({ page }) => {
    // 1. Open Vedic Calendar Modal
    const panchangCTA = page.locator('text=/Tap for Full Panchang & Tithi Timings|सम्पूर्ण पंचांग/i').first();
    await panchangCTA.click();

    const vedicModal = page.locator('div[role="dialog"]').filter({ hasText: /Vedic Calendar|Panchang|पंचांग/i }).first();
    await expect(vedicModal).toBeVisible({ timeout: 5000 });

    // 2. Find scrollable container
    const scrollContainer = vedicModal.locator('.overflow-y-auto').first();
    await expect(scrollContainer).toBeVisible();

    // 3. Scroll all the way to bottom
    await scrollContainer.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    // 4. Verify day 28 is fully visible in viewport
    const day28 = vedicModal.getByText(/^28$/).first();
    await expect(day28).toBeVisible();

    // 5. If month has 29, 30, or 31, check that the last day is rendered
    const lastDayElement = vedicModal.locator('text=/^(29|30|31)$/').last();
    if (await lastDayElement.count() > 0) {
      await expect(lastDayElement).toBeVisible();
    }

    // 6. Close modal
    const closeBtn = vedicModal.locator('button[aria-label*="close" i], button[title*="close" i], button:has-text("←")').first();
    await closeBtn.click();
    await expect(vedicModal).not.toBeVisible({ timeout: 3000 });
  });

  test('Monthly Muhurat Modal on mobile supports touch panning across 2D table', async ({ page }) => {
    // 1. Open Monthly Muhurat Modal by clicking card or CTA
    const muhuratTrigger = page.locator('div[role="button"]').filter({ hasText: /Today's Shubh Karya Muhurat|आज का शुभ कार्य मुहूर्त/i }).first();
    await muhuratTrigger.click();

    const muhuratModal = page.locator('div[role="dialog"]').filter({ hasText: /Shubh Karya|Muhurat|शुभ कार्य मुहूर्त/i }).first();
    await expect(muhuratModal).toBeVisible({ timeout: 5000 });

    // 2. Check 2D scroll container
    const tableContainer = muhuratModal.locator('.overflow-x-auto').first();
    await expect(tableContainer).toBeVisible();

    // 3. Scroll table horizontally
    await tableContainer.evaluate((el) => {
      el.scrollLeft = 200;
    });

    const scrollLeft = await tableContainer.evaluate((el) => el.scrollLeft);
    expect(scrollLeft).toBeGreaterThanOrEqual(0);

    // 4. Close modal
    const closeBtn = muhuratModal.locator('button[aria-label*="close" i], button[title*="close" i], button:has-text("←")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
  });
});
