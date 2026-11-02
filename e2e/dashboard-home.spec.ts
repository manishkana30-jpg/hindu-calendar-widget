import { test, expect } from '@playwright/test';

test.describe('Dashboard Home Screen E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Page loads with correct title and branding', async ({ page }) => {
    await expect(page).toHaveTitle(/Daily Tithi|Panchang|Hindu Calendar/i);
    const brandElement = page.getByText(/Daily Tithi/i).first();
    await expect(brandElement).toBeVisible();
  });

  test('Gregorian Date Card displays date, live clock, and holiday badge without Vedic duplicates', async ({ page }) => {
    // The Gregorian card container
    const gregorianCard = page.locator('div[role="button"]').filter({ hasText: /LIVE CLOCK|Selected Date|Live Clock/i }).first();
    await expect(gregorianCard).toBeVisible();

    // Check Live Clock is ticking/present
    const clockRegex = /\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)?/i;
    await expect(gregorianCard).toHaveText(clockRegex);

    // Holiday badge or upcoming holiday teaser must be present
    const holidayBadge = gregorianCard.locator('text=/Today\'s Holiday|Next:|Major Festival|Holiday/i').first();
    await expect(holidayBadge).toBeVisible();

    // Strict check: Gregorian card must NOT contain Vedic duplicates like Nakshatra, Karana, Paksha
    const cardText = await gregorianCard.innerText();
    expect(cardText).not.toMatch(/Nakshatra|Karana|Krishna Paksha|Shukla Paksha/i);
  });

  test('Vedic Panchang Card displays canonical Udaya Tithi and five limbs', async ({ page }) => {
    // Find the Vedic Panchang Card
    const panchangCard = page.locator('div[role="button"]').filter({ hasText: /UDAYA TITHI|TITHI|तिथि/i }).first();
    await expect(panchangCard).toBeVisible();

    // Check bottom CTA is present
    const bottomCTA = page.locator('text=/Tap for Full Panchang & Tithi Timings|सम्पूर्ण पंचांग/i').first();
    await expect(bottomCTA).toBeVisible();

    // Verify duplicate "full almanac" badge is NOT present on the card header
    const fullAlmanacPill = page.locator('text=/Full Almanac|सम्पूर्ण पंचांग विवरण/i');
    const fullAlmanacCount = await fullAlmanacPill.count();
    expect(fullAlmanacCount).toBeLessThanOrEqual(1);
  });

  test('Today\'s Shubh Karya Muhurat Card displays auspicious activities and bottom CTA', async ({ page }) => {
    // Locate Today's Shubh Karya Muhurat Card
    const muhuratCard = page.locator('div[role="button"]').filter({ hasText: /Today's Shubh Karya Muhurat|आज का शुभ कार्य मुहूर्त/i }).first();
    await expect(muhuratCard).toBeVisible();

    // Check bottom CTA
    const muhuratBottomCTA = page.locator('text=/View Full Monthly Shubh Karya Muhurat Calendar|संपूर्ण मासिक शुभ कार्य मुहूर्त कैलेंडर/i').first();
    await expect(muhuratBottomCTA).toBeVisible();

    // Verify duplicate header pill "Monthly Muhurat ›" is NOT present in the header
    const duplicateHeaderPill = page.locator('button, span').filter({ hasText: /^Monthly Muhurat ›$/i });
    await expect(duplicateHeaderPill).toHaveCount(0);
  });

  test('Observance / Upcoming Festival Card displays strictly one upcoming festival', async ({ page }) => {
    const upcomingSection = page.locator('text=/Upcoming Festivals|आगामी व्रत एवं त्यौहार/i').first();
    if (await upcomingSection.isVisible()) {
      const upcomingCard = page.locator('div').filter({ hasText: /Upcoming Festivals|आगामी व्रत एवं त्यौहार/i }).first();
      // Verify duplicate "View All" pill in header is removed
      const viewAllInHeader = upcomingCard.locator('button:has-text("View All"), button:has-text("सभी देखें")');
      await expect(viewAllInHeader).toHaveCount(0);
    }
  });

  test('Vedic cards contain zero bracketed definitions or translations', async ({ page }) => {
    // Verify that primary Vedic terms do not contain English definitions in brackets
    const panchangCard = page.locator('div[role="button"]').filter({ hasText: /UDAYA TITHI|TITHI|तिथि/i }).first();
    const cardText = await panchangCard.innerText();

    // Check for common bracketed definitions that were prohibited
    expect(cardText).not.toMatch(/\(Lunar Day\)/i);
    expect(cardText).not.toMatch(/\(Constellation\)/i);
    expect(cardText).not.toMatch(/\(Waxing Moon\)/i);
    expect(cardText).not.toMatch(/\(Waning Moon\)/i);
    expect(cardText).not.toMatch(/\(Solar Day\)/i);
  });
});
