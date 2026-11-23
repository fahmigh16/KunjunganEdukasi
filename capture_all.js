const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Helper to wait
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for CDP request
class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('--- Starting Backend Server ---');
  const backend = spawn('node', ['app.js'], { cwd: path.join(__dirname, 'backend'), stdio: 'ignore' });

  console.log('--- Starting Frontend Server ---');
  const frontend = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', '5173'], {
    cwd: path.join(__dirname, 'frontend'),
    shell: true,
    stdio: 'ignore'
  });

  await wait(4000);

  const tmpProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'cdp_profile_' + Date.now());
  console.log('--- Launching Headless Chrome with CDP ---');
  const chrome = spawn(
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      `--user-data-dir=${tmpProfile}`,
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1280,850',
      'about:blank'
    ],
    { stdio: 'ignore' }
  );

  await wait(2500);

  try {
    // Get browser tab
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9222/json', (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    const pageTab = tabs.find((t) => t.type === 'page') || tabs[0];
    console.log('Connected to tab:', pageTab.title, pageTab.webSocketDebuggerUrl);

    const client = new CDPClient(pageTab.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 850,
      deviceScaleFactor: 1.25,
      mobile: false
    });

    const takeScreenshot = async (filename) => {
      await wait(1000);
      const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(screenshotDir, filename);
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
      console.log('Saved:', filename);
    };

    // 1. Gambar 2: Registrasi
    console.log('Capturing Gambar 2 (Registrasi)...');
    await client.send('Page.navigate', { url: 'http://127.0.0.1:5173/register' });
    await wait(2000);
    await takeScreenshot('gambar2_registrasi.png');

    // Login as user to set auth
    console.log('Logging in as User...');
    await client.send('Page.navigate', { url: 'http://127.0.0.1:5173/login' });
    await wait(2000);
    await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'user@gmail.com', password: 'user123' })
          });
          const data = await res.json();
          localStorage.setItem('polinela_token', data.token);
          localStorage.setItem('polinela_user', JSON.stringify(data.user));
          window.location.href = '/booking';
        })();
      `,
      awaitPromise: true
    });
    await wait(2500);

    // 2. Gambar 3: Booking Step 1
    console.log('Capturing Gambar 3 (Booking Langkah 1)...');
    await takeScreenshot('gambar3_booking_langkah1.png');

    // Advance to Step 2
    console.log('Advancing to Step 2...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Lanjut ke Data Sekolah'));
          if (btn) btn.click();
        })();
      `
    });
    await wait(1200);
    await takeScreenshot('gambar4_booking_langkah2.png');

    // Fill Step 2 and advance to Step 3
    console.log('Filling Step 2 and advancing to Step 3...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const cityInput = document.querySelector('input[placeholder*=\"Bandar Lampung\"]') || document.querySelectorAll('input')[1];
          if (cityInput) {
            cityInput.value = 'Kota Bandar Lampung';
            cityInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Lanjut ke Data Kunjungan'));
          if (btn) btn.click();
        })();
      `
    });
    await wait(1200);
    await takeScreenshot('gambar5_booking_langkah3.png');

    // Fill Step 3 and advance to Step 4
    console.log('Filling Step 3 and advancing to Step 4...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const dateInput = document.querySelector('input[type=\"date\"]');
          if (dateInput) {
            dateInput.value = '2026-12-15';
            dateInput.dispatchEvent(new Event('input', { bubbles: true }));
            dateInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Lanjut ke Pilih Paket'));
          if (btn) btn.click();
        })();
      `
    });
    await wait(1500);
    await takeScreenshot('gambar6_booking_langkah4.png');

    // Select 2 activities and advance to Step 5
    console.log('Selecting 2 activities and advancing to Step 5...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const cards = Array.from(document.querySelectorAll('div, button')).filter(el => el.textContent.includes('Menanam Sayur') || el.textContent.includes('Membuat Roti'));
          for (const c of cards.slice(0, 2)) {
            c.click();
          }
          setTimeout(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Lanjut ke Ringkasan'));
            if (btn) btn.click();
          }, 500);
        })();
      `
    });
    await wait(2000);
    await takeScreenshot('gambar7_booking_langkah5.png');

    // 7. Gambar 8: User Dashboard
    console.log('Capturing Gambar 8 (User Dashboard)...');
    await client.send('Page.navigate', { url: 'http://127.0.0.1:5173/dashboard' });
    await wait(2000);
    await takeScreenshot('gambar8_user_dashboard.png');

    // 8. Gambar 10: Halaman Pembayaran
    console.log('Capturing Gambar 10 (Payment Page)...');
    await client.send('Page.navigate', { url: 'http://127.0.0.1:5173/booking/1/payment' });
    await wait(2000);
    await takeScreenshot('gambar10_halaman_pembayaran.png');

    // Now switch to Admin account
    console.log('Switching to Admin...');
    await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@polinela.ac.id', password: 'admin123' })
          });
          const data = await res.json();
          localStorage.setItem('polinela_token', data.token);
          localStorage.setItem('polinela_user', JSON.stringify(data.user));
          window.location.href = '/admin';
        })();
      `,
      awaitPromise: true
    });
    await wait(2500);

    // 9. Gambar 9: Admin Review Bookings
    console.log('Capturing Gambar 9 (Admin Management Booking)...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Manajemen Booking'));
          if (navBtn) navBtn.click();
        })();
      `
    });
    await wait(1500);
    await takeScreenshot('gambar9_admin_review.png');

    // 10. Gambar 11: Admin Verifikasi Pembayaran
    console.log('Capturing Gambar 11 (Admin Verifikasi Pembayaran)...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Verifikasi Pembayaran'));
          if (navBtn) navBtn.click();
        })();
      `
    });
    await wait(1500);
    await takeScreenshot('gambar11_verifikasi_pembayaran.png');

    client.close();
    console.log('--- ALL SCREENSHOTS CAPTURED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    try { chrome.kill(); } catch (e) {}
    try { backend.kill(); } catch (e) {}
    try { frontend.kill(); } catch (e) {}
  }
}

run();
