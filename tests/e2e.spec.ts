import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Entra ID Branding Generator E2E', () => {
  const TARGET_URL = process.env.TEST_URL || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  });

  test('Page loads and has title', async ({ page }) => {
    await page.goto(TARGET_URL);
    // Check for the header text in the Sidebar
    await expect(page.locator('text=Entra Branding')).toBeVisible({ timeout: 15000 });
  });

  test('Project creation and persistence', async ({ page }) => {
    await page.goto(TARGET_URL);
    
    // Wait for sidebar
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible({ timeout: 15000 });
    
    // Create new project
    await page.click('button:has-text("New Project")');
    // Wait for URL update
    await page.waitForURL(/\?project=/, { timeout: 15000 });
    
    // The project name is an input field
    await expect(page.locator('input[value*="Project"]')).toBeVisible();
  });

  test('Logo upload and generation', async ({ page }) => {
    await page.goto(TARGET_URL);
    
    // Ensure we are on a project
    await page.waitForURL(/\?project=/, { timeout: 15000 });

    // Upload a test logo
    const filePath = path.resolve('public/window.svg');
    await page.setInputFiles('input[type="file"]', filePath);
    
    // Click Generate
    await page.click('button:has-text("Generate Branding Bundle")');
    
    // Check if assets are generated
    await expect(page.locator('text=Generated Assets')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=Pre-Flight Validation')).toBeVisible();
  });

  test('Theme switcher and mockup', async ({ page }) => {
    await page.goto(TARGET_URL);
    await page.waitForURL(/\?project=/, { timeout: 15000 });
    
    // Upload and Generate
    const filePath = path.resolve('public/window.svg');
    await page.setInputFiles('input[type="file"]', filePath);
    await page.click('button:has-text("Generate Branding Bundle")');
    
    // Wait for mockup (it has aspect-video class)
    const mockup = page.locator('.aspect-video');
    await expect(mockup).toBeVisible({ timeout: 30000 });
    
    // Toggle theme
    await page.click('button[aria-label="Toggle Theme"]');
    
    // Verify mockup is still visible
    await expect(mockup).toBeVisible();
  });

  test('Manual Color Override', async ({ page }) => {
    await page.goto(TARGET_URL);
    await page.waitForURL(/\?project=/, { timeout: 15000 });
    
    // Switch to Advanced tab
    await page.click('button:has-text("Advanced")');
    
    // Toggle manual mode
    await page.click('label:has-text("Manual Color Override")');
    
    // Change primary color
    const colorPicker = page.locator('input[type="color"]').first();
    await colorPicker.fill('#FF0000');
    
    // Check if the hex value is displayed
    await expect(page.locator('text=#FF0000')).toBeVisible();
  });
});
