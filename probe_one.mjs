import { chromium } from 'playwright-core';
const P = process.env.PORT;
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome-stable', args: ['--no-sandbox'] });
const errs = [];
const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
p.on('console', m => { if (['error','warning'].includes(m.type())) errs.push('['+m.type()+'] '+m.text().slice(0,140)); });
p.on('pageerror', e => errs.push('[pageerror] '+e.message.slice(0,140)));

await p.goto(`http://localhost:${P}/`, { waitUntil: 'networkidle' });
await p.getByRole('button', { name: /本棚をのぞく/ }).click();
await p.locator('button[aria-label*="—"]').first().waitFor({ timeout: 8000 });
await p.waitForTimeout(900);

// count spines + featured in "すべて"
const countAll = await p.locator('button[aria-label*="—"]').count();
await p.screenshot({ path: 'O-all.png', fullPage: true });

// switch to おすすめ
await p.getByRole('button', { name: 'おすすめ', exact: true }).click();
await p.waitForTimeout(900);
const countRec = await p.locator('button[aria-label*="—"]').count();
await p.screenshot({ path: 'O-recommended.png', fullPage: true });

// switch to 季節
await p.getByRole('button', { name: '季節', exact: true }).click();
await p.waitForTimeout(900);
const countSea = await p.locator('button[aria-label*="—"]').count();

console.log('book buttons (spine+cover) — すべて:', countAll, ' おすすめ:', countRec, ' 季節:', countSea);
console.log('errors:', errs.length ? [...new Set(errs)].join(' | ') : '(none)');
await browser.close();
