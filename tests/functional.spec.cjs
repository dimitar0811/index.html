const { test, expect } = require('@playwright/test');

const supabaseStub = 'window.supabase = {createClient: () => ({auth: {getSession: async () => ({data:{session:null},error:null}),signOut: async () => ({error:null}),signUp: async () => ({data:{session:null,user:null},error:null}),signInWithPassword: async ({email}) => ({data:{user:{id:"qa-test-user",email}},error:null})},from: () => {const result = () => window.__testCloudError ? {data:null,error:{message:"Simulated cloud failure"}} : {data:[],error:null};const q={select(){return this},eq(){return this},order(){return this},limit(){return this},upsert:async()=>window.__testCloudError?{error:{message:"Simulated cloud failure"}}:{error:null},delete(){return this},then(resolve,reject){return Promise.resolve(result()).then(resolve,reject)}};return q},rpc:async()=>({data:null,error:null})})};';

test.beforeEach(async ({ page }) => {
  await page.route('**/supabase-js@2*', route => route.fulfill({
    status: 200, contentType: 'application/javascript', body: supabaseStub
  }));
  await page.addInitScript(() => {
    localStorage.clear(); sessionStorage.clear(); window.__testCloudError = false;
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Продължи офлайн' }).click();
});

test('AUTH-01: empty login is validated', async ({ page }) => {
  await page.evaluate(() => { document.querySelector('#authGate').style.display = 'flex'; });
  await page.getByRole('button', { name: 'Вход', exact: true }).click();
  await expect(page.locator('#authMsg')).toContainText('Въведете имейл и парола');
  await expect(page.locator('#authGate')).toBeVisible();
});

test('AUTH-03: registration rejects mismatched passwords', async ({ page }) => {
  await page.evaluate(() => { document.querySelector('#authGate').style.display = 'flex'; });
  await page.getByRole('button', { name: 'Регистрация', exact: true }).click();
  await expect(page.locator('#authPassword2')).toBeVisible();
  await page.locator('#authEmail').fill('qa@example.test');
  await page.locator('#authPassword').fill('first-password');
  await page.locator('#authPassword2').fill('different-password');
  await page.getByRole('button', { name: 'Регистрация', exact: true }).click();
  await expect(page.locator('#authMsg')).toContainText('Паролите не съвпадат');
});

test('AUTH-05 and UI-01: offline mode reveals usable main actions', async ({ page }) => {
  await expect(page.locator('#authGate')).toBeHidden();
  await expect(page.locator('#quickActions')).toBeVisible();
  for (const id of ['client', 'c1', 'c2', 'm1', 'm2', 'notes']) await expect(page.locator('#' + id)).toBeVisible();
  for (const name of ['Запиши', 'Архив', 'Нов протокол', 'Печат / PDF', 'Изпрати файл'])
    await expect(page.locator('#quickActions').getByRole('button', { name })).toBeVisible();
});

test('LANG-01: interface switches BG to EN and back', async ({ page }) => {
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#quickActions')).toContainText('Save');
  await page.getByRole('button', { name: 'BG', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'bg');
  await expect(page.locator('#quickActions')).toContainText('Запиши');
});

test('CALC-01 to CALC-03: corrector and meter usage calculate to three decimals', async ({ page }) => {
  await page.locator('#c1').fill('100'); await page.locator('#c2').fill('125.5');
  await page.locator('#m1').fill('40'); await page.locator('#m2').fill('47.25');
  await expect(page.locator('#cu')).toHaveText('25.500 m³');
  await expect(page.locator('#mu')).toHaveText('7.250 m³');
  await page.locator('#c1').fill('10.125'); await page.locator('#c2').fill('14.5');
  await expect(page.locator('#cu')).toHaveText('4.375 m³');
});

test('CALC-04: negative usage is displayed as documented', async ({ page }) => {
  await page.locator('#c1').fill('10'); await page.locator('#c2').fill('8');
  await expect(page.locator('#cu')).toHaveText('-2.000 m³');
});

test('DATE-01 and DATE-02: date pickers format dates as DD.MM.YYYY', async ({ page }) => {
  for (const pair of [['datePicker','date','2026-03-04','04.03.2026'],['cdPicker','cd','2026-12-25','25.12.2026'],['mdPicker','md','2027-01-09','09.01.2027']]) {
    if (pair[1] !== 'date') await page.locator('#' + pair[1]).click();
    await page.locator('#' + pair[0]).evaluate((el, value) => {
      el.value = value; el.dispatchEvent(new Event('change', { bubbles: true }));
    }, pair[2]);
    await expect(page.locator('#' + pair[1])).toHaveValue(pair[3]);
  }
});

test('SAVE-01: client/company is required before saving', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  await page.locator('main').getByRole('button', { name: 'Запиши', exact: true }).click();
  await expect(page.locator('#pno')).toHaveValue('');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('gasProtocolArchive'))).toBeNull();
});

test('SAVE-02 and PERSIST-01: protocol saves locally and survives reload', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  await page.locator('#client').fill('Тестова фирма');
  await page.locator('#site').fill('Тестов обект');
  await page.locator('#c1').fill('100'); await page.locator('#c2').fill('105.25');
  await page.locator('main').getByRole('button', { name: 'Запиши', exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('gasProtocolArchive') || '[]').length)).toBe(1);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('gasProtocolV2') || '{}'));
  expect(saved.client).toBe('Тестова фирма'); expect(saved.site).toBe('Тестов обект');
  expect(saved.cUsage).toBeCloseTo(5.25); expect(saved.pno).toMatch(/^GP-/);
  await page.reload();
  await page.getByRole('button', { name: 'Продължи офлайн' }).click();
  await expect(page.locator('#client')).toHaveValue('Тестова фирма');
});

test('SAVE-03: same protocol number updates the existing archive record', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  await page.locator('#client').fill('Фирма за обновяване'); await page.locator('#pno').fill('QA-UPDATE-001');
  await page.locator('main').getByRole('button', { name: 'Запиши', exact: true }).click();
  await page.locator('#site').fill('Нов адрес');
  await page.locator('main').getByRole('button', { name: 'Запиши', exact: true }).click();
  const result = await page.evaluate(() => JSON.parse(localStorage.getItem('gasProtocolArchive') || '[]'));
  expect(result).toHaveLength(1); expect(result[0].site).toBe('Нов адрес');
});

test('ARCH-01 to ARCH-03: empty archive, open a record and delete it', async ({ page }) => {
  await page.locator('main').getByRole('button', { name: 'Архив', exact: true }).click();
  await expect(page.locator('#archiveList')).toContainText('Все още няма записани протоколи');
  await page.locator('#client').fill('Фирма архив');
  page.on('dialog', dialog => dialog.accept());
  await page.locator('main').getByRole('button', { name: 'Запиши', exact: true }).click();
  await page.locator('main').getByRole('button', { name: 'Архив', exact: true }).click();
  await expect(page.locator('#archiveList')).toContainText('Фирма архив');
  await page.locator('#archiveList').getByRole('button', { name: 'Отвори' }).click();
  await expect(page.locator('#client')).toHaveValue('Фирма архив');
  await page.locator('main').getByRole('button', { name: 'Архив', exact: true }).click();
  await page.locator('#archiveList').getByRole('button', { name: 'Изтрий' }).click();
  await expect(page.locator('#archiveList')).toContainText('Все още няма записани протоколи');
});

test('NEW-01 and NEW-02: new protocol carries forward repeat-customer readings', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  await page.locator('#client').fill('Постоянен клиент'); await page.locator('#site').fill('Основен обект');
  await page.locator('#c2').fill('45.125'); await page.locator('#m2').fill('91.500');
  await page.locator('main').getByRole('button', { name: 'Запиши', exact: true }).click();
  await page.locator('main').getByRole('button', { name: 'Нов протокол', exact: true }).click();
  await expect(page.locator('#client')).toHaveValue('Постоянен клиент');
  await expect(page.locator('#site')).toHaveValue('Основен обект');
  await expect(page.locator('#c1')).toHaveValue('45.125'); await expect(page.locator('#m1')).toHaveValue('91.500');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('gasProtocolArchive') || '[]').length)).toBe(1);
});

test('SECURITY-01: archive displays markup-looking client input as text', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  const payload = '<img src=x onerror=alert(1)> & "quoted"';
  await page.locator('#client').fill(payload);
  await page.locator('main').getByRole('button', { name: 'Запиши', exact: true }).click();
  await page.locator('main').getByRole('button', { name: 'Архив', exact: true }).click();
  await expect(page.locator('#archiveList img')).toHaveCount(0);
  await expect(page.locator('#archiveList')).toContainText(payload);
});

test('SIG-01 and SIG-02: signature canvas applies a drawn signature and supports cancel', async ({ page }) => {
  await page.getByRole('button', { name: /Подпис — представител на доставчика/ }).click();
  await expect(page.locator('#sigModal')).toBeVisible();
  const rect = await page.locator('#canvas').boundingBox();
  await page.mouse.move(rect.x + 25, rect.y + 30); await page.mouse.down();
  await page.mouse.move(rect.x + 140, rect.y + 70, { steps: 6 }); await page.mouse.up();
  await page.getByRole('button', { name: 'Постави подпис' }).click();
  await expect(page.locator('#techSig img')).toHaveCount(1);
  await page.getByRole('button', { name: /Подпис — клиент и представител/ }).click();
  await page.getByRole('button', { name: 'Отказ' }).click();
  await expect(page.locator('#sigModal')).toBeHidden();
});

test('PRINT-01: print requires client and invokes browser print for valid input', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  await page.evaluate(() => { window.__printed = false; window.print = () => { window.__printed = true; }; });
  await page.locator('main').getByRole('button', { name: 'Печат / PDF', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__printed)).toBe(false);
  await page.locator('#client').fill('Фирма за печат');
  await page.locator('main').getByRole('button', { name: 'Печат / PDF', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__printed)).toBe(true);
});

test('FILE-01: export downloads a standalone HTML file', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  await page.locator('#client').fill('Фирма за файл');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('main').getByRole('button', { name: 'Изпрати като файл', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^gas-protocol-.*\.html$/);
});

test('CLOUD-01 and CLOUD-03: mocked login and cloud failure preserve local protocol data', async ({ page }) => {
  await page.getByRole('button', { name: 'Изход' }).click();
  await page.locator('#authEmail').fill('qa@example.test'); await page.locator('#authPassword').fill('test-password');
  await page.getByRole('button', { name: 'Вход', exact: true }).click();
  await expect(page.locator('#authGate')).toBeHidden();
  await page.evaluate(() => { window.__testCloudError = true; });
  page.on('dialog', dialog => dialog.accept());
  await page.locator('#client').fill('Облачен тест');
  await page.locator('main').getByRole('button', { name: 'Запиши', exact: true }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('gasProtocolArchive'))).toContain('Облачен тест');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('gasProtocolV2')).client)).toBe('Облачен тест');
});
