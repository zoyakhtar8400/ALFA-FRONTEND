const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let localServer;
let backendProcess = null;

const PRIMARY_PORT = 5174;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webp': 'image/webp',
  '.map': 'application/json'
};

function createServerInstance() {
  const distDir = path.join(__dirname, 'dist');
  const indexHtml = path.join(distDir, 'index.html');

  return http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
      let reqPath = decodeURIComponent(parsedUrl.pathname);

      let cleanPath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
      if (cleanPath.startsWith(path.sep)) {
        cleanPath = cleanPath.slice(1);
      }

      let filePath = path.join(distDir, cleanPath);
      let fileToServe = null;

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        fileToServe = filePath;
      } else {
        // Fallback for nested asset requests like /pos/master/assets/...
        const assetMatch = reqPath.match(/\/(assets\/[^\/\?#]+)$/);
        if (assetMatch) {
          const directAsset = path.join(distDir, assetMatch[1]);
          if (fs.existsSync(directAsset) && fs.statSync(directAsset).isFile()) {
            fileToServe = directAsset;
          }
        }
        // Fallback for nested logo requests like /something/logo/...
        const logoMatch = reqPath.match(/\/(logo\/[^\/\?#]+)$/);
        if (logoMatch) {
          const directLogo = path.join(distDir, logoMatch[1]);
          if (fs.existsSync(directLogo) && fs.statSync(directLogo).isFile()) {
            fileToServe = directLogo;
          }
        }
      }

      // SPA fallback: if not a physical file, serve index.html
      if (!fileToServe) {
        const ext = path.extname(cleanPath).toLowerCase();
        if (!ext || ext === '.html') {
          fileToServe = indexHtml;
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          return;
        }
      }

      const ext = path.extname(fileToServe).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(fileToServe, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Server Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  });
}

function startLocalServer() {
  return new Promise((resolve) => {
    let server = createServerInstance();

    const tryListen = (port) => {
      server.listen(port, '127.0.0.1', () => {
        const actualPort = server.address().port;
        console.log(`[ALFA Desktop] Local embedded server running on http://127.0.0.1:${actualPort}`);
        localServer = server;
        resolve(actualPort);
      });
    };

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[ALFA Desktop] Port ${PRIMARY_PORT} busy, assigning free ephemeral port...`);
        server.close();
        server = createServerInstance();
        tryListen(0);
      } else {
        console.error('[ALFA Desktop] Server error:', err);
        tryListen(0);
      }
    });

    tryListen(PRIMARY_PORT);
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[ALFA Desktop] Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
    if (errorCode !== -3) { // Ignore ABORTED
      setTimeout(() => {
        if (mainWindow) mainWindow.loadURL(validatedURL);
      }, 1000);
    }
  });

  const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools();
  } else {
    try {
      await mainWindow.webContents.session.clearCache();
    } catch (e) { }
    try {
      await mainWindow.webContents.session.clearCache();
    } catch (e) {}
    const port = await startLocalServer();
    mainWindow.loadURL(`http://127.0.0.1:${port}`).catch((err) => {
      console.error('[ALFA Desktop] Initial loadURL error:', err);
    });
  }

  // Manual backend start only - do not automatically start backend on startup

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (localServer) {
      try {
        localServer.close();
      } catch (e) { }
    }
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

// ── Native Hardware Silent Printing & Auto-Save to Downloads ──
ipcMain.handle('get-system-printers', async () => {
  if (mainWindow && mainWindow.webContents) {
    try {
      return await mainWindow.webContents.getPrintersAsync();
    } catch (e) {
      console.warn('[ALFA Desktop] Failed to get system printers:', e);
    }
  }
  return [];
});

ipcMain.handle('print-receipt-silent', async (event, { html, deviceName, filename }) => {
  let printWin = new BrowserWindow({
    show: false,
    width: 380,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html || '')}`);

  return new Promise((resolve) => {
    printWin.webContents.on('did-finish-load', async () => {
      // 1. Build default filename matching pattern e.g. BILL-17930078191136.pdf or KOT-38.pdf
      const safeName = (filename || `Print-${Date.now()}`).replace(/[^a-zA-Z0-9_\-\. ]/g, '_');
      const defaultFileName = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;

      // 2. Open native Windows "Save Print Output As" dialog
      try {
        const targetWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
        const saveResult = await dialog.showSaveDialog(targetWindow, {
          title: 'Save Print Output As',
          defaultPath: path.join(app.getPath('downloads'), defaultFileName),
          filters: [
            { name: 'PDF Document (*.pdf)', extensions: ['pdf'] }
          ]
        });

        if (!saveResult.canceled && saveResult.filePath) {
          const pdfData = await printWin.webContents.printToPDF({
            printBackground: true
          });
          fs.writeFileSync(saveResult.filePath, pdfData);
          console.log(`[ALFA Desktop] ✅ PDF saved to: ${saveResult.filePath}`);
        } else {
          console.log('[ALFA Desktop] ℹ️ PDF save cancelled by user');
        }
      } catch (saveErr) {
        console.warn('[ALFA Desktop] ⚠️ Save dialog error:', saveErr.message);
      }

      // 3. Silently print directly to the configured physical printer (No printer modal)
      printWin.webContents.print({
        silent: true,
        printBackground: true,
        ...(deviceName ? { deviceName } : {})
      }, (success, errorType) => {
        try { printWin.close(); } catch (e) { }
        resolve({ success, errorType });
      });
    });

    printWin.webContents.on('did-fail-load', (e, code, desc) => {
      try { printWin.close(); } catch (e) { }
      resolve({ success: false, errorType: desc });
    });
  });
});

// ── Persistent Configuration & Automatic Background Backend Management ──

function getConfigPath() {
  return path.join(app.getPath('userData'), 'alfa_config.json');
}

function readConfig() {
  try {
    const p = getConfigPath();
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[ALFA Desktop] Could not read config file:', err.message);
  }
  return { serverUrl: null };
}

function writeConfig(newConfig) {
  try {
    const p = getConfigPath();
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const current = readConfig();
    const merged = { ...current, ...newConfig, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(p, JSON.stringify(merged, null, 2), 'utf8');
    console.log('[ALFA Desktop] ✅ Configuration saved to:', p);
    return merged;
  } catch (err) {
    console.error('[ALFA Desktop] Failed to save config:', err.message);
    throw err;
  }
}

function checkPortIsListening(port = 8000, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    socket.setTimeout(1200);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

async function startLocalBackend() {
  // If backend is already running (e.g. from service or previous start), don't spawn duplicate
  const isListening = await checkPortIsListening(8000, '127.0.0.1');
  if (isListening) {
    console.log('[ALFA Desktop] ℹ️ Local backend is already active on port 8000. Skipping spawn.');
    return { success: true, message: 'Backend is already running on port 8000' };
  }

  // Find backend directory (packaged resources/backend or development)
  const candidateDirs = [
    path.join(process.resourcesPath || '', 'backend'),
    path.join(app.getAppPath(), '..', 'backend'),
    path.join(__dirname, '..', 'AlFA BACKEND'),
    path.join(__dirname, 'backend')
  ];

  let backendDir = null;
  for (const dir of candidateDirs) {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'server.js'))) {
      backendDir = dir;
      break;
    }
  }

  if (!backendDir) {
    console.warn('[ALFA Desktop] ⚠️ Could not locate packaged backend directory.');
    return { success: false, message: 'Backend directory not found' };
  }

  const nodeExe = path.join(backendDir, 'node.exe');
  const executable = fs.existsSync(nodeExe) ? nodeExe : 'node';

  try {
    console.log(`[ALFA Desktop] 🚀 Starting backend in background from: ${backendDir}`);
    backendProcess = spawn(executable, ['server.js'], {
      cwd: backendDir,
      detached: false,
      stdio: 'ignore',
      windowsHide: true
    });

    backendProcess.on('error', (err) => {
      console.error('[ALFA Desktop] Backend process error:', err.message);
    });

    backendProcess.on('exit', (code, signal) => {
      console.log(`[ALFA Desktop] Backend process exited with code ${code}, signal ${signal}`);
      backendProcess = null;
    });

    return { success: true, message: 'Backend spawned successfully in background' };
  } catch (err) {
    console.error('[ALFA Desktop] Failed to spawn backend process:', err.message);
    return { success: false, message: err.message };
  }
}

app.on('will-quit', () => {
  if (backendProcess) {
    try {
      console.log('[ALFA Desktop] Shutting down application-owned backend...');
      backendProcess.kill();
    } catch (e) { }
    backendProcess = null;
  }
});

// IPC Handler: Get saved configuration
ipcMain.handle('get-config', async () => {
  return readConfig();
});

// IPC Handler: Save configuration
ipcMain.handle('save-config', async (event, newConfig) => {
  return writeConfig(newConfig);
});

// IPC Handler: Check if local backend is active
ipcMain.handle('check-backend-status', async () => {
  const isListening = await checkPortIsListening(8000, '127.0.0.1');
  return { isListening };
});

// IPC Handler: Start local backend
ipcMain.handle('start-local-backend', async () => {
  return await startLocalBackend();
});

// IPC Handler: Stop local backend
ipcMain.handle('stop-local-backend', async () => {
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (e) { }
    backendProcess = null;
  }

  // Safely release port 8000 on Windows
  try {
    if (process.platform === 'win32') {
      const netstat = execSync('netstat -ano | findstr :8000', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      for (const line of netstat.trim().split(/\r?\n/)) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && parseInt(pid, 10) > 0 && pid !== String(process.pid)) {
          try { execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' }); } catch (kErr) { }
        }
      }
    }
  } catch (e) { }

  const isListening = await checkPortIsListening(8000, '127.0.0.1');
  return { success: !isListening, isListening };
});

// IPC Handler: Test connection to server URL
ipcMain.handle('test-connection', async (event, targetUrl) => {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return { success: false, message: 'Invalid URL provided' };
  }

  let cleanUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `http://${cleanUrl}`;
  }
  cleanUrl = cleanUrl.replace(/\/+$/, '');

  const probeUrls = [
    `${cleanUrl}/api-docs/`,
    `${cleanUrl}/api-docs`,
    `${cleanUrl}/api`,
    `${cleanUrl}/`
  ];

  for (const urlStr of probeUrls) {
    try {
      const res = await new Promise((resolve, reject) => {
        try {
          const parsed = new URL(urlStr);
          const lib = parsed.protocol === 'https:' ? https : http;
          const req = lib.get(urlStr, { timeout: 3500 }, (resp) => {
            resolve({ statusCode: resp.statusCode });
          });
          req.on('timeout', () => {
            req.destroy();
            reject(new Error('Connection timed out'));
          });
          req.on('error', (err) => reject(err));
        } catch (urlParseErr) {
          reject(urlParseErr);
        }
      });

      if (res.statusCode && res.statusCode < 500) {
        return {
          success: true,
          status: res.statusCode,
          cleanUrl,
          message: `Connected successfully (HTTP ${res.statusCode})`
        };
      }
    } catch (err) {
      // Continue to next candidate URL
    }
  }

  return {
    success: false,
    cleanUrl,
    message: 'Cannot reach ALFA Server at this address. Please verify IP, port, and ensure the server is running.'
  };
});



