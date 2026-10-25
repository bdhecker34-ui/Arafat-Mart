import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit.json');

app.use(express.json({ limit: '10mb' }));

// Active session tokens in-memory (and can be verified against server secret)
const activeSessions = new Map<string, { email: string; createdAt: number }>();
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Helper to hash password
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// Log admin action to audit trail
function logAudit(action: string, moduleName: string, detail: string, adminEmail: string) {
  try {
    let logs: any[] = [];
    if (fs.existsSync(AUDIT_FILE)) {
      logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
    }
    const newEntry = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      module: moduleName,
      detail,
      adminEmail,
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString('en-GB'),
    };
    logs.unshift(newEntry);
    // Keep last 500 audit logs
    if (logs.length > 500) logs = logs.slice(0, 500);
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// Admin Authentication Middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing admin authentication token' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  // 12 hour session expiry
  if (Date.now() - session.createdAt > 12 * 60 * 60 * 1000) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  (req as any).adminEmail = session.email;
  next();
}

// ==================== ADMIN API ROUTES ====================

// 1. Check Admin Setup Status
app.get('/api/admin/status', (req, res) => {
  const isSetupComplete = fs.existsSync(ADMIN_FILE);
  if (isSetupComplete) {
    try {
      const data = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));
      return res.json({
        isSetupComplete: true,
        adminEmail: data.email,
        setupDate: data.createdAt,
      });
    } catch {
      return res.json({ isSetupComplete: true });
    }
  }
  return res.json({ isSetupComplete: false });
});

// 2. Initial One-Time Administrator Setup (CRITICAL: Only 1 Admin Allowed Permanently)
app.post('/api/admin/setup', (req, res) => {
  // Concurrency-safe check: if file exists, reject immediately
  if (fs.existsSync(ADMIN_FILE)) {
    return res.status(403).json({
      error: 'Administrator setup is already completed. No second administrator can be created.',
    });
  }

  const { email, password } = req.body;

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Valid email and strong password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const AUTHORIZED_ADMIN_EMAILS = ['bdhecker34@gmail.com', 'ashik140267@gmail.com'];
  if (!AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail)) {
    return res.status(403).json({ error: 'Access denied: Only authorized administrator emails are permitted.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  try {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const adminRecord = {
      email: email.trim().toLowerCase(),
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
      role: 'SUPER_ADMIN',
    };

    // Atomic write
    const tempFile = `${ADMIN_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(adminRecord, null, 2), 'utf-8');
    fs.renameSync(tempFile, ADMIN_FILE);

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.set(token, { email: adminRecord.email, createdAt: Date.now() });

    logAudit('INITIAL_SETUP', 'System', 'Initial Administrator setup completed successfully.', adminRecord.email);

    return res.status(201).json({
      success: true,
      message: 'Initial administrator account created. Setup is now permanently closed.',
      token,
      email: adminRecord.email,
    });
  } catch (err: any) {
    console.error('Setup error:', err);
    return res.status(500).json({ error: 'Internal server error during administrator initialization.' });
  }
});

// 3. Admin Login (with rate-limiting)
app.post('/api/admin/login', (req, res) => {
  if (!fs.existsSync(ADMIN_FILE)) {
    return res.status(400).json({ error: 'Initial administrator setup has not been performed yet.' });
  }

  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const attempts = loginAttempts.get(clientIp) || { count: 0, lastAttempt: 0 };

  // 5 failed attempts in 5 minutes lockout
  if (attempts.count >= 5 && Date.now() - attempts.lastAttempt < 5 * 60 * 1000) {
    return res.status(429).json({
      error: 'Too many failed login attempts. Please wait 5 minutes before trying again.',
    });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const AUTHORIZED_ADMIN_EMAILS = ['bdhecker34@gmail.com', 'ashik140267@gmail.com'];
  if (!AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail)) {
    return res.status(403).json({ error: 'Access denied: Only authorized administrator emails are permitted.' });
  }

  try {
    const adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));
    const cleanEmail = email.trim().toLowerCase();

    const expectedHash = hashPassword(password, adminData.salt);
    const isValid = cleanEmail === adminData.email && crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(adminData.passwordHash));

    if (!isValid) {
      loginAttempts.set(clientIp, { count: attempts.count + 1, lastAttempt: Date.now() });
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    // Reset failed attempts on success
    loginAttempts.delete(clientIp);

    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.set(token, { email: adminData.email, createdAt: Date.now() });

    logAudit('LOGIN_SUCCESS', 'Auth', 'Administrator logged in.', adminData.email);

    return res.json({
      success: true,
      token,
      email: adminData.email,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Authentication service temporarily unavailable.' });
  }
});

// 4. Verify Active Session
app.get('/api/admin/verify', requireAdmin, (req, res) => {
  res.json({ valid: true, email: (req as any).adminEmail });
});

// 5. Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// 6. Change Password
app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Valid current password and new password (min 8 chars) are required.' });
  }

  try {
    const adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));
    const currentHash = hashPassword(currentPassword, adminData.salt);

    if (!crypto.timingSafeEqual(Buffer.from(currentHash), Buffer.from(adminData.passwordHash))) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    adminData.salt = newSalt;
    adminData.passwordHash = hashPassword(newPassword, newSalt);
    adminData.updatedAt = new Date().toISOString();

    fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2), 'utf-8');

    logAudit('PASSWORD_CHANGED', 'Auth', 'Administrator password was changed.', adminData.email);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update administrator password.' });
  }
});

// 7. Store Content Management (Banners, Products, Categories, Notices, Settings)
app.get('/api/content', (req, res) => {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
      return res.json(data);
    }
  } catch (err) {
    console.error('Failed reading store file:', err);
  }
  return res.json({ customContentAvailable: false });
});

app.put('/api/admin/content', requireAdmin, (req, res) => {
  try {
    const content = req.body;
    content.lastUpdated = new Date().toISOString();
    content.updatedBy = (req as any).adminEmail;

    const tempFile = `${STORE_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(content, null, 2), 'utf-8');
    fs.renameSync(tempFile, STORE_FILE);

    logAudit('CONTENT_UPDATE', 'Content', 'Full storefront and app content updated.', (req as any).adminEmail);

    res.json({ success: true, lastUpdated: content.lastUpdated });
  } catch (err) {
    console.error('Failed writing store file:', err);
    res.status(500).json({ error: 'Failed to save content updates.' });
  }
});

// 8. Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, (req, res) => {
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      const logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
      return res.json(logs);
    }
  } catch (err) {
    console.error('Failed reading audit logs:', err);
  }
  return res.json([]);
});

// 9. Media Management & Uploads
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/admin/media', requireAdmin, (req, res) => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    const mediaList = files.map((file) => {
      const stat = fs.statSync(path.join(UPLOAD_DIR, file));
      return {
        name: file,
        url: `/uploads/${file}`,
        size: stat.size,
        createdAt: stat.birthtime.toISOString(),
      };
    });
    res.json(mediaList);
  } catch (err) {
    res.json([]);
  }
});

app.post('/api/admin/upload', requireAdmin, (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image format' });
    }

    const mimeType = matches[1];
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(mimeType)) {
      return res.status(400).json({ error: 'Only JPG, PNG, WEBP, or GIF images are allowed.' });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 5MB limit.' });
    }

    const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
    const safeName = `media_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
    const targetPath = path.join(UPLOAD_DIR, safeName);
    fs.writeFileSync(targetPath, buffer);

    logAudit('MEDIA_UPLOAD', 'Media', `Uploaded image ${safeName} (${(buffer.length / 1024).toFixed(1)} KB)`, (req as any).adminEmail);

    return res.status(201).json({
      success: true,
      url: `/uploads/${safeName}`,
      name: safeName,
      size: buffer.length,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process file upload.' });
  }
});

app.delete('/api/admin/media/:filename', requireAdmin, (req, res) => {
  try {
    const safeName = path.basename(req.params.filename);
    const targetPath = path.join(UPLOAD_DIR, safeName);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      logAudit('MEDIA_DELETE', 'Media', `Deleted image ${safeName}`, (req as any).adminEmail);
      return res.json({ success: true });
    }
    return res.status(404).json({ error: 'File not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// ==================== VITE MIDDLEWARE / STATIC SERVING ====================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arafat Mart server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
