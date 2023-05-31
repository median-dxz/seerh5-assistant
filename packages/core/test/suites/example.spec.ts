import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    const core = await page.evaluate(() => {
        return window.SACore.CoreLoader();
    });

    expect(core).toBe(true);
});

test('get started link', async ({ page }) => {
    await page.goto('https://playwright.dev/');

    // Click the get started link.
    await page.getByRole('link', { name: 'Get started' }).click();

    // Expects the URL to contain intro.
    await expect(page).toHaveURL(/.*intro/);
});