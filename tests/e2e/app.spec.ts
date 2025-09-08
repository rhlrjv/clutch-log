import { test, expect } from '@playwright/test';

test.describe('Clutch Log App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    // Check if the page loads with correct title and header
    await expect(page).toHaveTitle('🏍️ Clutch Log');
    await expect(page.locator('h1')).toContainText('🏍️ Clutch Log');
    await expect(page.locator('text=Motorcycle Maintenance Tracker')).toBeVisible();
  });

  test('should show garage view by default', async ({ page }) => {
    // Check if garage view is active by default
    await expect(page.locator('.nav-item.active')).toContainText('Garage');
    await expect(page.locator('h2')).toContainText('My Garage');
  });

  test('should show motorcycle in garage when data exists', async ({ page }) => {
    // Check if existing motorcycle is displayed
    await expect(page.locator('.motorcycle-card')).toBeVisible();
    await expect(page.locator('.motorcycle-card h3:has-text("Bucey")')).toBeVisible();
  });

  test('should navigate between different sections', async ({ page }) => {
    // Test navigation to different sections with selected motorcycle
    await page.click('text=Service Tasks');
    await expect(page.locator('.nav-item.active')).toContainText('Service Tasks');
    await expect(page.locator('h2:has-text("Service Tasks")')).toBeVisible();

    await page.click('text=Service Records');
    await expect(page.locator('.nav-item.active')).toContainText('Service Records');
    await expect(page.locator('h2:has-text("Service Records")')).toBeVisible();

    await page.click('text=Todo Tasks');
    await expect(page.locator('.nav-item.active')).toContainText('Todo Tasks');
    await expect(page.locator('h2:has-text("Todo Tasks")')).toBeVisible();

    // Navigate back to garage
    await page.click('text=Garage');
    await expect(page.locator('.nav-item.active')).toContainText('Garage');
  });
});