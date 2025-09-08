import { test, expect } from '@playwright/test';

test.describe('Garage Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show add motorcycle form when button is clicked', async ({ page }) => {
    // Click the Add Motorcycle button
    await page.click('text=Add Motorcycle');
    
    // Check if the form is visible
    await expect(page.locator('.add-motorcycle-form')).toBeVisible();
    await expect(page.locator('h3:has-text("Add New Motorcycle")')).toBeVisible();
    
    // Check if form fields are present
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#year')).toBeVisible();
    await expect(page.locator('#make')).toBeVisible();
    await expect(page.locator('#model')).toBeVisible();
    await expect(page.locator('#current_mileage')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Click the Add Motorcycle button
    await page.click('text=Add Motorcycle');
    
    // Try to submit form without filling required fields
    await page.click('button:has-text("Add Motorcycle")');
    
    // Check if HTML5 validation prevents submission
    const nameField = page.locator('#name');
    const isInvalid = await nameField.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should populate models when make is selected', async ({ page }) => {
    // Click the Add Motorcycle button
    await page.click('text=Add Motorcycle');
    
    // Select Suzuki as make
    await page.selectOption('#make', 'suzuki');
    
    // Wait for models to be populated
    await page.waitForTimeout(1000);
    
    // Check if model dropdown has options
    const modelOptions = await page.locator('#model option').count();
    expect(modelOptions).toBeGreaterThan(1); // Should have at least the default option plus model options
    
    // Check if SV650 is in the options
    await expect(page.locator('#model option:has-text("sv650")')).toBeVisible();
  });

  test('should create motorcycle with service schedule', async ({ page }) => {
    // Click the Add Motorcycle button
    await page.click('text=Add Motorcycle');
    
    // Fill out the form
    await page.fill('#name', 'My Test SV650');
    await page.fill('#year', '2020');
    await page.selectOption('#make', 'suzuki');
    
    // Wait for models to load
    await page.waitForTimeout(1000);
    await page.selectOption('#model', 'sv650');
    
    await page.fill('#current_mileage', '5000');
    await page.fill('#vin', 'JS1GR7JA0L2100001');
    
    // Ensure service schedule checkbox is checked
    const checkbox = page.locator('input[type="checkbox"]');
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
    
    // Submit the form
    await page.click('button:has-text("Add Motorcycle")');
    
    // Wait for the motorcycle to be created and page to update
    await page.waitForTimeout(2000);
    
    // Check if motorcycle card is visible
    await expect(page.locator('.motorcycle-card')).toBeVisible();
    await expect(page.locator('text=My Test SV650')).toBeVisible();
    await expect(page.locator('text=2020 Suzuki Sv650')).toBeVisible();
    
    // Check if the motorcycle is automatically selected
    await expect(page.locator('.motorcycle-card.selected')).toBeVisible();
    
    // Check if navigation shows the selected motorcycle
    await expect(page.locator('.selected-motorcycle')).toBeVisible();
    await expect(page.locator('.motorcycle-name:has-text("My Test SV650")')).toBeVisible();
  });

  test('should switch to service tasks after adding motorcycle', async ({ page }) => {
    // Add a motorcycle (reusing previous test logic)
    await page.click('text=Add Motorcycle');
    await page.fill('#name', 'Test Bike');
    await page.fill('#year', '2020');
    await page.selectOption('#make', 'suzuki');
    await page.waitForTimeout(1000);
    await page.selectOption('#model', 'sv650');
    await page.fill('#current_mileage', '1000');
    
    await page.click('button:has-text("Add Motorcycle")');
    
    // Wait for navigation to service tasks
    await page.waitForTimeout(2000);
    
    // Check if we're now on the service tasks view
    await expect(page.locator('.nav-item.active')).toContainText('Service Tasks');
    await expect(page.locator('h2:has-text("Service Tasks")')).toBeVisible();
  });

  test('should allow mileage updates', async ({ page }) => {
    // First add a motorcycle
    await page.click('text=Add Motorcycle');
    await page.fill('#name', 'Mileage Test Bike');
    await page.fill('#year', '2020');
    await page.selectOption('#make', 'suzuki');
    await page.waitForTimeout(1000);
    await page.selectOption('#model', 'sv650');
    await page.fill('#current_mileage', '1000');
    await page.click('button:has-text("Add Motorcycle")');
    
    // Wait for motorcycle to be created and go back to garage
    await page.waitForTimeout(2000);
    await page.click('text=Garage');
    
    // Click the Update button on the motorcycle card
    await page.click('.update-mileage-btn');
    
    // Check if mileage update form is visible
    await expect(page.locator('.mileage-update-form')).toBeVisible();
    
    // Update mileage
    await page.fill('.mileage-update-form input[type="number"]', '2000');
    await page.click('.mileage-update-form button:has-text("Update")');
    
    // Wait for update to complete
    await page.waitForTimeout(1000);
    
    // Check if mileage is updated
    await expect(page.locator('text=2,000 miles')).toBeVisible();
  });
});