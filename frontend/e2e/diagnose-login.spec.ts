import { test, expect, chromium } from '@playwright/test';

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

const roles = ['admin', 'freelancer', 'client'] as const;

for (const targetRole of roles) {
  test(`Login as ${targetRole} lands on correct portal`, async ({ page }) => {
    // Capture network
    const loginResponses: string[] = [];
    page.on('response', async resp => {
      if (resp.url().includes('/auth/login') && resp.request().method() === 'POST') {
        try {
          const body = await resp.json();
          loginResponses.push(`user_type=${body?.user?.user_type} role=${body?.user?.role}`);
        } catch {}
      }
    });

    // Capture console
    page.on('console', msg => {
      if (['warn', 'log'].includes(msg.type())) {
        console.log(`[browser:${msg.type()}]`, msg.text());
      }
    });

    // Clear all state before test
    await page.goto('http://localhost:3000/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await sleep(800);

    // Wait for DevQuickLogin
    await page.waitForSelector('text=Quick Demo Login', { timeout: 8000 });
    console.log('[✓] DevQuickLogin visible');

    // Enable auto-login mode
    const checkbox = page.locator('#autoLoginMode');
    if (!(await checkbox.isChecked())) {
      await checkbox.click();
    }

    // Read localStorage BEFORE
    const lsBefore = await page.evaluate(() => ({
      ml_user_role: localStorage.getItem('ml_user_role'),
      portal_area: localStorage.getItem('portal_area'),
      user_type: (() => { try { return JSON.parse(localStorage.getItem('user') || 'null')?.user_type; } catch { return null; } })(),
    }));
    console.log(`[${targetRole}] localStorage BEFORE:`, JSON.stringify(lsBefore));

    // Click role button
    const roleLabel = targetRole.charAt(0).toUpperCase() + targetRole.slice(1);
    await page.click(`button[aria-label="Quick login as ${roleLabel}"]`);
    console.log(`[✓] Clicked ${roleLabel}`);

    // Read localStorage immediately after click (before navigation)
    await sleep(500);
    const lsAfterClick = await page.evaluate(() => ({
      ml_user_role: localStorage.getItem('ml_user_role'),
      portal_area: localStorage.getItem('portal_area'),
      user_type: (() => { try { return JSON.parse(localStorage.getItem('user') || 'null')?.user_type; } catch { return null; } })(),
    }));
    console.log(`[${targetRole}] localStorage AFTER CLICK:`, JSON.stringify(lsAfterClick));
    console.log(`[${targetRole}] Login API responses:`, loginResponses);

    // Wait for navigation away from login
    await page.waitForURL(u => !u.includes('/login'), { timeout: 12000 });
    await sleep(2500); // Wait for portal layout effects to settle

    const url1 = page.url();
    console.log(`[${targetRole}] URL after nav:`, url1);

    // Read localStorage after landing
    const lsAfterNav = await page.evaluate(() => ({
      ml_user_role: localStorage.getItem('ml_user_role'),
      portal_area: localStorage.getItem('portal_area'),
      user_type: (() => { try { return JSON.parse(localStorage.getItem('user') || 'null')?.user_type; } catch { return null; } })(),
    }));
    console.log(`[${targetRole}] localStorage AFTER NAV:`, JSON.stringify(lsAfterNav));

    // Wait more and check final URL (portal layout may redirect)
    await sleep(3000);
    const urlFinal = page.url();
    console.log(`[${targetRole}] FINAL URL:`, urlFinal);

    expect(urlFinal, `Expected /${targetRole}/ in URL`).toContain(`/${targetRole}/`);
  });
}
