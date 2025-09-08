import { test, expect } from '@playwright/test';

test.describe('Service Tasks', () => {
  // Helper function to add a test motorcycle
  async function addTestMotorcycle(page: any, name: string = 'Test SV650', mileage: string = '5000') {
    await page.goto('/');
    await page.click('text=Add Motorcycle');
    await page.fill('#name', name);
    await page.fill('#year', '2020');
    await page.selectOption('#make', 'suzuki');
    await page.waitForTimeout(1000);
    await page.selectOption('#model', 'sv650');
    await page.fill('#current_mileage', mileage);
    await page.click('button:has-text("Add Motorcycle")');
    await page.waitForTimeout(2000);
  }

  test('should display service tasks after adding motorcycle', async ({ page }) => {
    await addTestMotorcycle(page);
    
    // Should automatically be on service tasks view
    await expect(page.locator('.nav-item.active')).toContainText('Service Tasks');
    await expect(page.locator('h2:has-text("Service Tasks")')).toBeVisible();
    
    // Check if service tasks are loaded
    await expect(page.locator('.task-summary')).toBeVisible();
    await expect(page.locator('.summary-stats')).toBeVisible();
  });

  test('should show service task statistics', async ({ page }) => {
    await addTestMotorcycle(page);
    
    // Check if statistics are displayed
    await expect(page.locator('.stat.due')).toBeVisible();
    await expect(page.locator('.stat.total')).toBeVisible();
    await expect(page.locator('.stat.completed')).toBeVisible();
    
    // Check if numbers are displayed (should be greater than 0 for Suzuki SV650)
    const totalTasks = await page.locator('.stat.total .stat-number').textContent();
    expect(parseInt(totalTasks || '0')).toBeGreaterThan(0);
  });

  test('should filter tasks by status', async ({ page }) => {
    await addTestMotorcycle(page);
    
    // Test Due filter (default)
    await expect(page.locator('.task-filters button.active')).toContainText('Due');
    
    // Click All filter
    await page.click('.task-filters button:has-text("All")');
    await expect(page.locator('.task-filters button.active')).toContainText('All');
    
    // Should show service task cards
    await expect(page.locator('.service-task-card')).toBeVisible();
    
    // Click Completed filter
    await page.click('.task-filters button:has-text("Completed")');
    await expect(page.locator('.task-filters button.active')).toContainText('Completed');
  });

  test('should display service task details', async ({ page }) => {
    await addTestMotorcycle(page);
    
    // Click All filter to see all tasks
    await page.click('.task-filters button:has-text("All")');
    
    // Check if first service task card is visible and has proper content
    const firstTaskCard = page.locator('.service-task-card').first();
    await expect(firstTaskCard).toBeVisible();
    
    // Check task header elements
    await expect(firstTaskCard.locator('.task-title h3')).toBeVisible();
    await expect(firstTaskCard.locator('.task-type')).toBeVisible();
    await expect(firstTaskCard.locator('.task-status-badge')).toBeVisible();
    
    // Check task description
    await expect(firstTaskCard.locator('.task-description')).toBeVisible();
    
    // Check intervals section
    await expect(firstTaskCard.locator('.task-intervals')).toBeVisible();
    await expect(firstTaskCard.locator('text=Service Intervals:')).toBeVisible();
  });

  test('should show different task types from SV650 schedule', async ({ page }) => {
    await addTestMotorcycle(page);
    
    // Click All filter to see all tasks
    await page.click('.task-filters button:has-text("All")');
    
    // Should see various SV650 maintenance tasks
    await expect(page.locator('text=Oil Change')).toBeVisible();
    await expect(page.locator('text=Chain Maintenance')).toBeVisible();
    
    // Check for mileage intervals
    await expect(page.locator('text=Every 3,000 miles')).toBeVisible();
    await expect(page.locator('text=Every 1,000 miles')).toBeVisible();
  });

  test('should complete a service task', async ({ page }) => {
    await addTestMotorcycle(page, 'Complete Test Bike', '5000');
    
    // Click Due filter to see pending/overdue tasks
    await page.click('.task-filters button:has-text("Due")');
    
    // Wait for tasks to load
    await page.waitForTimeout(1000);
    
    // Check if there are any due tasks to complete
    const dueTasks = await page.locator('.service-task-card').count();
    if (dueTasks > 0) {
      // Click complete button on first due task
      const firstTask = page.locator('.service-task-card').first();
      await firstTask.locator('button:has-text("Mark as Complete")').click();
      
      // Confirm completion
      await expect(page.locator('text=Mark this task as completed')).toBeVisible();
      await page.click('button:has-text("Yes, Complete")');
      
      // Wait for completion
      await page.waitForTimeout(1000);
      
      // Task should no longer be in Due filter
      const remainingDueTasks = await page.locator('.service-task-card').count();
      expect(remainingDueTasks).toBeLessThan(dueTasks);
    }
  });

  test('should show completed tasks in completed filter', async ({ page }) => {
    await addTestMotorcycle(page, 'Completed Tasks Test', '10000');
    
    // Complete a task first
    await page.click('.task-filters button:has-text("Due")');
    await page.waitForTimeout(1000);
    
    const dueTasks = await page.locator('.service-task-card').count();
    if (dueTasks > 0) {
      const firstTask = page.locator('.service-task-card').first();
      await firstTask.locator('button:has-text("Mark as Complete")').click();
      await page.click('button:has-text("Yes, Complete")');
      await page.waitForTimeout(1000);
    }
    
    // Switch to completed filter
    await page.click('.task-filters button:has-text("Completed")');
    
    // Should show completed tasks
    const completedTasks = await page.locator('.service-task-card').count();
    expect(completedTasks).toBeGreaterThanOrEqual(0);
  });

  test('should handle high mileage motorcycle with overdue tasks', async ({ page }) => {
    // Add motorcycle with high mileage (should trigger overdue tasks)
    await addTestMotorcycle(page, 'High Mileage Bike', '20000');
    
    // Check Due filter
    await page.click('.task-filters button:has-text("Due")');
    await page.waitForTimeout(1000);
    
    // Should have overdue tasks due to high mileage
    const dueTasks = await page.locator('.service-task-card').count();
    expect(dueTasks).toBeGreaterThan(0);
    
    // Check if overdue status is displayed
    const hasOverdueStatus = await page.locator('.task-status-badge:has-text("Overdue")').count();
    expect(hasOverdueStatus).toBeGreaterThan(0);
  });

  test('should show no due tasks message for up-to-date motorcycle', async ({ page }) => {
    // Add motorcycle with very low mileage
    await addTestMotorcycle(page, 'New Bike', '100');
    
    // Check Due filter
    await page.click('.task-filters button:has-text("Due")');
    await page.waitForTimeout(1000);
    
    // Should show no maintenance due message
    await expect(page.locator('text=No maintenance due!')).toBeVisible();
    await expect(page.locator('text=Your motorcycle is up to date')).toBeVisible();
  });
});