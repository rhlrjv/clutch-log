import { test, expect } from '@playwright/test';

test('debug empty garage', async ({ page }) => {
  await page.goto('/');
  
  // Wait for React to load
  await expect(page.locator('h1')).toContainText('🏍️ Clutch Log');
  
  // Wait a bit more for the app to fully render
  await page.waitForTimeout(3000);
  
  // Take a screenshot
  await page.screenshot({ path: 'empty-garage-debug.png' });
  
  // Check what main app elements exist
  const appDiv = await page.locator('#root').count();
  console.log('App root divs found:', appDiv);
  
  const appMain = await page.locator('.app-main').count();
  console.log('App main sections found:', appMain);
  
  const garageSection = await page.locator('.garage').count();
  console.log('Garage sections found:', garageSection);
  
  const motorcyclesGrid = await page.locator('.motorcycles-grid').count();
  console.log('Motorcycles grid found:', motorcyclesGrid);
  
  const emptyGarage = await page.locator('.empty-garage').count();
  console.log('Empty garage elements found:', emptyGarage);
  
  const allEmptyMessages = await page.locator('text=Your garage is empty').count();
  console.log('Empty garage messages found:', allEmptyMessages);
  
  // Check loading states
  const loadingStates = await page.locator('.app-loading').count();
  console.log('App loading states found:', loadingStates);
  
  // Check error states
  const errorStates = await page.locator('.error-banner').count();
  console.log('Error banners found:', errorStates);
  
  // Check if motorcycles array is empty but garage component is loaded
  const garageHeader = await page.locator('.garage-header').count();
  console.log('Garage headers found:', garageHeader);
  
  // Log current URL
  console.log('Current URL:', page.url());
  
  // Check network errors and API response
  const response = await page.request.get('/api/motorcycles');
  console.log('Motorcycle API status:', response.status());
  const responseText = await response.text();
  console.log('Response text first 200 chars:', responseText.substring(0, 200));
  
  // Try backend directly
  const backendResponse = await page.request.get('http://localhost:8000/api/motorcycles');
  console.log('Backend API status:', backendResponse.status());
  try {
    const motorcycles = await backendResponse.json();
    console.log('Motorcycles from backend:', motorcycles);
  } catch (e) {
    const backendText = await backendResponse.text();
    console.log('Backend response text:', backendText.substring(0, 200));
  }
});