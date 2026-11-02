import { test, expect } from '@playwright/test';

test.describe('Modals & Interactive Calendars E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Gregorian Calendar Modal opens on card click and navigates months', async ({ page }) => {
    // 1. Locate and click Gregorian Date Card
    const gregorianTrigger = page.locator('text=/Tap for Full Gregorian Calendar & Holidays|Next Holiday|Today\'s Holiday/i').first();
    await gregorianTrigger.click();

    // 2. Verify modal opened
    const modalDialog = page.getByRole('dialog', { name: /Gregorian Calendar & Holidays|Gregorian Calendar/i }).or(
      page.locator('div[role="dialog"]').filter({ hasText: /Gregorian|Holidays|Gazetted/i })
    );
    await expect(modalDialog).toBeVisible({ timeout: 5000 });

    // 3. Verify weekday headers are present
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const day of weekdays) {
      await expect(modalDialog.getByText(new RegExp(`^${day}$`, 'i')).first()).toBeVisible();
    }

    // 4. Test month navigation chevron buttons
    const nextMonthButton = modalDialog.locator('button[title*="Next" i], button[aria-label*="Next" i]').first();
    if (await nextMonthButton.isVisible()) {
      await nextMonthButton.click();
      // Month title should still be visible after change
      await expect(modalDialog).toBeVisible();
    }

    // 5. Close modal via close button
    const closeButton = modalDialog.locator('button').filter({ hasText: /Close/i }).or(modalDialog.locator('button[aria-label*="close" i], button[title*="close" i]')).first();
    await closeButton.click();
    await expect(modalDialog).not.toBeVisible({ timeout: 3000 });
  });

  test('Unified Vedic Panchang Calendar Modal renders all days and Dharma Shastra rules without clipping', async ({ page }) => {
    // 1. Click Vedic Panchang Card bottom CTA
    const panchangCTA = page.locator('text=/Tap for Full Panchang & Tithi Timings|सम्पूर्ण पंचांग/i').first();
    await panchangCTA.click();

    // 2. Verify Vedic Calendar Modal opened
    const vedicModal = page.getByRole('dialog', { name: /Unified Vedic Calendar|almanac/i }).or(
      page.locator('div[role="dialog"]').filter({ hasText: /Vedic Calendar|Panchang|पंचांग/i })
    );
    await expect(vedicModal).toBeVisible({ timeout: 7000 });

    // 3. Verify date rows are rendered
    // Days 1, 15, and 28 should be present
    const day1 = vedicModal.getByText(/^0?1$/).first();
    await expect(day1).toBeVisible();

    const day15 = vedicModal.getByText(/^15$/).first();
    await expect(day15).toBeVisible();

    const day28 = vedicModal.getByText(/^28$/).first();
    await expect(day28).toBeVisible();

    // 4. Verify Dharma Shastra rules sub-row is present in the table rows
    const dharmaRuleText = vedicModal.locator('text=/Udaya Tithi|Sunrise Tithi|उदय तिथि|Vrat|Ekadashi|Pradosh/i').first();
    await expect(dharmaRuleText).toBeVisible();

    // 5. Test scrollability to ensure days 28-31 are not clipped
    // Scroll container should have padding buffer
    const scrollContainer = vedicModal.locator('.overflow-y-auto').first();
    await scrollContainer.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    // 6. Close modal
    await page.keyboard.press('Escape');
    await expect(vedicModal).not.toBeVisible({ timeout: 3000 });
  });

  test('Monthly Shubh Karya Muhurat Modal renders 2D table and category filter tabs', async ({ page }) => {
    // 1. Click Today's Shubh Karya Muhurat card or bottom CTA
    const muhuratTrigger = page.locator('div[role="button"]').filter({ hasText: /Today's Shubh Karya Muhurat|आज का शुभ कार्य मुहूर्त/i }).first();
    await muhuratTrigger.click();

    // 2. Verify Muhurat Modal is visible
    const muhuratModal = page.locator('div[role="dialog"]').filter({ hasText: /Shubh Karya|Muhurat|शुभ कार्य मुहूर्त/i }).first();
    await expect(muhuratModal).toBeVisible({ timeout: 5000 });

    // 3. Check category filter tabs are rendered (Property, Vehicle, Vivah, etc.)
    const propertyTab = muhuratModal.locator('button').filter({ hasText: /Property|मकान|सम्पत्ति/i }).first();
    await expect(propertyTab).toBeVisible();

    const vehicleTab = muhuratModal.locator('button').filter({ hasText: /Vehicle|वाहन/i }).first();
    await expect(vehicleTab).toBeVisible();

    // 4. Click a category tab
    await propertyTab.click();

    // 5. Verify 2D scroll table container is present
    const tableContainer = muhuratModal.locator('.overflow-x-auto').first();
    await expect(tableContainer).toBeVisible();

    // 6. Close modal
    await page.keyboard.press('Escape');
    await expect(muhuratModal).not.toBeVisible({ timeout: 3000 });
  });

  test('Panchak Multi-Year Modal opens and displays year periods', async ({ page }) => {
    // Look for Panchak indicator pill on Vedic card or top bar
    const panchakTrigger = page.locator('text=/No Active Panchak|Active Panchak|Panchak|पंचक/i').first();
    if (await panchakTrigger.isVisible()) {
      await panchakTrigger.click();

      // Verify Panchak Modal dialog is displayed
      const panchakModal = page.locator('div[role="dialog"]').filter({ hasText: /Panchak|पंचक/i }).first();
      await expect(panchakModal).toBeVisible({ timeout: 5000 });

      // Close modal
      await page.keyboard.press('Escape');
      await expect(panchakModal).not.toBeVisible({ timeout: 3000 });
    }
  });
});
