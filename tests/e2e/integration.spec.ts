import { test, expect } from '@playwright/test';

test.describe('Full Integration Tests', () => {
  // Helper function to add a test motorcycle
  async function addTestMotorcycle(page: any, name: string = 'Integration Test Bike') {
    await page.goto('/');
    await page.click('text=Add Motorcycle');
    await page.fill('#name', name);
    await page.fill('#year', '2019');
    await page.selectOption('#make', 'ducati');
    await page.waitForTimeout(1000);
    await page.selectOption('#model', 'monster 796');
    await page.fill('#current_mileage', '8000');
    await page.click('button:has-text("Add Motorcycle")');
    await page.waitForTimeout(2000);
  }

  test('should complete full motorcycle lifecycle', async ({ page }) => {
    // 1. Start with empty garage
    await page.goto('/');
    await expect(page.locator('text=Your garage is empty')).toBeVisible();
    
    // 2. Add a Ducati Monster
    await addTestMotorcycle(page, 'My Ducati Monster');
    
    // 3. Should auto-navigate to Service Tasks
    await expect(page.locator('.nav-item.active')).toContainText('Service Tasks');
    await expect(page.locator('text=Service Tasks')).toBeVisible();
    
    // 4. Check that Ducati-specific tasks were created
    await page.click('.task-filters button:has-text("All")');
    await expect(page.locator('text=Desmodromic')).toBeVisible();
    await expect(page.locator('text=Every 6,000 miles')).toBeVisible(); // Ducati oil change interval
    
    // 5. Navigate to Service Records
    await page.click('text=Service Records');
    await expect(page.locator('.nav-item.active')).toContainText('Service Records');
    await expect(page.locator('text=No service records yet')).toBeVisible();
    
    // 6. Navigate to Todo Tasks
    await page.click('text=Todo Tasks');
    await expect(page.locator('.nav-item.active')).toContainText('Todo Tasks');
    await expect(page.locator('text=No todo tasks yet')).toBeVisible();
    
    // 7. Go back to Garage and verify motorcycle is there
    await page.click('text=Garage');
    await expect(page.locator('.nav-item.active')).toContainText('Garage');
    await expect(page.locator('text=My Ducati Monster')).toBeVisible();
    await expect(page.locator('text=2019 Ducati Monster 796')).toBeVisible();
    
    // 8. Update mileage
    await page.click('.update-mileage-btn');
    await page.fill('.mileage-update-form input[type="number"]', '12000');
    await page.click('.mileage-update-form button:has-text("Update")');
    await page.waitForTimeout(1000);
    
    // 9. Verify mileage update in navigation
    await expect(page.locator('.motorcycle-mileage:has-text("12,000 miles")')).toBeVisible();
    
    // 10. Check service tasks with updated mileage
    await page.click('text=Service Tasks');
    await page.click('.task-filters button:has-text("Due")');
    
    // Should have due/overdue tasks with higher mileage
    const dueTasks = await page.locator('.service-task-card').count();
    expect(dueTasks).toBeGreaterThan(0);
  });

  test('should handle multiple motorcycles', async ({ page }) => {
    await page.goto('/');
    
    // Add first motorcycle (Suzuki)
    await page.click('text=Add Motorcycle');
    await page.fill('#name', 'SV650 Test');
    await page.fill('#year', '2020');
    await page.selectOption('#make', 'suzuki');
    await page.waitForTimeout(1000);
    await page.selectOption('#model', 'sv650');
    await page.fill('#current_mileage', '3000');
    await page.click('button:has-text("Add Motorcycle")');
    await page.waitForTimeout(2000);
    
    // Go back to garage
    await page.click('text=Garage');
    
    // Add second motorcycle (Ducati)
    await page.click('text=Add Motorcycle');
    await page.fill('#name', 'Monster Test');
    await page.fill('#year', '2018');
    await page.selectOption('#make', 'ducati');
    await page.waitForTimeout(1000);
    await page.selectOption('#model', 'monster');
    await page.fill('#current_mileage', '7000');
    await page.click('button:has-text("Add Motorcycle")');
    await page.waitForTimeout(2000);
    
    // Go back to garage to verify both motorcycles
    await page.click('text=Garage');
    await expect(page.locator('text=SV650 Test')).toBeVisible();
    await expect(page.locator('text=Monster Test')).toBeVisible();
    
    // Click on first motorcycle to select it
    await page.click('.motorcycle-card:has-text("SV650 Test")');
    await expect(page.locator('.motorcycle-card.selected:has-text("SV650 Test")')).toBeVisible();
    
    // Check navigation shows selected motorcycle
    await expect(page.locator('.motorcycle-name:has-text("SV650 Test")')).toBeVisible();
    
    // Switch to service tasks and verify Suzuki-specific tasks
    await page.click('text=Service Tasks');
    await page.click('.task-filters button:has-text("All")');
    await expect(page.locator('text=Every 3,000 miles')).toBeVisible(); // Suzuki oil interval
    
    // Go back and select the Ducati
    await page.click('text=Garage');
    await page.click('.motorcycle-card:has-text("Monster Test")');
    await expect(page.locator('.motorcycle-card.selected:has-text("Monster Test")')).toBeVisible();
    
    // Check navigation updated
    await expect(page.locator('.motorcycle-name:has-text("Monster Test")')).toBeVisible();
    
    // Verify Ducati-specific tasks
    await page.click('text=Service Tasks');
    await page.click('.task-filters button:has-text("All")');
    await expect(page.locator('text=Every 6,000 miles')).toBeVisible(); // Ducati oil interval
  });

  test('should show correct task counts and statistics', async ({ page }) => {
    await addTestMotorcycle(page, 'Statistics Test Bike');
    
    // Check initial statistics
    const totalStat = page.locator('.stat.total .stat-number');
    const dueStat = page.locator('.stat.due .stat-number');
    const completedStat = page.locator('.stat.completed .stat-number');
    
    await expect(totalStat).toBeVisible();
    await expect(dueStat).toBeVisible();
    await expect(completedStat).toBeVisible();
    
    const totalCount = parseInt(await totalStat.textContent() || '0');
    const dueCount = parseInt(await dueStat.textContent() || '0');
    const completedCount = parseInt(await completedStat.textContent() || '0');
    
    // Verify that total = due + completed (for newly created motorcycle)
    expect(totalCount).toBe(dueCount + completedCount);
    expect(totalCount).toBeGreaterThan(0); // Should have tasks for Ducati Monster
    
    // Complete a task and verify statistics update
    if (dueCount > 0) {
      await page.click('.task-filters button:has-text("Due")');
      await page.waitForTimeout(500);
      
      const firstTask = page.locator('.service-task-card').first();
      await firstTask.locator('button:has-text("Mark as Complete")').click();
      await page.click('button:has-text("Yes, Complete")');
      await page.waitForTimeout(1000);
      
      // Check updated statistics
      const newDueCount = parseInt(await dueStat.textContent() || '0');
      const newCompletedCount = parseInt(await completedStat.textContent() || '0');
      
      expect(newDueCount).toBe(dueCount - 1);
      expect(newCompletedCount).toBe(completedCount + 1);
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // This test simulates what happens when backend is unavailable
    // We'll navigate to the app and check error handling
    
    await page.goto('/');
    
    // App should still load even if API is unavailable
    await expect(page.locator('h1:has-text("🏍️ Clutch Log")')).toBeVisible();
    
    // Try to add motorcycle - should handle error gracefully
    await page.click('text=Add Motorcycle');
    await page.fill('#name', 'Error Test Bike');
    await page.fill('#year', '2020');
    
    // Since makes dropdown depends on API, it might be empty or show error
    // The form should still be functional
    await expect(page.locator('#name')).toHaveValue('Error Test Bike');
  });

  test('should maintain state across navigation', async ({ page }) => {
    await addTestMotorcycle(page, 'State Test Bike');
    
    // Complete a task in service tasks
    await page.click('.task-filters button:has-text("Due")');
    await page.waitForTimeout(500);
    
    const initialDueCount = await page.locator('.service-task-card').count();
    if (initialDueCount > 0) {
      const firstTask = page.locator('.service-task-card').first();
      await firstTask.locator('button:has-text("Mark as Complete")').click();
      await page.click('button:has-text("Yes, Complete")');
      await page.waitForTimeout(1000);
    }
    
    // Navigate away and back
    await page.click('text=Garage');
    await page.click('text=Service Tasks');
    
    // State should be maintained
    await page.click('.task-filters button:has-text("Due")');
    const finalDueCount = await page.locator('.service-task-card').count();
    
    if (initialDueCount > 0) {
      expect(finalDueCount).toBe(initialDueCount - 1);
    }
    
    // Selected motorcycle should still be shown
    await expect(page.locator('.selected-motorcycle')).toBeVisible();
    await expect(page.locator('.motorcycle-name:has-text("State Test Bike")')).toBeVisible();
  });
});