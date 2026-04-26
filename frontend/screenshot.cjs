const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1440, height: 1000 }
  });
  const page = await browser.newPage();
  
  // Navigate to landing
  await page.goto('http://localhost:5173/StripeSpend/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '../site_home.png', fullPage: true });

  // Navigate to Student
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Student'));
    if (btn) btn.click();
  });
  // Wait a bit for render
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '../site_stipends.png', fullPage: true });

  // Navigate to Donor
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Donor'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '../site_history.png', fullPage: true });

  await browser.close();
})();
