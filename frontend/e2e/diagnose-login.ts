/**
 * Playwright diagnostic script — checks login redirect behavior for all 3 roles.
 * Run with: npx ts-node --esm diagnose-login.ts
 * OR: npx playwright test diagnose-login.ts --project=chromium
 */
import { chromium } from 'playwright';

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Capture console logs from the page
  page.on('console', msg => {
    const type = msg.type();
    if (['error', 'warn', 'log'].includes(type)) {
      console.log(`[browser:${type}]`, msg.text());
    }
  });

  page.on('response', async resp => {
    if (resp.url().includes('/auth/')) {
      const status = resp.status();
      console.log(`[network] ${resp.request().method()} ${resp.url()} → ${status}`);
      if (resp.request().method() === 'POST' && resp.url().includes('/auth/login')) {
        try {
          const body = await resp.json();
          console.log('[login response] user_type:', body?.user?.user_type, '| role:', body?.user?.role);
        } catch {}
      }
    }
  });

  const roles = ['admin', 'freelancer', 'client'] as const;

  for (const targetRole of roles) {
    console.log('\n' + '='.repeat(60));
    console.log(`TEST: Logging in as ${targetRole.toUpperCase()}`);
    console.log('='.repeat(60));

    // Clear all state
    await ctx.clearCookies();
    await page.goto('http://localhost:3000/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await sleep(1000);

    // Wait for DevQuickLogin to be visible
    const devSection = page.locator('text=Quick Demo Login');
    try {
      await devSection.waitFor({ timeout: 5000 });
      console.log('[✓] DevQuickLogin section visible');
    } catch {
      console.log('[✗] DevQuickLogin section NOT visible - check NEXT_PUBLIC_SHOW_DEMO_LOGIN');
      continue;
    }

    // Enable auto-login mode
    const autoLoginCheckbox = page.locator('#autoLoginMode');
    const isChecked = await autoLoginCheckbox.isChecked();
    if (!isChecked) {
      await autoLoginCheckbox.click();
      await sleep(300);
    }
    console.log('[✓] Auto-login mode enabled');

    // Capture localStorage BEFORE clicking
    const lsBefore = await page.evaluate(() => ({
      ml_user_role: localStorage.getItem('ml_user_role'),
      portal_area: localStorage.getItem('portal_area'),
      user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    }));
    console.log('[localStorage before click]', lsBefore);

    // Click the role button
    const roleLabel = targetRole.charAt(0).toUpperCase() + targetRole.slice(1);
    await page.locator(`button[aria-label="Quick login as ${roleLabel}"]`).click();
    console.log(`[✓] Clicked ${roleLabel} button`);

    // Wait for navigation
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 }).catch(() => {
      console.log('[✗] Still on login page after 10s');
    });

    await sleep(2000);
    const finalUrl = page.url();
    console.log('[→ FINAL URL]', finalUrl);

    // Check localStorage AFTER navigation
    const lsAfter = await page.evaluate(() => ({
      ml_user_role: localStorage.getItem('ml_user_role'),
      portal_area: localStorage.getItem('portal_area'),
      user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).user_type : null,
    }));
    console.log('[localStorage after nav]', lsAfter);

    const expectedPrefix = `/${targetRole}/`;
    const passed = finalUrl.includes(expectedPrefix);
    console.log(passed
      ? `[✓ PASS] Landed on correct ${targetRole} portal`
      : `[✗ FAIL] Expected /${targetRole}/ but got ${finalUrl}`
    );

    // If failed, wait a bit more and check again (in case of redirect loop)
    if (!passed) {
      await sleep(3000);
      const urlAfterWait = page.url();
      console.log('[→ URL after extra wait]', urlAfterWait);
      const lsFinal = await page.evaluate(() => ({
        ml_user_role: localStorage.getItem('ml_user_role'),
        portal_area: localStorage.getItem('portal_area'),
        user_type: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).user_type : null,
      }));
      console.log('[localStorage final]', lsFinal);
    }
  }

  console.log('\n[Done] Closing browser in 3s...');
  await sleep(3000);
  await browser.close();
}

main().catch(console.error);
