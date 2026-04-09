# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Entra ID Branding Generator E2E >> Logo fetch from URL
- Location: tests/e2e.spec.ts:72:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=white.png')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('text=white.png')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - complementary [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - img [ref=e5]
        - heading "Entra Branding" [level=2] [ref=e7]
      - button "New Project" [ref=e8]:
        - img [ref=e9]
        - text: New Project
    - generic [ref=e10]:
      - generic [ref=e11]:
        - img [ref=e12]
        - textbox "Search projects..." [ref=e15]
      - generic [ref=e16]:
        - heading "Projects" [level=3] [ref=e17]
        - generic [ref=e18] [cursor=pointer]:
          - generic [ref=e19]:
            - img [ref=e20]
            - generic [ref=e22]: Default Project
          - button [ref=e23]:
            - img [ref=e24]
    - generic [ref=e27]:
      - button "System Settings" [ref=e28]:
        - img [ref=e29]
        - text: System Settings
      - generic [ref=e32]: Local Storage Ready
  - main [ref=e36]:
    - generic [ref=e37]:
      - generic [ref=e38]:
        - textbox [ref=e39]: Default Project
        - generic [ref=e41]: Project synced locally
      - button "Toggle Theme" [ref=e42]:
        - img [ref=e43]
    - generic [ref=e45]:
      - button "Entra ID" [ref=e46]
      - button "sharepoint" [ref=e47]
      - button "teams" [ref=e48]
    - generic [ref=e50]:
      - generic [ref=e52] [cursor=pointer]:
        - paragraph [ref=e53]: Drag & drop your logo here or click to browse
        - text: Supports PNG, JPG (SVG recommended)
      - generic [ref=e54]:
        - textbox "https://example.com/logo.png" [ref=e55]: https://mirror.ivoozz.nl/white.png
        - button "Fetch" [active] [ref=e56]
      - generic [ref=e57]:
        - button "Basic" [ref=e58]
        - button "Advanced" [ref=e59]
      - generic [ref=e61]:
        - paragraph [ref=e62]: Auto-extracted colors will be used. Upload a logo to see the results.
        - generic [ref=e63]:
          - generic [ref=e64] [cursor=pointer]: Manual Color Override
          - checkbox "Manual Color Override" [ref=e65]
      - button "Generate Branding Bundle" [disabled] [ref=e66]
  - alert [ref=e67]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import path from 'path';
  3  | 
  4  | test.describe('Entra ID Branding Generator E2E', () => {
  5  |   const TARGET_URL = process.env.TEST_URL || 'http://localhost:3000';
  6  | 
  7  |   test.beforeEach(async ({ page }) => {
  8  |     page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  9  |     page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  10 |   });
  11 | 
  12 |   test('Page loads and has title', async ({ page }) => {
  13 |     await page.goto(TARGET_URL);
  14 |     // Check for the header text in the Sidebar
  15 |     await expect(page.locator('text=Entra Branding')).toBeVisible({ timeout: 15000 });
  16 |   });
  17 | 
  18 |   test('Project creation and persistence', async ({ page }) => {
  19 |     await page.goto(TARGET_URL);
  20 |     
  21 |     // Wait for sidebar
  22 |     const sidebar = page.locator('aside');
  23 |     await expect(sidebar).toBeVisible({ timeout: 15000 });
  24 |     
  25 |     // Create new project
  26 |     await page.click('button:has-text("New Project")');
  27 |     // Wait for URL update
  28 |     await page.waitForURL(/\?project=/, { timeout: 15000 });
  29 |     
  30 |     // The project name is an input field
  31 |     await expect(page.locator('input[value*="Project"]')).toBeVisible();
  32 |   });
  33 | 
  34 |   test('Logo upload and generation', async ({ page }) => {
  35 |     await page.goto(TARGET_URL);
  36 |     
  37 |     // Ensure we are on a project
  38 |     await page.waitForURL(/\?project=/, { timeout: 15000 });
  39 | 
  40 |     // Upload a test logo
  41 |     const filePath = path.resolve('public/window.svg');
  42 |     await page.setInputFiles('input[type="file"]', filePath);
  43 |     
  44 |     // Click Generate
  45 |     await page.click('button:has-text("Generate Branding Bundle")');
  46 |     
  47 |     // Check if assets are generated
  48 |     await expect(page.locator('text=Generated Assets')).toBeVisible({ timeout: 30000 });
  49 |     await expect(page.locator('text=Pre-Flight Validation')).toBeVisible();
  50 |   });
  51 | 
  52 |   test('Theme switcher and mockup', async ({ page }) => {
  53 |     await page.goto(TARGET_URL);
  54 |     await page.waitForURL(/\?project=/, { timeout: 15000 });
  55 |     
  56 |     // Upload and Generate
  57 |     const filePath = path.resolve('public/window.svg');
  58 |     await page.setInputFiles('input[type="file"]', filePath);
  59 |     await page.click('button:has-text("Generate Branding Bundle")');
  60 |     
  61 |     // Wait for mockup (it has aspect-video class)
  62 |     const mockup = page.locator('.aspect-video');
  63 |     await expect(mockup).toBeVisible({ timeout: 30000 });
  64 |     
  65 |     // Toggle theme
  66 |     await page.click('button[aria-label="Toggle Theme"]');
  67 |     
  68 |     // Verify mockup is still visible
  69 |     await expect(mockup).toBeVisible();
  70 |   });
  71 | 
  72 |   test('Logo fetch from URL', async ({ page }) => {
  73 |     await page.goto(TARGET_URL);
  74 |     await page.waitForURL(/\?project=/, { timeout: 15000 });
  75 | 
  76 |     const testUrl = 'https://mirror.ivoozz.nl/white.png';
  77 |     await page.fill('input[placeholder*="https://"]', testUrl);
  78 |     await page.click('button:has-text("Fetch")');
  79 | 
  80 |     // Wait for the logo to be updated in the state (check if the filename appears or generate button enables)
> 81 |     await expect(page.locator('text=white.png')).toBeVisible({ timeout: 15000 });
     |                                                  ^ Error: expect(locator).toBeVisible() failed
  82 |     
  83 |     await page.click('button:has-text("Generate Branding Bundle")');
  84 |     await expect(page.locator('text=Generated Assets')).toBeVisible({ timeout: 30000 });
  85 |   });
  86 | });
  87 | 
```