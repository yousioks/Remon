import { Request, Response, NextFunction } from 'express';
import http from 'http';
import https from 'https';
import crypto from 'crypto';

// ─── Configuration ───────────────────────────────────────────────────────
const MISTRAL_SERVER_URL = process.env.MISTRAL_SERVER_URL || 'http://localhost:8080';
const WAF_LOG_LEVEL = process.env.WAF_LOG_LEVEL || 'info';

const bannedIps = new Set<string>();

function updateBannedIps() {
  try {
    const url = new URL(`${MISTRAL_SERVER_URL}/api/quarantine?waf_ping=true&waf_host=raemon.ru`);
    const client = url.protocol === 'https:' ? https : http;
    const options = url.protocol === 'https:' ? { rejectUnauthorized: false } : {};
    client.get(url.toString(), options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            bannedIps.clear();
            list.forEach((item: any) => {
              if (item.ip) {
                bannedIps.add(item.ip.replace(/^::ffff:/, '').trim());
              }
            });
          }
        } catch (_) {}
      });
    }).on('error', () => {});
  } catch (_) {}
}

setInterval(updateBannedIps, 4000);
updateBannedIps();

// In-memory request counters for DDoS/brute-force detection
const ipCounters: Record<string, { count: number; windowStart: number; reported?: boolean }> = {};
const IP_WINDOW_MS = 60_000; // 1 minute
const IP_THRESHOLD = 300; // requests per minute
const SUSPICIOUS_PATTERNS = [
  // SQL Injection
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
  /((\%27)|(\'))union/i,
  /exec\s*\(/i,
  /SELECT\s+.*\s+FROM/i,
  /INSERT\s+INTO/i,
  /DELETE\s+FROM/i,
  /DROP\s+TABLE/i,
  /UNION\s+SELECT/i,
  /'\s*OR\s*'1'\s*=\s*'1/i,
  /1\s*=\s*1/i,
  /;\s*--/i,
  /\/\*!/i,

  // XSS
  /((\%3C)|<)[^\n]+((\%3E)|>)/i,
  /<(script|iframe|object|embed|form|input|img|svg|body|style|link)/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /alert\s*\(/i,
  /document\.cookie/i,
  /window\.location/i,
  /<script[^>]*>.*?<\/script>/i,

  // Path Traversal
  /\.\./i,
  /%2e%2e/i,
  /\.%00/i,
  /\\x00/i,

  // Command Injection
  /[;&|`]\s*(cat|ls|pwd|whoami|nc|wget|curl|bash|sh|python|perl|ruby)/i,
  /\$\(.*\)/i,
  /`.*`/i,
];

const SENSITIVE_ENDPOINTS = [
  '/api/admin/debug',
  '/api/admin/users',
  '/api/admin/apartments',
  '/api/auth/login',
  '/api/auth/register',
];

// ─── Helper: send attack report to MISTRAL Server ───────────────────────
async function reportAttack(data: {
  type: string;
  sourceIp: string;
  path: string;
  method: string;
  payload?: string;
  severity: string;
  details?: Record<string, any>;
}) {
  try {
    const payload = JSON.stringify(data);
    const url = new URL(`${MISTRAL_SERVER_URL}/api/attack-detected`);
    const client = url.protocol === 'https:' ? https : http;
    const options: any = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      rejectUnauthorized: false
    };

    const req = client.request(options, (res) => {      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (WAF_LOG_LEVEL === 'debug') {
          console.log(`[MISTRAL-WAF] Report sent: ${res.statusCode}`, data);
        }
      });
    });

    req.on('error', (err) => {
      console.error('[MISTRAL-WAF] Failed to report attack:', err.message);
    });

    req.write(payload);
    req.end();
  } catch (err) {
    console.error('[MISTRAL-WAF] Report error:', err);
  }
}

// ─── Helper: check request for attack patterns ──────────────────────────
function checkAttackPatterns(req: Request): { detected: boolean; type: string; payload: string; severity: string } | null {
  const path = req.path || req.url || '';
  const query = JSON.stringify(req.query);
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  const combined = `${path} ${query} ${body}`;

  // SQL Injection
  for (const pattern of SUSPICIOUS_PATTERNS.slice(0, 14)) {
    if (pattern.test(combined)) {
      const match = combined.match(pattern);
      return {
        detected: true,
        type: 'SQL_INJECTION',
        payload: match ? match[0] : combined.slice(0, 200),
        severity: 'CRITICAL',
      };
    }
  }

  // XSS
  for (const pattern of SUSPICIOUS_PATTERNS.slice(14, 22)) {
    if (pattern.test(combined)) {
      const match = combined.match(pattern);
      return {
        detected: true,
        type: 'XSS',
        payload: match ? match[0] : combined.slice(0, 200),
        severity: 'HIGH',
      };
    }
  }

  // Path Traversal
  for (const pattern of SUSPICIOUS_PATTERNS.slice(22, 26)) {
    if (pattern.test(path)) {
      return {
        detected: true,
        type: 'PATH_TRAVERSAL',
        payload: path,
        severity: 'HIGH',
      };
    }
  }

  // Command Injection
  for (const pattern of SUSPICIOUS_PATTERNS.slice(26)) {
    if (pattern.test(combined)) {
      const match = combined.match(pattern);
      return {
        detected: true,
        type: 'COMMAND_INJECTION',
        payload: match ? match[0] : combined.slice(0, 200),
        severity: 'CRITICAL',
      };
    }
  }

  // Debug endpoint access (always logged, elevated to alert after multiple accesses)
  if (path.includes('/api/admin/debug')) {
    return {
      detected: true,
      type: 'DEBUG_ENDPOINT_ACCESS',
      payload: path,
      severity: 'MEDIUM',
    };
  }

  return null;
}

// ─── Helper: DDoS / brute-force detection ───────────────────────────────
function checkRateAnomaly(ip: string): { detected: boolean; type: string; severity: string; count: number } | null {
  const now = Date.now();
  if (!ipCounters[ip] || now - ipCounters[ip].windowStart > IP_WINDOW_MS) {
    ipCounters[ip] = { count: 1, windowStart: now, reported: false };
    return null;
  }

  ipCounters[ip].count++;

  if (ipCounters[ip].count > IP_THRESHOLD && !ipCounters[ip].reported) {
    ipCounters[ip].reported = true;
    return {
      detected: true,
      type: 'DDOS_BRUTEFORCE',
      severity: 'HIGH',
      count: ipCounters[ip].count,
    };
  }

  return null;
}

// ─── Helper: detect IDOR / suspicious admin activity ────────────────────
function checkSuspiciousActivity(req: Request): { detected: boolean; type: string; severity: string; details: any } | null {
  const path = req.path || '';

  // Check for direct access to admin endpoints without proper headers/session
  if (path.startsWith('/api/admin/') && !path.includes('/debug')) {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ') && req.method !== 'GET') {
      return {
        detected: true,
        type: 'ADMIN_ENDPOINT_NO_AUTH',
        severity: 'HIGH',
        details: { path, method: req.method },
      };
    }
  }

  // Mass assignment detection (sudden role/status changes)
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const body = req.body || {};
    if (body.role !== undefined || body.status !== undefined || body.is_admin !== undefined) {
      return {
        detected: true,
        type: 'MASS_ASSIGNMENT_ATTEMPT',
        severity: 'CRITICAL',
        details: { path, fields: Object.keys(body).filter(k => ['role', 'status', 'is_admin'].includes(k)) },
      };
    }
  }

  return null;
}

// ─── Main WAF Middleware ────────────────────────────────────────────────
export function mistralWAF(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.ip || req.socket.remoteAddress || 'unknown').toString().replace(/^::ffff:/, '').trim();
  const path = req.path || req.url || '/';
  const method = req.method || 'GET';

  // 0. Check if IP is in quarantine
  if (bannedIps.has(ip)) {
    console.error(`[MISTRAL-WAF] 🚫 Access blocked: IP ${ip} is in quarantine.`);
    
    // Report quarantined block to MISTRAL Server (low severity log registry)
    reportAttack({
      type: 'BLOCKED_REQUEST',
      sourceIp: ip,
      path,
      method,
      severity: 'LOW',
      payload: `Доступ заблокирован для IP в карантине: ${ip}`,
      details: { note: 'Blocked by WAF quarantine check' }
    });

    res.status(403).json({
      error: 'Доступ заблокирован: Ваш IP-адрес находится в карантине MISTRAL Defense',
      incident: 'IP_QUARANTINED',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 1. Check attack patterns
  const attack = checkAttackPatterns(req);
  if (attack) {
    console.error(`[MISTRAL-WAF] 🚨 ${attack.type} detected from ${ip} on ${path}: ${attack.payload}`);

    reportAttack({
      type: attack.type,
      sourceIp: ip,
      path,
      method,
      payload: attack.payload,
      severity: attack.severity,
      details: {
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
      },
    });

    // For critical attacks, block the request
    if (attack.severity === 'CRITICAL') {
      res.status(403).json({
        error: 'Запрос заблокирован системой безопасности',
        incident: attack.type,
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }

  // 2. Check rate anomalies
  const rateAlert = checkRateAnomaly(ip);
  if (rateAlert) {
    console.warn(`[MISTRAL-WAF] ⚠️ Rate anomaly from ${ip}: ${rateAlert.count} req/min`);

    reportAttack({
      type: rateAlert.type,
      sourceIp: ip,
      path,
      method,
      severity: rateAlert.severity,
      details: { count: rateAlert.count, window: IP_WINDOW_MS },
    });
  }

  // 3. Check suspicious activity
  const suspicious = checkSuspiciousActivity(req);
  if (suspicious) {
    console.warn(`[MISTRAL-WAF] ⚠️ Suspicious activity: ${suspicious.type} from ${ip}`);

    reportAttack({
      type: suspicious.type,
      sourceIp: ip,
      path,
      method,
      severity: suspicious.severity,
      details: suspicious.details,
    });
  }

  // 4. Log sensitive endpoint access for audit trail
  if (SENSITIVE_ENDPOINTS.some(ep => path.includes(ep))) {
    reportAttack({
      type: 'SENSITIVE_ENDPOINT_ACCESS',
      sourceIp: ip,
      path,
      method,
      severity: 'LOW',
      details: { endpoint: path, userAgent: req.headers['user-agent'] },
    });
  }

  next();
}

// ─── Cleanup old IP counters periodically ────────────────────────────────
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const ip of Object.keys(ipCounters)) {
    if (now - ipCounters[ip].windowStart > IP_WINDOW_MS * 5) {
      delete ipCounters[ip];
      cleaned++;
    }
  }
  if (cleaned > 0 && WAF_LOG_LEVEL === 'debug') {
    console.log(`[MISTRAL-WAF] Cleaned ${cleaned} stale IP counters`);
  }
}, IP_WINDOW_MS * 2);

export default mistralWAF;
