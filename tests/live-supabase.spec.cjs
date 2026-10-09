const { test, expect } = require('@playwright/test');

const accountA = {
  email: process.env.SUPABASE_TEST_EMAIL,
  password: process.env.SUPABASE_TEST_PASSWORD
};
const accountB = {
  email: process.env.SUPABASE_TEST_EMAIL_B,
  password: process.env.SUPABASE_TEST_PASSWORD_B
};

test.skip(!accountA.email || !accountA.password || !accountB.email || !accountB.password,
  'Requires two dedicated test accounts configured as repository secrets.');

async function login(page, account) {
  await page.goto('/');
  await page.locator('#authEmail').fill(account.email);
  await page.locator('#authPassword').fill(account.password);
  await page.locator('#authMainBtn').click();
  await expect(page.locator('#authGate')).toBeHidden({ timeout: 20000 });
}

test('Cloud record is available to the same account in a fresh browser session', async ({ browser }) => {
  const pno = 'LIVE-QA-' + Date.now();
  const ctx1 = await browser.newContext();
  const page1 = await ctx1.newPage();
  const ctx2 = await browser.newContext();
  const page2 = await ctx2.newPage();
  try {
    await login(page1, accountA);
    await page1.locator('#pno').fill(pno);
    await page1.locator('#client').fill('Automated cloud test only');
    await page1.locator('#quickActions').getByRole('button', { name: 'Запиши' }).click();
    page1.once('dialog', d => d.accept());
    await expect.poll(() => page1.evaluate(n => JSON.parse(localStorage.getItem('gasProtocolArchive') || '[]').some(x => x.pno === n), pno)).toBe(true);
    await login(page2, accountA);
    await expect.poll(() => page2.evaluate(n => JSON.parse(localStorage.getItem('gasProtocolArchive') || '[]').some(x => x.pno === n), pno), { timeout: 20000 }).toBe(true);
  } finally {
    await ctx1.close();
    await ctx2.close();
  }
});

test('A different account cannot see the first account test record', async ({ browser }) => {
  const pno = 'LIVE-QA-ISOLATION-' + Date.now();
  const ctx1 = await browser.newContext();
  const page1 = await ctx1.newPage();
  const ctx2 = await browser.newContext();
  const page2 = await ctx2.newPage();
  try {
    await login(page1, accountA);
    await page1.locator('#pno').fill(pno);
    await page1.locator('#client').fill('Automated isolation test only');
    page1.once('dialog', d => d.accept());
    await page1.locator('#quickActions').getByRole('button', { name: 'Запиши' }).click();
    await expect.poll(() => page1.evaluate(n => JSON.parse(localStorage.getItem('gasProtocolArchive') || '[]').some(x => x.pno === n), pno)).toBe(true);

    await login(page2, accountB);
    await expect.poll(() => page2.evaluate(n => JSON.parse(localStorage.getItem('gasProtocolArchive') || '[]').some(x => x.pno === n), pno), { timeout: 20000 }).toBe(false);
  } finally {
    await ctx1.close();
    await ctx2.close();
  }
});
