const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const RECORDINGS_DIR = path.join(__dirname, '..', 'recordings');
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

async function updateCaption(page, title, subtitle = '') {
  try {
    await page.evaluate(({ title, subtitle }) => {
      let el = document.getElementById('screen-record-caption');
      if (!el) {
        el = document.createElement('div');
        el.id = 'screen-record-caption';
        el.style.cssText = `
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999999;
          background: rgba(18, 53, 36, 0.94);
          color: #ffffff;
          padding: 12px 28px;
          border-radius: 9999px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(74, 222, 128, 0.45);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          pointer-events: none;
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
          text-align: center;
          max-width: 90vw;
        `;
        document.body.appendChild(el);
      }
      el.innerHTML = `
        <div style="font-size: 15px; font-weight: 700; color: #4ade80; letter-spacing: 0.02em;">${title}</div>
        ${subtitle ? `<div style="font-size: 12.5px; color: #e2e8f0; font-weight: 400;">${subtitle}</div>` : ''}
      `;
    }, { title, subtitle });
  } catch (e) {
    // ignore if during navigation
  }
}

async function smoothScroll(page, targetY, steps = 15, delay = 40) {
  try {
    await page.evaluate(async ({ targetY, steps, delay }) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      for (let i = 1; i <= steps; i++) {
        window.scrollTo(0, startY + (diff * (i / steps)));
        await new Promise(r => setTimeout(r, delay));
      }
    }, { targetY, steps, delay });
  } catch (e) {
    // ignore
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('[AgroHub Video Recorder] Starting automated browser recording session...');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  try {
    // ==========================================
    // SCENE 1: Homepage & Platform Overview
    // ==========================================
    console.log('Scene 1: Homepage & Platform Overview');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await updateCaption(page, '🌱 AgroHub — Smart Agricultural Management Platform', 'Modern Digital Platform for Indian Farming Communities & Direct Trade');
    await sleep(2500);

    // Scroll down to services
    await smoothScroll(page, 550, 15, 40);
    await sleep(2000);

    // Scroll down to stats & how it works
    await smoothScroll(page, 1100, 15, 40);
    await sleep(2000);

    // Scroll to footer
    await smoothScroll(page, 1800, 15, 40);
    await sleep(1500);

    // Click "About the Platform" footer link to demonstrate smooth scrolling
    await updateCaption(page, '🔗 Smooth Navigation & Anchor Links', 'Footer quick-links navigate smoothly to sections across pages');
    const aboutLink = await page.$('a[href="/#about-section"]');
    if (aboutLink) {
      await aboutLink.click();
      await sleep(2000);
    }

    // ==========================================
    // SCENE 2: Guest Mode & Role-Based Gate
    // ==========================================
    console.log('Scene 2: Guest Role-Based Navigation');
    await page.goto('http://localhost:5173/marketplace', { waitUntil: 'networkidle' });
    await updateCaption(page, '🔒 Role-Based Security: Guest Browsing Mode', 'Public marketplace access with protected financial & operational modules');
    await sleep(2000);

    // Attempting to access protected farmer-only page as guest
    await updateCaption(page, '🛡️ Smart Redirect with User Feedback', 'Unauthenticated attempts to publish produce redirect cleanly to Login');
    await page.goto('http://localhost:5173/add-product', { waitUntil: 'networkidle' });
    await sleep(2500);

    // ==========================================
    // SCENE 3: Farmer Authentication & Operations Hub
    // ==========================================
    console.log('Scene 3: Farmer Authentication');
    await updateCaption(page, '👨‍🌾 Farmer Authentication — Ramesh Patel', 'Role-detected direct routing to Farmer Operations Hub');
    await page.waitForSelector('input[name="email"]');
    await page.fill('input[name="email"]', 'farmer@agrohub.com');
    await sleep(300);
    await page.fill('input[name="password"]', 'Farmer@123');
    await sleep(500);
    await page.click('button[type="submit"]');
    await sleep(2500);

    // On Farmer Dashboard
    await updateCaption(page, '📊 Farmer Operations Hub', 'Real-time overview: Active crop listings, farm expenses & inventory alerts');
    await smoothScroll(page, 250, 10, 40);
    await sleep(3000);

    // ==========================================
    // SCENE 4: Crop Marketplace & Detail Modal
    // ==========================================
    console.log('Scene 4: Crop Marketplace');
    await page.goto('http://localhost:5173/marketplace', { waitUntil: 'networkidle' });
    await updateCaption(page, '🌾 Direct Crop Marketplace', 'Direct farmer-to-buyer sales with zero middleman commissions');
    await sleep(2000);

    // Category filter: Vegetables
    await updateCaption(page, '⚡ Instant Category Filtering', 'Real-time filtering by Vegetables, Grains, Fruits, and Pulses');
    const vegBtn = await page.$('button.pill-btn:has-text("Vegetables")');
    if (vegBtn) {
      await vegBtn.click();
      await sleep(1500);
    }

    // Filter: Grains
    const grainsBtn = await page.$('button.pill-btn:has-text("Grains")');
    if (grainsBtn) {
      await grainsBtn.click();
      await sleep(1500);
    }

    // Open Crop Detail Modal
    await updateCaption(page, '🔍 Crop Listing Details Modal', 'High-resolution photo, selling price, quantity, location & verified farmer contact');
    const viewCropBtn = await page.$('.btn-view-details');
    if (viewCropBtn) {
      await viewCropBtn.click();
      await sleep(3000);
      // Close modal
      const closeBtn = await page.$('.detail-close-btn');
      if (closeBtn) {
        await closeBtn.click();
        await sleep(1000);
      }
    }

    // ==========================================
    // SCENE 5: Machinery Rental with Genuine Equipment
    // ==========================================
    console.log('Scene 5: Machinery Rental');
    await page.goto('http://localhost:5173/machinery', { waitUntil: 'networkidle' });
    await updateCaption(page, '🚜 Agricultural Machinery Rental', 'Verified tractors, combine harvesters & tillers on transparent daily rentals');
    await sleep(2000);

    // Scroll through genuine machinery photos
    await smoothScroll(page, 400, 15, 40);
    await sleep(2500);

    // Open Machinery Detail Modal
    await updateCaption(page, '⚙️ Equipment Specification & Owner Contact', 'Detailed implement specs, daily rental price, and direct owner phone number');
    const viewMachBtn = await page.$('.btn-view-details');
    if (viewMachBtn) {
      await viewMachBtn.click();
      await sleep(3000);
      const closeMachBtn = await page.$('.detail-close-btn');
      if (closeMachBtn) {
        await closeMachBtn.click();
        await sleep(1000);
      }
    }

    // ==========================================
    // SCENE 6: Agricultural Workers Hiring
    // ==========================================
    console.log('Scene 6: Agricultural Workers');
    await page.goto('http://localhost:5173/workers', { waitUntil: 'networkidle' });
    await updateCaption(page, '👥 Agricultural Worker Hiring', 'Connect directly with verified farm labor, harvester operators & specialists');
    await sleep(2000);

    await smoothScroll(page, 350, 15, 40);
    await sleep(2000);

    // Open Worker Detail Modal
    await updateCaption(page, '📋 Verified Agricultural Worker Profile', 'Experience years, skills specialization tags & direct hiring contact');
    const viewWorkerBtn = await page.$('.btn-view-details');
    if (viewWorkerBtn) {
      await viewWorkerBtn.click();
      await sleep(2500);
      const closeWorkerBtn = await page.$('.detail-close-btn');
      if (closeWorkerBtn) {
        await closeWorkerBtn.click();
        await sleep(1000);
      }
    }

    // ==========================================
    // SCENE 7: Real-Time Weather Advisory
    // ==========================================
    console.log('Scene 7: Weather Advisory');
    await page.goto('http://localhost:5173/weather', { waitUntil: 'networkidle' });
    await updateCaption(page, '🌦️ Agricultural Weather Advisory', 'Live temperature, humidity, wind conditions & 5-day farming advisory');
    await sleep(3000);

    // ==========================================
    // SCENE 8: Farm Expense Tracker
    // ==========================================
    console.log('Scene 8: Expense Tracker');
    await page.goto('http://localhost:5173/expenses', { waitUntil: 'networkidle' });
    await updateCaption(page, '💰 Farm Expense Tracker', 'Operational cost accounting across Seeds, Fertilizers, Fuel & Labor');
    await sleep(2500);

    await smoothScroll(page, 350, 12, 40);
    await sleep(2500);

    // ==========================================
    // SCENE 9: Farm Supplies Inventory
    // ==========================================
    console.log('Scene 9: Inventory Management');
    await page.goto('http://localhost:5173/inventory', { waitUntil: 'networkidle' });
    await updateCaption(page, '📦 Farm Supplies Inventory Management', 'Track fertilizers, seeds & equipment stock with automated low-supply warnings');
    await sleep(3000);

    // ==========================================
    // SCENE 10: Financial & Profit Reports
    // ==========================================
    console.log('Scene 10: Financial & Profit Reports');
    await page.goto('http://localhost:5173/reports', { waitUntil: 'networkidle' });
    await updateCaption(page, '📈 Financial & Net Profit Reports', 'Automated farm profit analysis: Total Revenue vs. Total Operating Expenses');
    await sleep(3000);

    // ==========================================
    // SCENE 11: Buyer Experience & Role Boundary Enforcement
    // ==========================================
    console.log('Scene 11: Buyer Experience & Role Restrictions');
    // Clear auth state and go to login
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await updateCaption(page, '🛒 Buyer Authentication — Anita Sharma', 'Login as registered produce buyer with buyer-specific dashboard');
    await page.waitForSelector('input[name="email"]');
    await page.fill('input[name="email"]', 'buyer@agrohub.com');
    await sleep(200);
    await page.fill('input[name="password"]', 'Buyer@123');
    await sleep(400);
    await page.click('button[type="submit"]');
    await sleep(2500);

    // Show Buyer Dashboard
    await updateCaption(page, '🛍️ Buyer Operations Dashboard', 'Browse local crops, discover farm producers & access direct supply inquiries');
    await sleep(2500);

    // Attempt to access farmer-only Add Product page
    await page.goto('http://localhost:5173/add-product', { waitUntil: 'networkidle' });
    await updateCaption(page, '🛡️ Role Access Feedback: Farmer Privilege Required', 'Clear guidance: "Only registered farmers can publish crop listings"');
    await sleep(3000);

    // ==========================================
    // SCENE 12: Admin Dashboard & Governance
    // ==========================================
    console.log('Scene 12: Admin Dashboard');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await updateCaption(page, '🛡️ Administrator Authentication', 'System Administrator access with platform-wide oversight');
    await page.waitForSelector('input[name="email"]');
    await page.fill('input[name="email"]', 'admin@agrohub.com');
    await sleep(200);
    await page.fill('input[name="password"]', 'Admin@123');
    await sleep(400);
    await page.click('button[type="submit"]');
    await sleep(2500);

    await updateCaption(page, '🏛️ Administrator Control Hub', 'Total registered users, platform metrics & community moderation table');
    await smoothScroll(page, 300, 10, 40);
    await sleep(3000);

    // ==========================================
    // SCENE 13: Branded 404 & Closing
    // ==========================================
    console.log('Scene 13: 404 & Closing');
    await page.goto('http://localhost:5173/non-existent-page', { waitUntil: 'networkidle' });
    await updateCaption(page, '⚠️ Resilient Error Handling: Custom 404 Page', 'Branded 404 Not Found screen with one-click return to safety');
    await sleep(2500);

    // Click Go Home
    const goHomeBtn = await page.$('a:has-text("Return to Homepage"), a:has-text("Return Home"), a[href="/"]');
    if (goHomeBtn) {
      await goHomeBtn.click();
      await sleep(2000);
    }

    await updateCaption(page, '✨ AgroHub — Empowering Indian Agriculture', 'Full-Stack Solution Built with React, Vite, Node.js, Express & MongoDB');
    await sleep(3500);

    console.log('[AgroHub Video Recorder] All scenes completed successfully!');
  } catch (err) {
    console.error('[AgroHub Video Recorder] Error during recording:', err);
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();

    if (video) {
      const originalPath = await video.path();
      const finalDest = path.join(RECORDINGS_DIR, 'AgroHub_Complete_Demo_Video.webm');
      try {
        if (fs.existsSync(finalDest)) {
          fs.unlinkSync(finalDest);
        }
        fs.renameSync(originalPath, finalDest);
        console.log('========================================================');
        console.log('🎥 FINAL SCREEN RECORDING VIDEO SAVED SUCCESSFULLY AT:');
        console.log(finalDest);
        console.log('File size:', (fs.statSync(finalDest).size / (1024 * 1024)).toFixed(2), 'MB');
        console.log('========================================================');
      } catch (copyErr) {
        console.log('Video saved at original path:', originalPath);
      }
    }
  }
}

run();
